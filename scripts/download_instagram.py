#!/usr/bin/env python3
"""
Script para descargar imágenes de Instagram
Requiere: pip install instagrapi
"""

import os
import sys
from pathlib import Path
from instagrapi import Client

def download_instagram_profile(username, output_dir="tico_instagram"):
    """
    Descarga todas las imágenes de un perfil de Instagram
    """

    # Crear directorio
    os.makedirs(output_dir, exist_ok=True)

    # Inicializar cliente
    cl = Client()

    try:
        print(f"🔄 Conectando a Instagram...")
        # NOTA: Necesitas credentials válidas para esto
        # cl.login("tu_usuario", "tu_password")

        print(f"📸 Obteniendo perfil: @{username}")
        user = cl.user_info_by_username(username)

        print(f"👤 Nombre: {user.full_name}")
        print(f"📊 Posts: {user.media_count}")
        print(f"📝 Bio: {user.biography}")

        print(f"\n⬇️ Descargando medias...")
        medias = cl.user_medias(user.pk, amount=None)

        for idx, media in enumerate(medias, 1):
            print(f"  [{idx}/{len(medias)}] {media.taken_at}")

            # Descargar imagen/video
            if media.media_type == 1:  # Imagen
                path = cl.photo_download(media.pk, folder=output_dir)
                print(f"    ✓ Imagen guardada")
            elif media.media_type == 2:  # Video
                path = cl.video_download(media.pk, folder=output_dir)
                print(f"    ✓ Video guardado")
            elif media.media_type == 8:  # Carrusel (múltiples)
                for i, item in enumerate(media.resources):
                    if item.media_type == 1:
                        print(f"    ✓ Imagen {i+1} del carrusel")
                    else:
                        print(f"    ✓ Video {i+1} del carrusel")

        print(f"\n✅ Descarga completada en: {output_dir}/")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    download_instagram_profile("ticorestorations")
