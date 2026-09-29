/**
 * Lit les deux onglets de suivi publiés en CSV par Google Sheets et renvoie
 * les données au dashboard.
 *
 * Les URL « Publier sur le web » sont définies ci-dessous. Elles ne sont lues
 * que côté serveur : elles n'apparaissent jamais dans le navigateur des
 * visiteurs. Les variables d'environnement CSV_BL1 et CSV_BL3, si elles
 * existent, ont la priorité — pratique pour changer d'URL sans redéployer.
 *
 * La réponse est mise en cache 15 minutes sur le CDN Vercel : Google met déjà
 * ses CSV publiés en cache quelques minutes, inutile de le solliciter à chaque
 * visite.
 */

/** Première année publiée. Les fichiers remontent à 2017, mais 2020-2021
 *  contiennent des mois de fermeture qui fausseraient les comparaisons. */
const DEPUIS = 2022;

/** Noms de colonnes acceptés. BL1 écrit « Restau », BL3 écrit « Resto ». */
const COLS = {
  date:  ["Date"],
  ca:    ["CA EXPLOIT"],
  resto: ["Restau", "Resto", "Restauration"],
  escal: ["Escal", "Escalade"],
  shop:  ["Shop"],
  pass:  ["Passages"],
};

/** Onglets « Données BL1 » et « Données BL3 » publiés au format CSV. */
const DEFAUT = {
  bl1: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSdiS6y13zAUNRALeSeBRv31m0L3mutXOeFB1b76zCiv7LLKwYShp60c1fk8c1aFCmbwmC_sbL9MvD5/pub?gid=1216436400&single=true&output=csv",
  bl3: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvApOf8lmozqW7kpvx060H3Hn_l2HfZvTFyz8zGIM3qsv2mrksMXnkrfhk_nuKrpNydv5zUUGeL3m2/pub?gid=1216436400&single=true&output=csv",
};

export default async function handler(req, res) {
  const urls = {
    bl1: process.env.CSV_BL1 || DEFAUT.bl1,
    bl3: process.env.CSV_BL3 || DEFAUT.bl3,
  };

  try {
    const [bl1, bl3] = await Promise.all([
      charger(urls.bl1, "BL1"),
      charger(urls.bl3, "BL3"),
    ]);

    if (!bl1.length && !bl3.length) {
      throw new Error("Aucune ligne exploitable dans les onglets publiés.");
    }

    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=86400");
    return res.status(200).json({ generated: new Date().toISOString(), bl1, bl3 });
  } catch (err) {
    return res.status(502).json({ error: String(err?.message ?? err) });
  }
}

async function charger(url, nom) {
  let texte;
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    texte = await r.text();
  } catch (e) {
    throw new Error(`${nom} : téléchargement impossible (${e.message}).`);
  }

  if (/^\s*</.test(texte)) {
    throw new Error(
      `${nom} : Google a renvoyé une page HTML. L'onglet n'est probablement plus publié, ` +
        `ou l'URL pointe vers la feuille au lieu du CSV.`
    );
  }

  return extraire(parseCSV(texte), nom);
}

function extraire(grille, nom) {
  if (!grille.length) throw new Error(`${nom} : fichier vide.`);

  const head = grille[0].map((h) => h.trim());
  const col = {};
  for (const [cle, noms] of Object.entries(COLS)) {
    col[cle] = noms.map((n) => head.indexOf(n)).find((i) => i >= 0) ?? -1;
  }

  if (col.date < 0) throw new Error(`${nom} : colonne « Date » introuvable.`);
  if (col.ca < 0) throw new Error(`${nom} : colonne « CA EXPLOIT » introuvable.`);

  const lignes = [];
  for (let i = 1; i < grille.length; i++) {
    const row = grille[i];
    const periode = parseDate(row[col.date]);
    if (!periode) continue;                       // ligne vide ou intitulé
    if (periode.y < DEPUIS) continue;

    const ca = parseNombre(row[col.ca]);
    if (!ca || ca < 0) continue;                  // mois non saisi, ou fermeture

    lignes.push({
      y: periode.y,
      m: periode.m,
      ca,
      resto: parseNombre(row[col.resto]),
      escal: parseNombre(row[col.escal]),
      shop: parseNombre(row[col.shop]),
      pass: parseNombre(row[col.pass]),
    });
  }

  lignes.sort((a, b) => a.y * 100 + a.m - (b.y * 100 + b.m));
  return lignes;
}

/**
 * Découpe un CSV en respectant les guillemets : un champ entre guillemets peut
 * contenir des virgules, des retours à la ligne et des guillemets doublés.
 */
function parseCSV(texte) {
  const grille = [];
  let ligne = [];
  let champ = "";
  let dansGuillemets = false;

  const t = texte.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < t.length; i++) {
    const c = t[i];

    if (dansGuillemets) {
      if (c === '"') {
        if (t[i + 1] === '"') { champ += '"'; i++; }
        else dansGuillemets = false;
      } else champ += c;
      continue;
    }

    if (c === '"') dansGuillemets = true;
    else if (c === ",") { ligne.push(champ); champ = ""; }
    else if (c === "\n") { ligne.push(champ); grille.push(ligne); ligne = []; champ = ""; }
    else champ += c;
  }

  if (champ !== "" || ligne.length) { ligne.push(champ); grille.push(ligne); }
  return grille;
}

/** Accepte « 2026-08 », « 08/2026 », « 01/08/2026 » et « 2026-08-01 ». */
function parseDate(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;

  let m = s.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
  if (m) return valide(+m[1], +m[2]);

  m = s.match(/^(?:(\d{1,2})[-/])?(\d{1,2})[-/](\d{4})$/);
  if (m) return valide(+m[3], +m[2]);

  return null;
}

function valide(y, m) {
  return y >= 2000 && y <= 2100 && m >= 1 && m <= 12 ? { y, m } : null;
}

/**
 * Lit un nombre quelle que soit la locale du classeur.
 * « 123 578,96 € », « 123,578.96 », « 6 928 » et « 6928 » donnent tous le
 * bon résultat. Règle : un séparateur suivi d'exactement deux chiffres en fin
 * de chaîne est le séparateur décimal ; tous les autres sont des milliers.
 */
function parseNombre(v) {
  if (v == null) return null;
  let s = String(v).trim();
  if (!s || s.startsWith("#")) return null;       // vide, ou #VALUE! / #DIV/0!

  const negatif = /^\(.*\)$/.test(s) || s.startsWith("-");
  s = s.replace(/[^\d.,]/g, "");                  // €, espaces fines, parenthèses
  if (!s) return null;

  const dec = s.match(/[.,](\d{2})$/);
  if (dec) {
    const entier = s.slice(0, s.length - 3).replace(/[.,]/g, "");
    s = entier + "." + dec[1];
  } else {
    s = s.replace(/[.,]/g, "");
  }

  const n = parseFloat(s);
  if (!isFinite(n)) return null;
  return Math.round((negatif ? -n : n) * 100) / 100;
}
