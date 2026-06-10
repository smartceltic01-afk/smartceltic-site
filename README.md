# smartceltic.fr — le QG du Clan Celte

Site statique hébergé gratuitement sur **GitHub Pages**, branché sur le domaine **smartceltic.fr** (OVH).
News RPG sourcées (Confirmé 🟢 / Rumeur 🟡 / Démenti 🔴), dernières vidéos YouTube automatiques,
statut live Twitch, commentaires Cusdis, liens Tipeee / Boutique / réseaux.

---

## 1. Mise en ligne (une seule fois, ~15 minutes)

### a) Créer le dépôt
1. Sur github.com → bouton **New repository**.
2. Nom : `smartceltic-site` (ou ce que tu veux). Visibilité : **Public** (obligatoire pour Pages gratuit).
3. Ne coche rien d'autre → **Create repository**.

### b) Envoyer les fichiers
1. Dans le dépôt vide → lien **uploading an existing file**.
2. Glisse-dépose **tout le contenu** du dossier `smartceltic-site` (les fichiers ET les dossiers
   `assets`, `news`, `data`, `scripts`, `.github` — vérifie que `.github` est bien passé,
   c'est lui qui porte l'automatisation).
3. **Commit changes**.

### c) Activer GitHub Pages
1. Dépôt → **Settings → Pages**.
2. Source : **Deploy from a branch** → branche `main`, dossier `/ (root)` → **Save**.
3. Au bout d'une minute, le site répond sur `https://TON-PSEUDO.github.io/smartceltic-site/`.

### d) Brancher le domaine OVH
1. Toujours dans **Settings → Pages → Custom domain** : entre `smartceltic.fr` → **Save**.
2. Côté OVH (espace client → ton domaine → **Zone DNS**), crée ces enregistrements :

   | Type  | Sous-domaine | Cible                      |
   |-------|--------------|----------------------------|
   | A     | (vide)       | 185.199.108.153            |
   | A     | (vide)       | 185.199.109.153            |
   | A     | (vide)       | 185.199.110.153            |
   | A     | (vide)       | 185.199.111.153            |
   | CNAME | www          | TON-PSEUDO.github.io.      |

   ⚠️ Supprime les éventuels enregistrements A / AAAA par défaut d'OVH sur la racine
   (ils pointent vers leur page de parking).
3. Attends la propagation (de 10 min à quelques heures), puis dans **Settings → Pages**
   coche **Enforce HTTPS**.

### e) Activer les commentaires (Cusdis)
1. Crée un compte gratuit sur **cusdis.com** → **New website** → domaine : `smartceltic.fr`.
2. Récupère ton **App ID** (dans l'embed code).
3. Remplace `dc2efc68-e368-41bd-be24-38572c2889e0` dans `news/_gabarit.html` **et** dans les pages
   news existantes. Les commentaires arrivent dans ton tableau de bord Cusdis :
   rien ne s'affiche sans ton approbation.

### f) Le lien Discord
Remplace `https://discord.gg/5AqFmeEDhJ` (présent dans `index.html`, `news/index.html`,
`news/_gabarit.html` et les pages news) par ton invitation permanente
(Discord → nom du serveur → Inviter des gens → Modifier le lien → expiration **Jamais**).

---

## 2. Les automatisations

### Vidéos YouTube (100 % automatique)
Le workflow `.github/workflows/update-videos.yml` tourne **toutes les 6 heures** :
il lit le flux RSS public de la chaîne (zéro clé API), écrit `data/videos.json`,
et le site affiche les 3 dernières vidéos. Pour forcer une mise à jour immédiate :
onglet **Actions** du dépôt → « Mise à jour des vidéos YouTube » → **Run workflow**.

### Statut live Twitch (100 % automatique)
Le navigateur du visiteur interroge DecAPI au chargement. En live : badge rouge
cliquable. Hors ligne : les créneaux fixes restent affichés. Si DecAPI ne répond
pas, rien ne casse.

### News (pipeline Claude → site)
Le rythme : une fournée hebdomadaire adossée à la veille du Parchemin du Celte.

1. Dans Claude : colle le CR de veille (ou demande une veille par recherche web).
2. Claude rédige chaque news au format du site : titre, jeu, **statut** (règle dure :
   une seule source non officielle = 🟡 Rumeur), sources cliquables, verdict du Celte
   si l'actu le mérite.
3. **Validation explicite** ("publie") — jamais de mise en ligne sans ton accord.
4. Claude pousse dans le dépôt via l'API GitHub : la page `news/<slug>.html`
   (générée depuis `news/_gabarit.html`) + l'entrée dans `news/news.json`.
5. GitHub Pages republie le site automatiquement (~1 minute).

**Le jeton à préparer** (à donner à Claude en début de session de publication) :
GitHub → Settings → Developer settings → **Fine-grained personal access tokens** →
Generate new token → Repository access : **uniquement ce dépôt** →
Permissions : **Contents → Read and write** (rien d'autre) → expiration 90 jours.
Ne mets jamais ce jeton ailleurs que dans la conversation de publication.

---

## 3. Structure du dépôt

```
index.html                  Accueil (hero, vidéos, actu, soutenir)
news/index.html             Archive des news, filtrable par statut
news/_gabarit.html          Gabarit d'une news (utilisé par Claude)
news/news.json              Index des news (alimente accueil + archive)
news/exemple-*.html         3 news d'exemple — à supprimer à la 1re vraie fournée
assets/style.css            Charte complète (noir/or/rouge/parchemin, triangles)
assets/app.js               Vidéos, news, live Twitch, filtres
data/videos.json            Dernières vidéos (écrit par l'automatisation)
scripts/update_videos.py    Récupération du flux RSS YouTube
.github/workflows/          L'automatisation vidéos (cron 6 h)
CNAME                       Le domaine (smartceltic.fr)
```

## 4. Après la mise en ligne — la to-do visibilité

- Remplacer le lien Beacons par `https://smartceltic.fr` dans **toutes** les bios
  (YouTube, Twitch, X, Instagram, TikTok) et les descriptions de vidéos.
- Ajouter le site dans les panneaux Twitch et les cartes de fin YouTube.
- Supprimer les 3 news d'exemple à la première fournée réelle.
