'use client'

/**
 * StratosCore Landing — Scroll-Driven 3D Animation
 * Basado en el skill website-3d
 * Técnica: Frame sequence + Canvas (estilo Apple)
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Calendar, Target, TrendingUp, Zap, BrainCircuit, CheckCircle2 } from 'lucide-react';

// Logo StratosCore
const StratoscoreLogo = ({ className = "w-48 h-auto" }: { className?: string }) => (
  <svg viewBox="0 0 220 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <polyline points="4,10 18,28 4,46" stroke="#00F2FE" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <polyline points="13,18 22,28 13,38" stroke="#00F2FE" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <text x="34" y="29" dominantBaseline="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" fontWeight="700" fontSize="22" letterSpacing="1.5" fill="currentColor">
      STRATOSCORE
    </text>
  </svg>
);

// Frame URLs — Imágenes placeholder que narran la transformación
const FRAMES = [
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1920&q=90', // Calendario vacío/stress
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1920&q=90', // Notificaciones/leads
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=90', // AI interface
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=90', // Dashboard
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=90', // Analytics subiendo
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=90', // Agenda llena
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&q=90', // AI agents trabajando
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1920&q=90', // Dueño feliz
];

// Annotation cards con copy AIDA
const ANNOTATIONS = [
  { showAt: 0.15, hideAt: 0.25, title: 'Agendas Vacías', stat: '60%', subtitle: 'de las clínicas pierden ingresos por falta de pacientes' },
  { showAt: 0.30, hideAt: 0.40, title: 'Leads Automatizados', stat: '24/7', subtitle: 'captura inteligente desde WhatsApp, Web y Redes' },
  { showAt: 0.45, hideAt: 0.55, title: 'IA Califica', stat: '10x', subtitle: 'más rápido que una recepcionista tradicional' },
  { showAt: 0.60, hideAt: 0.70, title: 'Auto-Agendamiento', stat: '0', subtitle: 'intervención humana necesaria para agendar' },
  { showAt: 0.75, hideAt: 0.85, title: 'Dashboard en Vivo', stat: '+185%', subtitle: 'incremento promedio en citas confirmadas' },
];

export default function ScrollLandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<typeof ANNOTATIONS[0] | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  // Preload frames
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    FRAMES.forEach((src, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / FRAMES.length) * 100));
        if (loaded === FRAMES.length) {
          imagesRef.current = images;
          setLoading(false);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load frame ${idx}`);
        loaded++;
        setLoadProgress(Math.round((loaded / FRAMES.length) * 100));
        if (loaded === FRAMES.length) {
          imagesRef.current = images;
          setLoading(false);
        }
      };
      img.src = src;
      images[idx] = img;
    });
  }, []);

  // Scroll progress → Frame mapping
  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ticking = false;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawFrame = (frameIndex: number) => {
      if (frameIndex === currentFrameRef.current) return;
      currentFrameRef.current = frameIndex;

      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const canvasW = canvas.width / window.devicePixelRatio;
      const canvasH = canvas.height / window.devicePixelRatio;

      // Cover-fit en desktop, contain-fit con zoom en mobile
      const isMobile = window.innerWidth < 768;
      const scale = isMobile
        ? Math.min(canvasW / img.width, canvasH / img.height) * 1.2
        : Math.max(canvasW / img.width, canvasH / img.height);

      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvasW - w) / 2;
      const y = (canvasH - h) / 2;

      ctx.drawImage(img, x, y, w, h);
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollAnimSection = document.getElementById('scroll-animation');
        if (!scrollAnimSection) {
          ticking = false;
          return;
        }

        const rect = scrollAnimSection.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const viewportHeight = window.innerHeight;

        // Progress: 0 (top enters viewport) → 1 (bottom exits viewport)
        const rawProgress = (viewportHeight - sectionTop) / (sectionHeight + viewportHeight);
        const progress = Math.max(0, Math.min(1, rawProgress));

        // Map progress to frame index
        const frameIndex = Math.min(
          FRAMES.length - 1,
          Math.floor(progress * FRAMES.length)
        );

        drawFrame(frameIndex);

        // Update annotation visibility
        const activeAnnotation = ANNOTATIONS.find(
          (ann) => progress >= ann.showAt && progress < ann.hideAt
        );
        setCurrentAnnotation(activeAnnotation || null);

        // Navbar scroll state
        setScrolled(window.scrollY > 50);

        ticking = false;
      });
    };

    resizeCanvas();
    handleScroll(); // Initial draw
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [loading]);

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Starscape Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0A1929] via-[#0A1929]/90 to-[#0A1929] -z-20" />

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-[#0A1929] flex flex-col items-center justify-center">
          <StratoscoreLogo className="w-64 h-auto text-white mb-12 animate-pulse" />
          <div className="text-cyan-500 font-black text-sm tracking-[0.3em] uppercase mb-6">
            Cargando Experiencia
          </div>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 shadow-[0_0_20px_rgba(0,242,254,0.5)]"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <div className="text-white/40 text-xs mt-4 font-mono">{loadProgress}%</div>
        </div>
      )}

      {/* Scroll Progress Bar */}
      {!loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.6)] transition-all duration-100"
            style={{
              width: `${(window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Navbar — Transform to pill on scroll */}
      <nav
        className={`fixed w-full z-40 transition-all duration-500 ${
          scrolled
            ? 'top-4'
            : 'top-0'
        }`}
      >
        <div
          className={`mx-auto px-6 py-4 flex justify-between items-center transition-all duration-500 ${
            scrolled
              ? 'max-w-[820px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl'
              : 'max-w-full bg-transparent'
          }`}
        >
          <StratoscoreLogo className="w-40 h-auto text-white" />
          <button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,242,254,0.4)]">
            Reservar Cita
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 text-white">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-cyan-500/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-8">
            <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500" />
            <span className="text-[10px] font-black tracking-[0.25em] text-cyan-200 uppercase">
              Agencia Agéntica 360
            </span>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-10">
            ¿CANSADO DE<br />
            <span className="text-cyan-500 italic">AGENDAS VACÍAS?</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transformamos clínicas y PYMEs con <span className="text-cyan-500 font-bold">sistemas autónomos de IA</span> que capturan leads, califican pacientes y llenan tu agenda 24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <button className="group bg-white text-black px-12 py-6 rounded-sm font-black text-xl hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.15)] transform hover:scale-105">
              VER CÓMO FUNCIONA
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="mt-20 text-xs text-gray-500 uppercase tracking-[0.2em] animate-bounce">
            ↓ Scroll para ver la transformación ↓
          </div>
        </div>
      </section>

      {/* Scroll Animation Section — Canvas + Annotation Cards */}
      <section id="scroll-animation" className="relative h-[400vh]">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          {/* Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

          {/* Annotation Card */}
          {currentAnnotation && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-xl w-full px-6 animate-fade-in">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="text-6xl font-black text-cyan-500 leading-none">
                      {currentAnnotation.stat}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight uppercase italic">
                      {currentAnnotation.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {currentAnnotation.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Specs Section — Count-up Animation */}
      <section className="py-32 bg-[#0A1929] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 italic uppercase">
              Resultados Reales
            </h2>
            <p className="text-gray-400 text-lg">Datos promedio de nuestros clientes en los primeros 3 meses</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: '+185%', label: 'Citas Confirmadas' },
              { num: '24/7', label: 'Captura Automatizada' },
              { num: '10x', label: 'Velocidad IA vs Humano' },
              { num: '$0', label: 'Leads Perdidos' },
            ].map((spec, i) => (
              <div key={i} className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-cyan-500/50 transition-all group">
                <div className="text-5xl md:text-6xl font-black text-cyan-500 mb-4 group-hover:scale-110 transition-transform">
                  {spec.num}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">
                  {spec.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 italic uppercase underline decoration-cyan-500/30 underline-offset-8">
              Tu Sistema Agéntico
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Auto-Agendamiento',
                desc: 'Los pacientes reservan directamente desde WhatsApp, Facebook o tu web. Sin intermediarios.',
              },
              {
                icon: Target,
                title: 'Calificación Inteligente',
                desc: 'La IA pregunta, clasifica urgencia y filtra. Solo hablas con pacientes listos para agendar.',
              },
              {
                icon: BrainCircuit,
                title: 'Seguimiento Autónomo',
                desc: 'Recordatorios automáticos, re-agendamiento de cancelaciones y nutrición de leads fríos.',
              },
            ].map((feature, i) => (
              <div key={i} className="group p-10 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl hover:border-cyan-500/50 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-all group-hover:scale-110">
                  <feature.icon className="text-cyan-500 group-hover:text-white w-8 h-8" />
                </div>
                <h4 className="text-3xl font-black mb-4 tracking-tight italic uppercase">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final — FOMO + Urgencia */}
      <section className="py-40 bg-gradient-to-b from-[#0A1929] to-cyan-500/10 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/20 blur-[200px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-red-500/20 border border-red-500/50 mb-10">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-black tracking-[0.25em] text-red-300 uppercase">
              Últimos 3 cupos de Marzo
            </span>
          </div>

          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] italic uppercase">
            EMPIEZA HOY,<br />
            AGENDA LLENA EN 30 DÍAS
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Mientras lees esto, tu competencia ya está automatizando. <span className="text-cyan-500 font-bold">No esperes más.</span>
          </p>

          <button className="group bg-cyan-500 text-black px-16 py-8 rounded-sm font-black text-3xl hover:bg-white transition-all transform hover:scale-110 shadow-[0_0_100px_rgba(0,242,254,0.4)] uppercase tracking-widest">
            RESERVAR MI CUPO
            <ArrowRight className="inline-block ml-4 w-8 h-8 group-hover:translate-x-3 transition-transform" />
          </button>

          <div className="mt-12 flex items-center justify-center gap-3 text-sm text-gray-500">
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            <span>Setup en 48 horas</span>
            <span className="text-gray-700">•</span>
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            <span>Sin contratos largos</span>
            <span className="text-gray-700">•</span>
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            <span>Garantía de resultados</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#0A1929] border-t border-white/10 text-white px-6">
        <div className="max-w-7xl mx-auto text-center">
          <StratoscoreLogo className="w-48 h-auto mx-auto mb-8 opacity-40" />
          <p className="text-gray-600 text-sm mb-8">
            © 2026 StratosCore — Soluciones Inteligentes. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-8 text-xs text-gray-700 uppercase tracking-widest font-bold">
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">Términos</span>
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">Contacto</span>
          </div>
        </div>
      </footer>

      {/* Tailwind animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
