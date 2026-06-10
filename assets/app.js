/* SMARTCELTIC — app.js
   1) Statut live Twitch (DecAPI, dégradation propre si indisponible)
   2) Dernières vidéos YouTube (data/videos.json, mis à jour par GitHub Action)
   3) Dernières news (news/news.json)
   4) Filtres de l'archive news
*/

const RACINE = document.body.dataset.racine || "";

/* ---------- 1. Live Twitch ---------- */
(function liveTwitch() {
  const badges = [document.getElementById("live-nav"), document.getElementById("live-hero")].filter(Boolean);
  if (!badges.length) return;
  fetch("https://decapi.me/twitch/uptime/smartceltic")
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(txt => {
      const enLive = !/offline/i.test(txt);
      badges.forEach(b => {
        if (enLive) {
          b.classList.add("is-live");
          b.querySelector(".live__txt").textContent = "EN LIVE — rejoindre";
        } else {
          b.querySelector(".live__txt").textContent = b.id === "live-nav" ? "Twitch" : "Hors ligne pour l'instant";
        }
      });
    })
    .catch(() => { /* DecAPI muet : on laisse l'état neutre, les créneaux restent affichés */ });
})();

/* ---------- 2. Vidéos YouTube ---------- */
(function videos() {
  const grille = document.getElementById("videos-grid");
  if (!grille) return;
  fetch(RACINE + "data/videos.json")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      const vids = (data.videos || []).slice(0, 3);
      if (!vids.length) throw new Error("vide");
      grille.innerHTML = vids.map(v => `
        <a class="video" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
          <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy">
          <h3>${echap(v.title)}</h3>
          <time datetime="${v.published}">${dateFr(v.published)}</time>
        </a>`).join("");
    })
    .catch(() => {
      grille.innerHTML = `<p class="videos__empty">Les dernières vidéos arrivent ici très vite —
        en attendant, <a href="https://www.youtube.com/@SmartCeltic01/videos" target="_blank" rel="noopener">elles t'attendent sur la chaîne</a>.</p>`;
    });
})();

/* ---------- 3. News (accueil : 4 dernières / archive : toutes) ---------- */
(function news() {
  const liste = document.getElementById("news-list");
  if (!liste) return;
  const archive = liste.dataset.mode === "archive";
  fetch(RACINE + "news/news.json")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      let items = data.news || [];
      items.sort((a, b) => b.date.localeCompare(a.date));
      if (!archive) items = items.slice(0, 4);
      if (!items.length) throw new Error("vide");
      liste.innerHTML = items.map(carteNews).join("");
      if (archive) initFiltres(items, liste);
    })
    .catch(() => {
      liste.innerHTML = `<p class="videos__empty">La première fournée de news tombe lundi prochain. Reviens vite.</p>`;
    });

  function carteNews(n) {
    return `
      <a class="news-card" href="${RACINE}news/${n.slug}.html" data-statut="${n.statut}">
        <span class="tri tri--${n.statut}" aria-hidden="true"></span>
        <span>
          <span class="news-card__game">${echap(n.jeu)} · ${libelleStatut(n.statut)}</span>
          <span class="news-card__title">${echap(n.titre)}</span>
        </span>
        <time datetime="${n.date}">${dateFr(n.date)}</time>
      </a>`;
  }

  function initFiltres(items, liste) {
    const filtres = document.querySelectorAll(".filtre");
    filtres.forEach(btn => btn.addEventListener("click", () => {
      filtres.forEach(b => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      const cible = btn.dataset.statut;
      liste.querySelectorAll(".news-card").forEach(carte => {
        carte.style.display = (cible === "tous" || carte.dataset.statut === cible) ? "" : "none";
      });
    }));
  }
})();

/* ---------- Utilitaires ---------- */
function libelleStatut(s) {
  return { confirme: "Confirmé", rumeur: "Rumeur", dementi: "Démenti" }[s] || s;
}
function dateFr(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}
function echap(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
