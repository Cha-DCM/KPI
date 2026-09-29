# Mise à jour automatique du suivi de CA

Le dashboard lit tes fichiers Google Sheets à chaque chargement. Tu saisis ton
mois dans Sheets, le site l'affiche au rafraîchissement suivant. Ni script à
maintenir, ni fichier à renvoyer, ni redéploiement.

```
Google Sheets                    Vercel                    Navigateur
Données BL1  ──publié en CSV──▶  /api/data lit les    ──▶  dashboard
Données BL3                      deux CSV, nettoie,
                                 met en cache 15 min
```

## 1. Publier les deux onglets (3 clics chacun)

Dans **BL1_Suivi CA** :

1. **Fichier** ▸ **Partager** ▸ **Publier sur le web**
2. Dans le premier menu déroulant, choisis l'onglet **Données BL1**
   (surtout pas « Document entier »)
3. Dans le second, choisis **Valeurs séparées par des virgules (.csv)**
4. **Publier**, puis confirme, et copie l'URL proposée

Recommence à l'identique dans **BL3_Suivi CA** avec l'onglet **Données BL3**.

Tu obtiens deux URL qui ressemblent à
`docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv`.

Ce que cela expose : uniquement les valeurs de l'onglet publié, à qui
connaîtrait l'URL. Le reste du fichier, les autres onglets et les droits
d'édition ne sont pas concernés. L'URL reste stockée côté serveur Vercel, elle
n'apparaît jamais dans le navigateur des visiteurs. Tu peux dépublier à tout
moment par le même menu.

## 2. Brancher Vercel

Rien à faire : les deux URL sont déjà inscrites dans `api/data.js`, lues
uniquement côté serveur. Elles n'apparaissent jamais dans le navigateur des
visiteurs.

Si un jour tu republies les onglets et que les URL changent, tu peux soit
corriger la constante `DEFAUT` en tête de `api/data.js`, soit définir les
variables d'environnement `CSV_BL1` et `CSV_BL3` dans **Settings** ▸
**Environment Variables** : elles ont la priorité sur les valeurs du fichier,
ce qui évite de toucher au code.

## 3. Vérifier

En haut à droite du dashboard :

- **« Données lues dans Google Sheets »** avec une date : tout fonctionne.
- **Mention orange** : la cause exacte est affichée à côté. Voir le tableau.
- **Actualiser** force une relecture sans attendre l'expiration du cache.

| Message | Cause | Correctif |
|---|---|---|
| `Variable d'environnement absente : CSV_BL3` | variable oubliée | étape 2, puis redéployer |
| `Google a renvoyé une page HTML` | onglet dépublié, ou URL de la feuille au lieu du CSV | refaire l'étape 1, en vérifiant `output=csv` dans l'URL |
| `téléchargement impossible (HTTP 404)` | URL erronée ou publication supprimée | recopier l'URL depuis le menu Publier |
| `colonne « CA EXPLOIT » introuvable` | en-tête renommé | rétablir l'en-tête, ou l'ajouter dans `COLS` en tête de `api/data.js` |

Si Sheets est injoignable, le dashboard bascule sur l'instantané d'août 2026
embarqué dans le code, plutôt que d'afficher une page vide. La mention orange
signale que les chiffres ne sont pas frais.

## Délai de propagation

Google met ses CSV publiés en cache, généralement moins de cinq minutes, et
Vercel ajoute quinze minutes de cache. Un chiffre saisi à l'instant met donc
jusqu'à vingt minutes à apparaître. Le bouton Actualiser contourne le cache
Vercel mais pas celui de Google : si le chiffre ne s'affiche pas, c'est presque
toujours qu'il faut attendre quelques minutes de plus.

## Ce que la fonction ignore volontairement

- Les mois dont le CA d'exploitation est vide ou nul, donc les lignes des mois
  à venir déjà présentes dans tes fichiers.
- Les années antérieures à 2022 (constante `DEPUIS` en tête de `api/data.js`).
  Tes fichiers remontent à 2017, mais 2020 et 2021 contiennent des mois de
  fermeture qui fausseraient les comparaisons annuelles.
- Les mois à CA négatif, pour la même raison.
- Les cellules d'erreur `#VALUE!` et `#DIV/0!`, traitées comme valeur absente.

## Robustesse aux modifications de tes fichiers

Les colonnes sont repérées par nom d'en-tête, jamais par position : tu peux en
insérer, en déplacer ou en supprimer sans rien casser. Sont acceptés « Restau »
comme « Resto », et les montants quelle que soit la locale du classeur —
`123 578,96 €` et `123,578.96` donnent le même résultat. Les dates sont lues en
`2026-08`, `2026-08-01`, `08/2026` ou `01/08/2026`.

En revanche, renommer `CA EXPLOIT`, `Date` ou `Passages` demande d'ajouter le
nouveau nom dans le bloc `COLS`, en tête de `api/data.js`.

## Fichiers

| Fichier | Destination |
|---|---|
| `api/data.js` | racine du projet Vercel, dossier `api/` |
| `src/App.jsx` | remplace le fichier existant |
| `index.html`, `package.json`, `vite.config.js`, `src/main.jsx` | inchangés |

Le dossier `apps-script/` correspond à la voie alternative, non retenue. Tu peux
l'ignorer ou le supprimer.
