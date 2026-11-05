"""Gera um HTML autossuficiente e um ZIP do código, usando apenas Python padrão."""
from pathlib import Path
import argparse
import base64
import re
import shutil
import zipfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--saida", type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    output = args.saida.resolve()
    output.mkdir(parents=True, exist_ok=True)

    html = (root / "dist/index.html").read_text(encoding="utf-8")
    css = (root / "dist/styles.css").read_text(encoding="utf-8")
    js = (root / "dist/app.js").read_text(encoding="utf-8")
    logo = base64.b64encode((root / "dist/assets/clareia-logo.png").read_bytes()).decode("ascii")
    js = js.replace("'assets/clareia-logo.png'", f"'data:image/png;base64,{logo}'")

    # A cópia única funciona sem os arquivos auxiliares mobile.html e ZIP.
    links = r'<div class="stack"><a class="btn full" href="mobile\.html".*?</div>'
    js, count = re.subn(links, '<p class="small muted">Esta cópia reúne HTML, CSS, JavaScript e logo em um único arquivo. Redimensione a janela ou abra no celular para conferir o layout responsivo.</p>', js)
    if count != 1:
        raise ValueError("Não foi possível adaptar os links auxiliares do HTML único.")

    html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n</style>")
    html = html.replace('  <script src="app.js" defer></script>\n', "")
    # No fim do body, os elementos do DOM já existem quando o script executa.
    js = re.sub(r"</script", r"<\\/script", js, flags=re.IGNORECASE)
    html = html.replace("</body>", f"<script>\n{js}\n</script>\n</body>")
    (output / "index.html").write_text(html, encoding="utf-8")

    guide = root / "docs/EXPLICACAO_DO_CODIGO.md"
    shutil.copy2(guide, output / guide.name)
    archive = root / "dist/clareia-prototipo-a3.zip"
    # Exclui os ZIPs para o pacote não incluir uma cópia de si mesmo.
    files = [root / "README.md"]
    for directory in ("dist", "docs", "scripts"):
        files.extend(p for p in (root / directory).rglob("*")
                     if p.is_file() and p.suffix != ".zip" and "__pycache__" not in p.parts)
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for file in sorted(files):
            bundle.write(file, file.relative_to(root).as_posix())
    shutil.copy2(archive, output / archive.name)
    print(f"Entregáveis gerados em {output}")


if __name__ == "__main__":
    main()
