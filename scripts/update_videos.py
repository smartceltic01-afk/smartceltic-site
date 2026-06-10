"""Met à jour data/videos.json avec les dernières vidéos de la chaîne.
Exécuté par GitHub Actions toutes les 6 heures. Zéro clé API :
on résout l'ID de chaîne depuis le handle public, puis on lit le flux RSS officiel.
"""
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

HANDLE_URL = "https://www.youtube.com/@SmartCeltic01"
SORTIE = "data/videos.json"
UA = {"User-Agent": "Mozilla/5.0 (site smartceltic.fr — mise à jour vidéos)"}


def resoudre_channel_id() -> str:
    req = urllib.request.Request(HANDLE_URL, headers=UA)
    html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    m = re.search(r'"channelId":"(UC[\w-]{22})"', html) or re.search(r"channel_id=(UC[\w-]{22})", html)
    if not m:
        raise RuntimeError("ID de chaîne introuvable dans la page du handle")
    return m.group(1)


def lire_flux(channel_id: str):
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    req = urllib.request.Request(url, headers=UA)
    xml = urllib.request.urlopen(req, timeout=30).read()
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
    racine = ET.fromstring(xml)
    videos = []
    for entry in racine.findall("a:entry", ns):
        videos.append({
            "id": entry.find("yt:videoId", ns).text,
            "title": entry.find("a:title", ns).text,
            "published": entry.find("a:published", ns).text,
        })
    return videos[:6]  # marge : 6 stockées, 3 affichées


def main():
    channel_id = resoudre_channel_id()
    videos = lire_flux(channel_id)
    data = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "channel_id": channel_id,
        "videos": videos,
    }
    with open(SORTIE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"{len(videos)} vidéos écrites dans {SORTIE}")


if __name__ == "__main__":
    main()
