"""Met à jour data/videos.json avec les dernières vidéos de la chaîne SmartCeltic.
Exécuté par GitHub Actions toutes les 6 heures. Zéro clé API, zéro scraping :
lecture directe du flux RSS officiel de la chaîne (identifiant gravé en dur).
"""
import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

CHANNEL_ID = "UC8wnNfHi1TprmMfVUuWjYNg"  # @SmartCeltic01
SORTIE = "data/videos.json"
UA = {"User-Agent": "Mozilla/5.0 (site smartceltic.fr — mise à jour vidéos)"}


def lire_flux():
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
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
    videos = lire_flux()
    if not videos:
        raise RuntimeError("Flux RSS vide — on ne remplace pas le fichier par du vide.")
    data = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "channel_id": CHANNEL_ID,
        "videos": videos,
    }
    with open(SORTIE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"{len(videos)} vidéos écrites dans {SORTIE}")


if __name__ == "__main__":
    main()
