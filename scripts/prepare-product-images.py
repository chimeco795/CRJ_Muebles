"""Create web copies for one product; never overwrite or delete sources."""
import argparse
import re
from pathlib import Path
from PIL import Image, ImageOps

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--categoria', choices=['tablas', 'muebles', 'montessori'], required=True)
parser.add_argument('--slug', required=True)
parser.add_argument('fotos', nargs='+', type=Path)
args = parser.parse_args()
if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.slug):
    parser.error('El slug debe usar minúsculas, números y guiones, sin acentos.')
root = Path(__file__).resolve().parents[1]
folder = root / 'public/img/products' / args.categoria / args.slug
targets = [folder / ('portada.webp' if i == 0 else f'vista-{i:02d}.webp') for i in range(len(args.fotos))]
for source, target in zip(args.fotos, targets):
    if not source.is_file():
        parser.error(f'No existe la imagen: {source}')
    if target.exists():
        parser.error(f'El destino ya existe; no se sobrescribe: {target}')
folder.mkdir(parents=True, exist_ok=True)
for source, target in zip(args.fotos, targets):
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=84, method=6)
    print(target.relative_to(root).as_posix())
