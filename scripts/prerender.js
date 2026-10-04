import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Setup mock window/localStorage for Node environment safety during SSR
if (!globalThis.localStorage) {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

const PUBLIC_ROUTES = [
  '/',
  '/scientific-calculator',
  '/geometry-calculator',
  '/math-tutor',
  '/calculator',
  '/canvas',
  '/tutor',
  '/learn',
  '/learn/algebra',
  '/learn/geometry',
  '/learn/trigonometry',
  '/learn/coordinate-geometry'
];

async function prerender() {
  console.log('🚀 [CritCalc Prerender] Starting static HTML generation...');

  const templatePath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Please run "vite build" before prerendering.');
  }
  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Spin up lightweight Vite SSR runtime to transform JSX & CSS modules
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: rootDir
  });

  try {
    const { default: App, preloadRouteModules } = await vite.ssrLoadModule('./src/App.jsx');
    await preloadRouteModules();
    const { SEO_DATA, SITE_URL, DEFAULT_OG_IMAGE, SITE_NAME } = await vite.ssrLoadModule('./src/seo/seoConfig.js');

    const results = [];

    for (const route of PUBLIC_ROUTES) {
      const seo = SEO_DATA[route] || {};
      const title = seo.title || 'CritCalc — Free Online Math Calculator, Geometry Tools & AI Tutor';
      const description = seo.description || 'CritCalc is a free interactive math platform combining a scientific calculator, dynamic geometry canvas, and AI math tutor.';
      const canonical = seo.canonical || `${SITE_URL}${route === '/' ? '/' : route}`;
      const robots = seo.robots || 'index, follow';
      const ogTitle = seo.ogTitle || title;
      const ogDescription = seo.ogDescription || description;
      const ogUrl = seo.ogUrl || canonical;
      const ogImage = seo.ogImage || DEFAULT_OG_IMAGE;
      const ogType = seo.ogType || 'website';
      const twitterCard = seo.twitterCard || 'summary_large_image';
      const schema = seo.schema;

      // Render React component tree to HTML string
      const appHtml = renderToString(
        React.createElement(App, {
          Router: StaticRouter,
          routerProps: { location: route }
        })
      );

      // Inject metadata and rendered HTML into template
      let html = rawTemplate;

      // Title
      html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

      // Meta Description
      if (html.includes('name="description"')) {
        html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${description}" />`);
      } else {
        html = html.replace('</head>', `  <meta name="description" content="${description}" />\n</head>`);
      }

      // Canonical URL
      if (html.includes('rel="canonical"')) {
        html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
      } else {
        html = html.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n</head>`);
      }

      // Robots
      if (html.includes('name="robots"')) {
        html = html.replace(/<meta\s+name="robots"\s+content=".*?"\s*\/?>/i, `<meta name="robots" content="${robots}" />`);
      } else {
        html = html.replace('</head>', `  <meta name="robots" content="${robots}" />\n</head>`);
      }

      // Open Graph
      html = html.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${ogTitle}" />`);
      html = html.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${ogDescription}" />`);
      html = html.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${ogUrl}" />`);
      html = html.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />`);
      html = html.replace(/<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);

      // Twitter Cards
      html = html.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${ogTitle}" />`);
      html = html.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${ogDescription}" />`);
      html = html.replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${ogImage}" />`);
      html = html.replace(/<meta\s+name="twitter:card"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:card" content="${twitterCard}" />`);

      // Structured Data Schema Injection
      if (schema) {
        const schemaString = JSON.stringify(schema, null, 2);
        const schemaTag = `\n    <script type="application/ld+json" data-critcalc-schema="true">\n${schemaString}\n    </script>\n`;
        // Replace existing default schema block from index.html if present
        html = html.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/i, '');
        html = html.replace('</head>', `${schemaTag}</head>`);
      }

      // Inject rendered app HTML into root container
      html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      // Determine output file location
      let targetFile;
      if (route === '/') {
        targetFile = path.resolve(distDir, 'index.html');
      } else {
        const routeFolder = path.resolve(distDir, route.replace(/^\//, ''));
        fs.mkdirSync(routeFolder, { recursive: true });
        targetFile = path.resolve(routeFolder, 'index.html');
      }

      fs.writeFileSync(targetFile, html, 'utf-8');

      // Verify that H1 exists in rendered output
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
      const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '(No H1 found)';

      results.push({
        route,
        file: path.relative(rootDir, targetFile),
        bytes: Buffer.byteLength(html, 'utf-8'),
        title,
        h1: h1Text
      });
    }

    const sitemapPath = path.resolve(distDir, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
      throw new Error('dist/sitemap.xml not found. Ensure public/sitemap.xml is present.');
    }
    const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
    if (!sitemap.includes('{{BUILD_DATE}}')) {
      throw new Error('Sitemap is missing its build-date placeholder.');
    }
    fs.writeFileSync(
      sitemapPath,
      sitemap.replaceAll('{{BUILD_DATE}}', new Date().toISOString().slice(0, 10)),
      'utf-8'
    );

    console.log('\n✅ [CritCalc Prerender] Successfully generated static HTML for all public routes:');
    console.table(
      results.map((r) => ({
        Route: r.route,
        File: r.file,
        'Size (KB)': (r.bytes / 1024).toFixed(1),
        'H1 Found': r.h1.slice(0, 45) + (r.h1.length > 45 ? '...' : '')
      }))
    );
  } finally {
    await vite.close();
  }
}

prerender().catch((err) => {
  console.error('❌ [CritCalc Prerender] Fatal error during static prerender:', err);
  process.exit(1);
});
