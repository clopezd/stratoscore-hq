"""
VIDENDUM ML FORECAST ENGINE — MVP
Genera predicciones semanales por SKU usando Prophet (tendencias + estacionalidad)

Author: Claude Code
Date: 2026-03-14
"""

import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from prophet import Prophet
import warnings
warnings.filterwarnings('ignore')

# PostgreSQL
import psycopg2
from psycopg2.extras import execute_values

# ── Config ───────────────────────────────────────────────────────────────────

DB_URL = os.getenv('DATABASE_URL')  # Supabase connection string
if not DB_URL:
    raise ValueError("DATABASE_URL env variable no configurada")

# ── Helpers DB ───────────────────────────────────────────────────────────────

def get_connection():
    """Conexión a Supabase Postgres"""
    return psycopg2.connect(DB_URL)

def fetch_sku_historical_data(sku: str, months_back: int = 24) -> pd.DataFrame:
    """
    Extrae datos históricos de un SKU desde videndum_full_context

    Returns DataFrame con columnas: ds (fecha), y (revenue), order_book, opportunities
    """
    query = """
        SELECT
            TO_DATE(year::text || '-' || LPAD(month::text, 2, '0') || '-01', 'YYYY-MM-DD') AS ds,
            SUM(revenue_qty) AS y,
            SUM(order_book_qty) AS order_book,
            SUM(opportunities_qty) AS opportunities
        FROM public.videndum_full_context
        WHERE part_number = %s
          AND month IS NOT NULL
          AND year IS NOT NULL
          AND TO_DATE(year::text || '-' || LPAD(month::text, 2, '0') || '-01', 'YYYY-MM-DD')
              >= CURRENT_DATE - INTERVAL '%s months'
        GROUP BY year, month
        ORDER BY year, month
    """

    with get_connection() as conn:
        df = pd.read_sql(query, conn, params=(sku, months_back))

    if df.empty:
        raise ValueError(f"No hay datos históricos para SKU {sku}")

    df['ds'] = pd.to_datetime(df['ds'])
    df['y'] = pd.to_numeric(df['y'], errors='coerce').fillna(0)
    df['order_book'] = pd.to_numeric(df['order_book'], errors='coerce').fillna(0)
    df['opportunities'] = pd.to_numeric(df['opportunities'], errors='coerce').fillna(0)

    return df

