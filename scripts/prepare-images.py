"""Create lightweight web copies, preserving every source image unchanged.
Run with Python + Pillow from the repository root.
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
inventory = json.loads((ROOT / 'docs/organizacion-imagenes.json').read_text(encoding='utf-8'))
copies = {
    0: 'products/tablas/tabla-de-madera-con-mango/portada.webp',
    39: 'products/tablas/tabla-de-picar-edge-grain/vista-01.webp',
    42: 'products/tablas-picar/rayas/web/portada.webp',
    36: 'products/tablas/tabla-de-picar-edge-grain/vista-02.webp',
    76: 'products/muebles/organizador-con-cajon/portada.webp',
    81: 'products/muebles/organizador-con-cajon/vista-01.webp',
    83: 'products/muebles/organizador-con-cajon/vista-02.webp',
    79: 'products/muebles/organizador-con-cajon/vista-03.webp',
    49: 'products/muebles/especiero-de-bandejas/portada.webp',
    50: 'products/muebles/especiero-de-bandejas/vista-01.webp',
    46: 'products/muebles/especiero-de-bandejas/vista-02.webp',
    9: 'products/muebles/cama-de-madera-para-mascota/portada.webp',
    10: 'products/muebles/cama-de-madera-para-mascota/vista-01.webp',
    5: 'products/muebles/cama-de-madera-para-mascota/vista-02.webp',
    52: 'products/muebles/mesa-con-insertos/portada.webp',
    55: 'products/muebles/mesa-con-insertos/vista-01.webp',
    93: 'products/tablas/bandeja-de-madera-a-rayas/portada.webp',
}
for index, destination in copies.items():
    source = ROOT / inventory[index]['destino']
    target = ROOT / 'public/img' / destination
    target.parent.mkdir(parents=True, exist_ok=True)
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    image.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
    image.save(target, 'WEBP', quality=84, method=6)

# Use the supplied CRJ artwork, with transparent margins trimmed only.
logo = Image.open(ROOT / inventory[59]['destino']).convert('RGBA')
logo = logo.crop(logo.getbbox())
brand = ROOT / 'public/img/marca'
brand.mkdir(parents=True, exist_ok=True)
logo.save(brand / 'logo-crj.png')
for size in (192, 512):
    canvas = Image.new('RGBA', (size, size), '#f8f6f1')
    mark = ImageOps.contain(logo, (round(size*.7), round(size*.7)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(mark, ((size-mark.width)//2, (size-mark.height)//2))
    canvas.convert('RGB').save(brand / f'icon-{size}.png')
print(f'{len(copies)} web photographs and CRJ logo/icons generated; originals preserved.')
