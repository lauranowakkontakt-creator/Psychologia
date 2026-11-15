"""Skleja src/ + data/ w jeden samodzielny plik dist/index.html."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
src, data = root / "src", root / "data"
t = (src / "template.html").read_text(encoding="utf-8")
geo = (data / "geo.json").read_text(encoding="utf-8")
en = (data / "enigma.json").read_text(encoding="utf-8")
t = (t.replace("/*DATA*/", (src / "data.js").read_text(encoding="utf-8") + "\n" + (src / "meaning.js").read_text(encoding="utf-8"))
      .replace("/*GEO*/", "const GEO=" + geo + ";\nconst ENIGMA=" + en + ";")
      .replace("/*EXTRAS*/", (src / "extras.js").read_text(encoding="utf-8"))
      .replace("/*APP*/", (src / "app.js").read_text(encoding="utf-8")))
out = root / "dist" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(t, encoding="utf-8")
print(f"{out} ({out.stat().st_size // 1024} KB)")
import shutil
# three.js leży obok strony (lib/), żeby atlas działał offline i bez CDN
shutil.copytree(root / "lib", out.parent / "lib", dirs_exist_ok=True)
# kopia do aplikacji Psycho (ekran #/atlas ładuje public/atlas/index.html)
app_public = root.parent / "public" / "atlas"
if app_public.parent.exists():
    app_public.mkdir(exist_ok=True)
    (app_public / "index.html").write_text(out.read_text(encoding="utf-8"), encoding="utf-8")
    shutil.copytree(root / "lib", app_public / "lib", dirs_exist_ok=True)
    print(f"skopiowano do {app_public / 'index.html'}")