def get_top_skus(limit: int = 20) -> List[str]:
    """Retorna los Top N SKUs por revenue 2024"""
    query = """
        SELECT part_number
        FROM public.videndum_records
        WHERE metric_type = 'revenue' AND year = 2024
        GROUP BY part_number
        ORDER BY SUM(quantity) DESC
        LIMIT %s
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (limit,))
            return [row[0] for row in cur.fetchall()]

def save_prediction_to_db(pred: Dict):
    """Guarda una predicción en ml_forecast_predictions"""
    query = """
        INSERT INTO public.ml_forecast_predictions (
            sku, week, week_start_date,
            ml_prediction, ml_confidence_low, ml_confidence_high,
            trend_factor, seasonality_factor, competition_factor, pipeline_factor,
            model_version, model_type, anomaly_score, confidence_score
        ) VALUES %s
        ON CONFLICT (sku, week) DO UPDATE SET
            ml_prediction = EXCLUDED.ml_prediction,
            ml_confidence_low = EXCLUDED.ml_confidence_low,
            ml_confidence_high = EXCLUDED.ml_confidence_high,
            trend_factor = EXCLUDED.trend_factor,
            seasonality_factor = EXCLUDED.seasonality_factor,
            competition_factor = EXCLUDED.competition_factor,
            pipeline_factor = EXCLUDED.pipeline_factor,
            model_version = EXCLUDED.model_version,
            anomaly_score = EXCLUDED.anomaly_score,
            confidence_score = EXCLUDED.confidence_score,
            updated_at = NOW()
    """

    values = [(
        pred['sku'], pred['week'], pred['week_start_date'],
        pred['ml_prediction'], pred['ml_confidence_low'], pred['ml_confidence_high'],
        pred['trend_factor'], pred['seasonality_factor'], pred['competition_factor'], pred['pipeline_factor'],
        pred['model_version'], pred['model_type'], pred['anomaly_score'], pred['confidence_score']
    )]

    with get_connection() as conn:
        with conn.cursor() as cur:
            execute_values(cur, query, values)
        conn.commit()

# ── Prophet Model ────────────────────────────────────────────────────────────

def train_prophet_model(df: pd.DataFrame, sku: str) -> Prophet:
    """
    Entrena modelo Prophet con datos históricos

    Features:
    - Tendencia automática (linear/logistic)
    - Estacionalidad mensual + anual
    - Regresores: order_book, opportunities (pipeline signals)
    """

    # Preparar datos
    df_train = df[['ds', 'y']].copy()

    # Agregar regresores si existen
    add_regress = False
    if 'order_book' in df.columns and df['order_book'].sum() > 0:
        df_train['order_book'] = df['order_book']
        add_regress = True

    # Inicializar Prophet
    model = Prophet(
        growth='linear',                # tendencia linear (o 'logistic' para saturación)
        yearly_seasonality=True,        # estacionalidad anual
        weekly_seasonality=False,       # no necesitamos semanal (datos mensuales)
        daily_seasonality=False,
        changepoint_prior_scale=0.05,   # sensibilidad a cambios de tendencia
        seasonality_prior_scale=10.0,   # fuerza de estacionalidad
        interval_width=0.95             # intervalo de confianza 95%
    )

    # Agregar estacionalidad mensual custom
    model.add_seasonality(name='monthly', period=30.5, fourier_order=5)

    # Agregar regresores
    if add_regress:
        model.add_regressor('order_book', prior_scale=0.5)

    # Entrenar
    model.fit(df_train)

    return model

def generate_weekly_forecast(model: Prophet, df_historical: pd.DataFrame,
                            sku: str, weeks_ahead: int = 4) -> List[Dict]:
    """
    Genera forecast semanal para las próximas N semanas

    Returns: Lista de dicts con predicciones por semana
    """

    # Crear dataframe futuro (mensual, luego lo convertimos a semanal)
    last_date = df_historical['ds'].max()
    future_months = model.make_future_dataframe(periods=3, freq='MS')  # 3 meses adelante

    # Agregar regresores futuros (usamos promedio de últimos 3 meses)
    if 'order_book' in df_historical.columns:
        recent_ob = df_historical['order_book'].tail(3).mean()
        future_months['order_book'] = recent_ob

    # Forecast
    forecast = model.predict(future_months)

    # Convertir forecast mensual a semanal
    predictions = []

    # Calcular promedio mensual histórico para baseline
    monthly_avg = df_historical['y'].mean()

    # Últimos 12 meses para calcular tendencia
    recent_12m = df_historical.tail(12)
    if len(recent_12m) >= 2:
        trend_pct = (recent_12m['y'].iloc[-1] - recent_12m['y'].iloc[0]) / recent_12m['y'].iloc[0] if recent_12m['y'].iloc[0] > 0 else 0
    else:
        trend_pct = 0

    # Generar predicciones semanales
    for week_num in range(1, weeks_ahead + 1):
        # Fecha de inicio de semana (próximo lunes)
        today = datetime.now().date()
        days_until_monday = (7 - today.weekday()) % 7  # días hasta próximo lunes
        week_start = today + timedelta(days=days_until_monday + (week_num - 1) * 7)

        # ISO week format
        iso_year, iso_week, _ = week_start.isocalendar()
        week_str = f"{iso_year}-W{iso_week:02d}"

        # Buscar forecast mensual correspondiente
        month_forecast = forecast[forecast['ds'] >= pd.Timestamp(week_start)].iloc[0] if len(forecast) > 0 else None

        if month_forecast is None:
            continue

        # Convertir mensual a semanal (asumiendo ~4.33 semanas/mes)
        weekly_pred = month_forecast['yhat'] / 4.33
        weekly_lower = month_forecast['yhat_lower'] / 4.33
        weekly_upper = month_forecast['yhat_upper'] / 4.33

        # Calcular factores
        seasonality_component = month_forecast.get('yearly', 0) + month_forecast.get('monthly', 0)
        seasonality_factor = (seasonality_component / monthly_avg * 100) if monthly_avg > 0 else 0

        pipeline_component = month_forecast.get('order_book', 0) if 'order_book' in month_forecast else 0
        pipeline_factor = (pipeline_component / monthly_avg * 100) if monthly_avg > 0 and pipeline_component != 0 else 0

        # Anomaly score simplificado (basado en ancho del intervalo)
        interval_width = weekly_upper - weekly_lower
        expected_width = weekly_pred * 0.4  # esperamos ~40% de ancho
        anomaly_score = min(abs(interval_width - expected_width) / expected_width, 1.0) if expected_width > 0 else 0

        # Confidence score (inverso del CV del intervalo)
        confidence_score = max(0.5, 1.0 - (interval_width / weekly_pred) if weekly_pred > 0 else 0.5)

        predictions.append({
            'sku': sku,
            'week': week_str,
            'week_start_date': week_start.isoformat(),
            'ml_prediction': max(0, round(weekly_pred, 0)),
            'ml_confidence_low': max(0, round(weekly_lower, 0)),
            'ml_confidence_high': max(0, round(weekly_upper, 0)),
            'trend_factor': round(trend_pct * 100, 1),
            'seasonality_factor': round(seasonality_factor, 1),
            'competition_factor': 0,  # TODO: integrar con radar competitivo
            'pipeline_factor': round(pipeline_factor, 1),
            'model_version': 'mvp-v1.0',
            'model_type': 'prophet',
            'anomaly_score': round(anomaly_score, 2),
            'confidence_score': round(confidence_score, 2)
        })

    return predictions

# ── Main Pipeline ────────────────────────────────────────────────────────────

def run_forecast_for_sku(sku: str, weeks_ahead: int = 4, save_to_db: bool = True) -> List[Dict]:
    """
    Pipeline completo: extrae datos, entrena modelo, genera forecast, guarda en DB
    """
    print(f"[{sku}] Extrayendo datos históricos...")
    df = fetch_sku_historical_data(sku, months_back=24)

    if len(df) < 6:
        print(f"[{sku}] ⚠️ Pocos datos ({len(df)} meses). Mínimo 6 meses requerido.")
        return []

    print(f"[{sku}] Entrenando modelo Prophet...")
    model = train_prophet_model(df, sku)

    print(f"[{sku}] Generando forecast {weeks_ahead} semanas...")
    predictions = generate_weekly_forecast(model, df, sku, weeks_ahead)

    if save_to_db and predictions:
        print(f"[{sku}] Guardando {len(predictions)} predicciones en DB...")
        for pred in predictions:
            save_prediction_to_db(pred)

    print(f"[{sku}] ✓ Completado ({len(predictions)} semanas forecast)")
    return predictions

def run_forecast_all_top_skus(top_n: int = 20, weeks_ahead: int = 4):
    """
    Ejecuta forecast para los Top N SKUs
    """
    print(f"\n{'='*60}")
    print(f"ML FORECAST ENGINE — MVP v1.0")
    print(f"{'='*60}\n")

    skus = get_top_skus(limit=top_n)
    print(f"📊 {len(skus)} SKUs a procesar\n")

    results = []
    errors = []

    for i, sku in enumerate(skus, 1):
        print(f"\n[{i}/{len(skus)}] Procesando {sku}...")
        try:
            preds = run_forecast_for_sku(sku, weeks_ahead=weeks_ahead, save_to_db=True)
            results.append({sku: len(preds)})
        except Exception as e:
            print(f"[{sku}] ❌ Error: {e}")
            errors.append({sku: str(e)})

    print(f"\n{'='*60}")
    print(f"RESUMEN")
    print(f"{'='*60}")
    print(f"✓ Exitosos: {len(results)}/{len(skus)}")
    print(f"❌ Errores: {len(errors)}")
    if errors:
        print(f"\nErrores:")
        for err in errors:
            print(f"  - {list(err.keys())[0]}: {list(err.values())[0]}")
    print(f"\n")

# ── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        # Modo single SKU
        sku = sys.argv[1]
        weeks = int(sys.argv[2]) if len(sys.argv) > 2 else 4

        print(f"\n🎯 Forecast para {sku} — {weeks} semanas\n")
        preds = run_forecast_for_sku(sku, weeks_ahead=weeks, save_to_db=True)

        print(f"\n{'='*60}")
        print("PREDICCIONES:")
        print(f"{'='*60}")
        for p in preds:
            print(f"\n  Semana: {p['week']} ({p['week_start_date']})")
            print(f"  Forecast: {p['ml_prediction']:.0f} unidades")
            print(f"  Rango 95%: [{p['ml_confidence_low']:.0f}, {p['ml_confidence_high']:.0f}]")
            print(f"  Tendencia: {p['trend_factor']:+.1f}% | Estacionalidad: {p['seasonality_factor']:+.1f}%")
            print(f"  Confianza: {p['confidence_score']:.0%} | Anomalía: {p['anomaly_score']:.2f}")
    else:
        # Modo batch Top SKUs
        run_forecast_all_top_skus(top_n=20, weeks_ahead=4)
