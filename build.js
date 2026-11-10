#!/usr/bin/env node
/*
 * Générateur du site de l'Association Tunisienne pour l'Innovation Culturelle.
 * Aucune dépendance : lancez simplement `node build.js`.
 * Le site complet est produit dans le dossier dist/ (à publier tel quel).
 *
 * - Textes : content/fr.js, content/ar.js, content/en.js
 * - Actualités : content/actualites.json
 * - Partenaires : content/partenaires.json
 * - Financements étrangers (art. 41) : content/financements-etrangers.json
 * - Coordonnées et domaine : content/config.json
 * - Documents officiels (PDF) : src/documents/
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/config.json'), 'utf8'));
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8')); } catch { return d; } };
const news = readJSON('actualites.json', []).filter(n => !n.draft).sort((a, b) => b.date.localeCompare(a.date));
const partners = readJSON('partenaires.json', []);
const foreignFunds = readJSON('financements-etrangers.json', []);
const T = Object.fromEntries(cfg.languages.map(l => [l, require(`./content/${l}.js`)]));
const svg = f => fs.readFileSync(path.join(ROOT, 'src/assets/img', f), 'utf8').replace(/<\?xml[^>]*>/, '').replace(/width="[\d.]+" height="[\d.]+"/, '');
const SYM = svg('symbole_couleur.svg');
const SYM_INV = svg('symbole_inverse.svg');

const PAGES = [
  { id: 'home', file: 'index.html' },
  { id: 'association', file: 'association.html' },
  { id: 'projects', file: 'projets.html' },
  { id: 'wa9tech', file: 'wa9tech.html', parent: 'projects' },
  { id: 'theone', file: 'the-one.html', parent: 'projects' },
  { id: 'news', file: 'actualites.html' },
  { id: 'partners', file: 'partenaires.html' },
  { id: 'transparency', file: 'transparence.html' },
  { id: 'contact', file: 'contact.html' },
];
const NAV = ['home', 'association', 'projects', 'news', 'partners', 'transparency', 'contact'];
const fileOf = id => PAGES.find(p => p.id === id).file;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (d, l) => new Date(d + 'T12:00:00').toLocaleDateString({ fr: 'fr-FR', ar: 'ar-TN', en: 'en-GB' }[l], { day: 'numeric', month: 'long', year: 'numeric' });
const docExists = f => fs.existsSync(path.join(ROOT, 'src/documents', f));

const ICON = {
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 7c-.1-1.6-.4-3-1.6-4.2S17.6 1.2 16 1.1C14.4 1 9.6 1 8 1.1 6.4 1.2 5 1.5 3.8 2.7S2.2 5.4 2.1 7C2 8.6 2 13.4 2.1 15c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.4.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.4 0-8z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 5h18v14H3z M3 6l9 7 9-7"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" class="arrow"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 12h14m-5-5 5 5-5 5"/></svg>',
};

function layout(l, page, title, body) {
  const t = T[l];
  const url = `${cfg.siteUrl}/${l}/${page.file === 'index.html' ? '' : page.file}`;
  const alt = cfg.languages.map(x => `<link rel="alternate" hreflang="${x}" href="${cfg.siteUrl}/${x}/${page.file === 'index.html' ? '' : page.file}">`).join('\n');
  const active = page.parent || page.id;
  const nav = NAV.map(id => `<li><a href="${fileOf(id)}"${active === id ? ' aria-current="page"' : ''}>${t.nav[id]}</a></li>`).join('');
  const langs = cfg.languages.map(x => x === l ? `<span class="lang-current" lang="${x}">${T[x].label}</span>` : `<a href="../${x}/${page.file}" lang="${x}" hreflang="${x}" title="${T[x].langName}">${T[x].label}</a>`).join('');
  const social = [cfg.facebook && `<a href="${cfg.facebook}" aria-label="Facebook" rel="noopener">${ICON.fb}</a>`, cfg.instagram && `<a href="${cfg.instagram}" aria-label="Instagram" rel="noopener">${ICON.ig}</a>`, `<a href="mailto:${cfg.email}" aria-label="${t.contact.emailLabel}">${ICON.mail}</a>`].filter(Boolean).join('');
  const fullTitle = page.id === 'home' ? `${t.name} — ${t.tagline}` : `${title} — ${t.name}`;
  return `<!doctype html>
<html lang="${l}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(t.description)}">
<link rel="canonical" href="${url}">
${alt}
<link rel="alternate" hreflang="x-default" href="${cfg.siteUrl}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(t.description)}">
<meta property="og:image" content="${cfg.siteUrl}/assets/img/og-image.jpg">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${t.locale}">
<meta name="theme-color" content="#1A1446">
<link rel="icon" href="../assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Reem+Kufi:wght@500;700&family=Noto+Kufi+Arabic:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'NGO', name: T.fr.name, alternateName: [T.ar.name, T.en.name], url: cfg.siteUrl, logo: `${cfg.siteUrl}/assets/img/icon-512.png`, email: cfg.email, address: { '@type': 'PostalAddress', addressLocality: 'Borj Louzir', addressRegion: 'Ariana', addressCountry: 'TN' }, sameAs: [cfg.facebook, cfg.instagram].filter(Boolean) })}</script>
</head>
<body class="page-${page.id}">
<a class="skip" href="#main">${t.skip}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="index.html" aria-label="${esc(t.name)}">${SYM}<span>${t.name}</span></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span><b class="sr">${t.menu}</b></button>
    <nav id="nav" class="nav" aria-label="${t.menu}"><ul>${nav}</ul><div class="langs">${langs}</div></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="f-brand">${SYM_INV}<p class="f-name">${t.name}</p><p>${t.footer.about}</p></div>
    <div><h2>${t.nav.contact}</h2><p>${t.footer.address}</p><p><a href="mailto:${cfg.email}">${cfg.email}</a></p></div>
    <div><h2>${t.footer.follow}</h2><div class="social">${social}</div><p class="f-links"><a href="transparence.html">${t.footer.legal}</a></p></div>
  </div>
  <div class="wrap f-bottom"><span>© ${new Date().getFullYear()} ${t.name}. ${t.footer.rights}</span><span class="stripe" aria-hidden="true"></span></div>
</footer>
<script src="../assets/js/main.js" defer></script>
</body>
</html>`;
}

const hero = (title, intro, cls = '') => `<section class="page-hero ${cls}"><div class="wrap"><h1>${title}</h1>${intro ? `<p class="lead">${intro}</p>` : ''}</div><div class="page-hero-sym" aria-hidden="true">${SYM_INV}</div></section>`;
const newsCards = (l, items) => items.length ? `<div class="news-grid">${items.map(n => `<article class="news-card"><p class="news-meta"><span class="tag">${esc(n.tag ? n.tag[l] : '')}</span><time datetime="${n.date}">${fmtDate(n.date, l)}</time></p><h3>${esc(n[l].title)}</h3><p>${esc(n[l].text)}</p></article>`).join('')}</div>` : `<p class="empty">${T[l].news.empty}</p>`;
const projectCard = (l, id, cls) => { const p = T[l][id]; return `<a class="project-card ${cls}" href="${fileOf(id)}"><span class="badge">${p.status}</span><h3>${p.title}</h3><p class="sub">${p.sub}</p><p>${p.short}</p><span class="more">${T[l].readMore} ${ICON.arrow}</span></a>`; };

const render = {
  home(l) {
    const t = T[l], h = t.home;
    return `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-text">
      <p class="kicker">${h.kicker}</p>
      <h1>${h.heroTitle}</h1>
      <p class="lead">${h.heroText}</p>
      <div class="actions"><a class="btn btn-primary" href="projets.html">${h.ctaProjects}</a><a class="btn btn-ghost" href="contact.html">${h.ctaJoin}</a></div>
    </div>
    <div class="hero-art" aria-hidden="true">${SYM_INV}</div>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div class="split-art">${SYM}</div>
    <div><h2>${h.logoTitle}</h2><p class="lead dark">${h.logoText}</p></div>
  </div>
</section>
<section class="section alt">
  <div class="wrap"><h2>${h.pillarsTitle}</h2>
  <div class="pillars">${h.pillars.map((p, i) => `<div class="pillar c${i % 3}"><span class="dot"></span><h3>${p.t}</h3><p>${p.d}</p></div>`).join('')}</div></div>
</section>
<section class="section">
  <div class="wrap"><h2>${h.projectsTitle}</h2><p class="section-intro">${h.projectsIntro}</p>
  <div class="projects">${projectCard(l, 'wa9tech', 'p-wa9tech')}${projectCard(l, 'theone', 'p-theone')}</div></div>
</section>
<section class="section alt">
  <div class="wrap"><div class="section-head"><h2>${h.newsTitle}</h2><a class="link" href="actualites.html">${t.seeAll} ${ICON.arrow}</a></div>
  ${newsCards(l, news.slice(0, 3))}</div>
</section>
<section class="cta-band">
  <div class="wrap cta-inner"><div><h2>${h.joinTitle}</h2><p>${h.joinText}</p></div>
  <div class="actions"><a class="btn btn-primary" href="contact.html">${h.joinCta}</a><a class="btn btn-ghost" href="partenaires.html">${h.partnerCta}</a></div></div>
</section>`;
  },
  association(l) {
    const a = T[l].association;
    return `${hero(a.title, a.intro)}
<section class="section"><div class="wrap narrow"><blockquote class="manifesto"><h2>${a.manifestoTitle}</h2><p>${a.manifesto}</p></blockquote></div></section>
<section class="section alt"><div class="wrap two-col">
  <div><h2>${a.visionTitle}</h2><p class="lead dark">${a.vision}</p></div>
  <div><h2>${a.goalsTitle}</h2><ol class="goals">${a.goals.map(g => `<li>${g}</li>`).join('')}</ol></div>
</div></section>
<section class="section"><div class="wrap"><h2>${a.valuesTitle}</h2><ul class="values">${a.values.map((v, i) => `<li class="c${i % 3}">${v}</li>`).join('')}</ul></div></section>
<section class="section alt"><div class="wrap"><h2>${a.boardTitle}</h2><div class="board">${a.board.map(b => `<div class="member"><span class="avatar" aria-hidden="true">${b.n.trim().charAt(0)}</span><h3>${b.n}</h3><p class="role">${b.r}</p>${b.d ? `<p>${b.d}</p>` : ''}</div>`).join('')}</div></div></section>`;
  },
  projects(l) {
    const p = T[l].projects;
    return `${hero(p.title, p.intro)}
<section class="section"><div class="wrap"><div class="projects">${projectCard(l, 'wa9tech', 'p-wa9tech')}${projectCard(l, 'theone', 'p-theone')}</div></div></section>`;
  },
  wa9tech(l) {
    const w = T[l].wa9tech;
    return `<section class="page-hero project-hero p-wa9tech"><div class="wrap"><p class="kicker"><a href="projets.html">${T[l].nav.projects}</a> · <span class="badge light">${w.status}</span></p><h1>${w.title}</h1><p class="sub big">${w.sub}</p><p class="lead">${w.short}</p></div></section>
<section class="section"><div class="wrap two-col">
  <div><h2>${w.problemTitle}</h2><p>${w.problem}</p></div>
  <div><h2>${w.solutionTitle}</h2><p>${w.solution}</p></div>
</div></section>
<section class="section alt"><div class="wrap two-col">
  <div><h2>${w.featuresTitle}</h2><ul class="checks">${w.features.map(f => `<li>${f}</li>`).join('')}</ul></div>
  <div><h2>${w.stepsTitle}</h2><ol class="steps">${w.steps.map(s => `<li><span>${s}</span></li>`).join('')}</ol></div>
</div></section>
<section class="cta-band"><div class="wrap cta-inner"><div><h2>${w.partnerTitle}</h2><p>${w.partner}</p></div><div class="actions"><a class="btn btn-primary" href="contact.html">${T[l].contact.write}</a></div></div></section>`;
  },
  theone(l) {
    const o = T[l].theone;
    return `<section class="page-hero project-hero p-theone"><div class="wrap"><p class="kicker"><a href="projets.html">${T[l].nav.projects}</a> · <span class="badge light">${o.status}</span></p><h1>${o.title}</h1><p class="sub big">${o.sub}</p><p class="lead">${o.short}</p></div></section>
<section class="section"><div class="wrap two-col">
  <div><h2>${o.originTitle}</h2><p>${o.origin}</p></div>
  <div><h2>${o.conceptTitle}</h2><p>${o.concept}</p></div>
</div></section>
<section class="section alt"><div class="wrap"><h2>${o.figuresTitle}</h2><div class="figures">${o.figures.map((f, i) => `<div class="figure c${i % 3}"><strong>${f.v}</strong><span>${f.l}</span></div>`).join('')}</div></div></section>
<section class="section"><div class="wrap two-col">
  <div><h2>${o.regionsTitle}</h2><p>${o.regions}</p></div>
  <div><h2>${o.levelsTitle}</h2><ol class="levels">${o.levels.map(v => `<li><h3>${v.t}</h3><p>${v.d}</p></li>`).join('')}</ol></div>
</div><div class="wrap"><p class="credit">${o.credit}</p></div></section>
<section class="cta-band"><div class="wrap cta-inner"><div><h2>${o.partnerTitle}</h2><p>${o.partner}</p></div><div class="actions"><a class="btn btn-primary" href="contact.html">${T[l].partners.cta}</a></div></div></section>`;
  },
  news(l) {
    const n = T[l].news;
    return `${hero(n.title, n.intro)}<section class="section"><div class="wrap">${newsCards(l, news)}</div></section>`;
  },
  partners(l) {
    const p = T[l].partners;
    const logos = partners.length ? `<div class="logos">${partners.map(x => `<a href="${x.url || '#'}" rel="noopener" title="${esc(x.name)}"><img src="../assets/img/partenaires/${x.logo}" alt="${esc(x.name)}" loading="lazy"></a>`).join('')}</div>` : `<p class="empty">${p.listEmpty}</p>`;
    return `${hero(p.title, p.intro)}
<section class="section"><div class="wrap"><h2>${p.whyTitle}</h2><div class="pillars three">${p.why.map((w, i) => `<div class="pillar c${i % 3}"><span class="dot"></span><h3>${w.t}</h3><p>${w.d}</p></div>`).join('')}</div></div></section>
<section class="section alt"><div class="wrap"><h2>${p.waysTitle}</h2><div class="ways">${p.ways.map((w, i) => `<div class="way"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${w.t}</h3><p>${w.d}</p></div>`).join('')}</div></div></section>
<section class="section"><div class="wrap"><h2>${p.listTitle}</h2>${logos}</div></section>
<section class="cta-band"><div class="wrap cta-inner"><div><h2>${p.cta}</h2></div><div class="actions"><a class="btn btn-primary" href="mailto:${cfg.email}?subject=${encodeURIComponent(p.cta)}">${cfg.email}</a></div></div></section>`;
  },
  transparency(l) {
    const t = T[l].transparency;
    const docs = t.docs.map(d => docExists(d.f) ? `<li><a class="doc" href="../documents/${d.f}" download>${d.t} <span>PDF</span></a></li>` : `<li><span class="doc soon">${d.t} <span>${t.docsSoon}</span></span></li>`).join('');
    const funds = foreignFunds.length ? `<table class="table"><tbody>${foreignFunds.map(f => `<tr><td>${esc(f.date)}</td><td>${esc(f.source)}</td><td>${esc(f.amount)}</td><td>${esc(f[l] || f.fr || '')}</td></tr>`).join('')}</tbody></table>` : `<p class="empty">${t.foreignEmpty}</p>`;
    return `${hero(t.title, t.intro)}
<section class="section"><div class="wrap two-col">
  <div><h2>${t.legalTitle}</h2><dl class="legal">${t.legal.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>
  <div><h2>${t.docsTitle}</h2><ul class="docs">${docs}</ul></div>
</div></section>
<section class="section alt"><div class="wrap two-col">
  <div><h2>${t.commitTitle}</h2><ul class="checks">${t.commit.map(c => `<li>${c}</li>`).join('')}</ul></div>
  <div><h2>${t.foreignTitle}</h2><p>${t.foreign}</p>${funds}</div>
</div></section>`;
  },
  contact(l) {
    const c = T[l].contact;
    return `${hero(c.title, c.intro)}
<section class="section"><div class="wrap two-col">
  <div class="contact-list">
    <p><span>${c.emailLabel}</span><a href="mailto:${cfg.email}">${cfg.email}</a></p>
    <p><span>${c.phoneLabel}</span><a href="tel:${cfg.phone.replace(/\s/g, '')}" dir="ltr">${cfg.phone}</a></p>
    ${cfg.facebook ? `<p><span>${c.facebookLabel}</span><a href="${cfg.facebook}" rel="noopener">${cfg.facebook.replace(/^https?:\/\/(www\.)?/, '')}</a></p>` : ''}
    <p><span>${c.addressLabel}</span>${T[l].footer.address}</p>
    <a class="btn btn-primary" href="mailto:${cfg.email}">${c.write}</a>
  </div>
  <div class="join-box"><h2>${c.joinTitle}</h2><p class="price">50 <small>${l === 'ar' ? 'دينار / سنة' : l === 'en' ? 'TND / year' : 'DT / an'}</small></p><p>${c.join}</p></div>
</div></section>`;
  },
};

// ---------- build ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'src/assets'), path.join(DIST, 'assets'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src/documents'), path.join(DIST, 'documents'), { recursive: true });
const urls = [];
for (const l of cfg.languages) {
  fs.mkdirSync(path.join(DIST, l), { recursive: true });
  for (const page of PAGES) {
    const title = page.id === 'home' ? T[l].home.title : (T[l][page.id] && T[l][page.id].title) || T[l].nav[page.id];
    fs.writeFileSync(path.join(DIST, l, page.file), layout(l, page, title, render[page.id](l)));
    urls.push(`${cfg.siteUrl}/${l}/${page.file === 'index.html' ? '' : page.file}`);
  }
}
// Page racine : redirige vers la langue du navigateur
fs.writeFileSync(path.join(DIST, 'index.html'), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${T.fr.name}</title>
<link rel="icon" href="assets/img/favicon.png"><meta http-equiv="refresh" content="0; url=${cfg.defaultLanguage}/">
<script>(function(){var l=(navigator.language||'').slice(0,2);var ok=${JSON.stringify(cfg.languages)};location.replace((ok.indexOf(l)>-1?l:'${cfg.defaultLanguage}')+'/');})();</script></head>
<body style="font-family:sans-serif;background:#1A1446;color:#fff;text-align:center;padding:3rem">${cfg.languages.map(l => `<p><a style="color:#FFB627" href="${l}/">${T[l].name}</a></p>`).join('')}</body></html>`);
fs.writeFileSync(path.join(DIST, '404.html'), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404</title><link rel="stylesheet" href="/assets/css/style.css"></head><body><main class="notfound"><div>${SYM_INV}<h1>404</h1><p>Page introuvable · الصفحة غير موجودة · Page not found</p><p><a class="btn btn-primary" href="/">${T.fr.nav.home}</a></p></div></main></body></html>`);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);
console.log(`Site généré dans dist/ : ${urls.length} pages (${cfg.languages.join(', ')}).`);
