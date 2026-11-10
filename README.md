# Site officiel — Association Tunisienne pour l'Innovation Culturelle

Site statique en trois langues (français, arabe de droite à gauche, anglais), sans base de données ni dépendance.
Un petit script Node génère toutes les pages à partir des fichiers de contenu.

## Démarrer

```powershell
cd "G:\Association\Claude outputs\site-web"
node build.js          # génère le site dans dist\
npm run preview        # génère puis lance l'aperçu sur http://localhost:3000 (ou : node preview.js)
```

Node 18 ou plus récent est nécessaire. Un champ vide dans `content/config.json` (téléphone, e-mail, Facebook) est simplement masqué sur le site.

N'ouvrez pas les fichiers HTML de `dist\` en double-cliquant dessus : passez par `npm run preview`.

## Où modifier quoi

| Je veux modifier…                         | Fichier                                   |
|-------------------------------------------|-------------------------------------------|
| Les textes du site                        | `content/fr.js`, `content/ar.js`, `content/en.js` |
| Le domaine, l'e-mail, le téléphone, Facebook | `content/config.json`                  |
| Les actualités                            | `content/actualites.json`                 |
| Les logos des partenaires                 | `content/partenaires.json` + images dans `src/assets/img/partenaires/` |
| Les financements étrangers (art. 41)      | `content/financements-etrangers.json`     |
| Les documents officiels (PDF)             | `src/documents/statuts.pdf`, `src/documents/annonce-jort.pdf` |
| Les couleurs et la mise en page           | `src/assets/css/style.css`                |
| La structure des pages                    | `build.js`                                |

Après chaque modification : `node build.js`.

### Ajouter une actualité

Ajoutez un bloc dans `content/actualites.json` (les plus récentes s'affichent en premier) :

```json
{
  "date": "2026-12-12",
  "draft": false,
  "tag": { "fr": "Événement", "ar": "تظاهرة", "en": "Event" },
  "fr": { "title": "Titre", "text": "Texte court." },
  "ar": { "title": "العنوان", "text": "نص قصير." },
  "en": { "title": "Title", "text": "Short text." }
}
```

`"draft": true` garde l'actualité cachée (utile pour préparer une annonce à l'avance, comme celle des 100 Fondateurs).

### Ajouter un partenaire

Placez son logo dans `src/assets/img/partenaires/` puis ajoutez dans `content/partenaires.json` :

```json
[{ "name": "Nom du partenaire", "logo": "nom-du-fichier.png", "url": "https://..." }]
```

### Publier un financement étranger (obligation de l'article 41)

```json
[{ "date": "2027-01-15", "source": "Fondation X (Suisse)", "amount": "50 000 DT", "fr": "Objet du financement", "ar": "موضوع التمويل", "en": "Purpose" }]
```

### Documents officiels

Déposez les PDF dans `src/documents/` avec exactement ces noms : `statuts.pdf`, `annonce-jort.pdf`.
Tant qu'un fichier est absent, la page Transparence affiche « Disponible prochainement ».
Ne publiez jamais de document contenant des numéros de carte d'identité.

## Mettre en ligne

**Option 1 — GitHub Pages (gratuit, recommandé)**
1. Créez un dépôt GitHub et poussez ce dossier.
2. Dans le dépôt : Settings → Pages → Source : « GitHub Actions ».
3. Chaque `git push` sur `main` publie automatiquement le site (fichier `.github/workflows/deploy.yml`).
4. Domaine personnalisé : Settings → Pages → Custom domain, puis créez chez votre registraire un enregistrement CNAME `www` → `VOTRE-COMPTE.github.io`.

**Option 2 — Netlify** : glissez-déposez le dossier `dist/` sur app.netlify.com, ou reliez le dépôt avec la commande de build `node build.js` et le dossier de publication `dist`.

**Option 3 — Railway** : service statique depuis le dépôt, commande de build `node build.js`, dossier servi `dist`.

## Avant la mise en ligne

- [ ] Remplacer dans `content/config.json` : domaine, e-mail, téléphone, lien Facebook
- [ ] Compléter l'identifiant RNE dans la page Transparence (les trois fichiers de langue)
- [ ] Ajouter `statuts.pdf` et `annonce-jort.pdf` dans `src/documents/`
- [ ] Vérifier les textes arabe et anglais
- [ ] Passer l'actualité « Les 100 Fondateurs » en `"draft": false` le jour du lancement
- [ ] Déclarer le site dans Google Search Console (le fichier `sitemap.xml` est généré automatiquement)
