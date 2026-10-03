import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('🔍 [CritCalc SEO Verification] Running comprehensive SEO validation...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Check robots.txt
const robotsPath = path.resolve(distDir, 'robots.txt');
assert(fs.existsSync(robotsPath), 'robots.txt exists in dist');
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf-8');
  assert(robots.includes('Disallow: /my-canvases'), 'robots.txt disallows /my-canvases');
  assert(robots.includes('Sitemap: https://critcalc.web.app/sitemap.xml'), 'robots.txt points to correct sitemap.xml');
}

// 2. Check sitemap.xml
const sitemapPath = path.resolve(distDir, 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'sitemap.xml exists in dist');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf-8');
  assert(!sitemap.includes('my-canvases'), 'sitemap.xml does NOT contain private /my-canvases route');
  assert(sitemap.includes('https://critcalc.web.app/scientific-calculator'), 'sitemap contains /scientific-calculator');
  assert(sitemap.includes('https://critcalc.web.app/geometry-calculator'), 'sitemap contains /geometry-calculator');
  assert(sitemap.includes('https://critcalc.web.app/math-tutor'), 'sitemap contains /math-tutor');
  assert(sitemap.includes('https://critcalc.web.app/learn/algebra'), 'sitemap contains /learn/algebra');
}

// 3. Verify private routes are NOT prerendered into dist
const myCanvasesPrerendered = path.resolve(distDir, 'my-canvases', 'index.html');
assert(!fs.existsSync(myCanvasesPrerendered), 'Private /my-canvases/index.html was NOT generated in dist');

// 4. Verify all expected public pages
const expectedPages = [
  'index.html',
  'scientific-calculator/index.html',
  'geometry-calculator/index.html',
  'math-tutor/index.html',
  'calculator/index.html',
  'canvas/index.html',
  'tutor/index.html',
  'learn/index.html',
  'learn/algebra/index.html',
  'learn/geometry/index.html',
  'learn/trigonometry/index.html',
  'learn/coordinate-geometry/index.html'
];

console.log('\n📄 Checking all 12 public prerendered pages:');
for (const relPath of expectedPages) {
  const fullPath = path.resolve(distDir, relPath);
  assert(fs.existsSync(fullPath), `File exists: ${relPath}`);

  if (fs.existsSync(fullPath)) {
    const html = fs.readFileSync(fullPath, 'utf-8');

    // Title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    assert(titleMatch && titleMatch[1].length > 10, `[${relPath}] Has title: "${titleMatch ? titleMatch[1].slice(0, 40) : ''}..."`);

    // Meta Description
    const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    assert(descMatch && descMatch[1].length > 20, `[${relPath}] Has description: "${descMatch ? descMatch[1].slice(0, 40) : ''}..."`);

    // Canonical
    const canonMatch = html.match(/<link\s+rel="canonical"\s+href="(.*?)"/i);
    assert(canonMatch && canonMatch[1].startsWith('https://critcalc.web.app'), `[${relPath}] Has valid canonical URL`);

    // H1
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    assert(h1Matches.length === 1, `[${relPath}] Has exactly ONE <h1> tag`);

    // Open Graph
    assert(html.includes('property="og:title"'), `[${relPath}] Has og:title`);
    assert(html.includes('property="og:description"'), `[${relPath}] Has og:description`);
    assert(html.includes('property="og:url"'), `[${relPath}] Has og:url`);
    assert(html.includes('property="og:image"'), `[${relPath}] Has og:image`);

    // Twitter Card
    assert(html.includes('name="twitter:card"'), `[${relPath}] Has twitter:card`);
    assert(html.includes('name="twitter:title"'), `[${relPath}] Has twitter:title`);

    // JSON-LD Validation
    const jsonLdMatch = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    assert(!!jsonLdMatch, `[${relPath}] Has JSON-LD script block`);
    if (jsonLdMatch) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1]);
        assert(parsed['@context'] === 'https://schema.org', `[${relPath}] JSON-LD has schema.org context`);
      } catch (err) {
        assert(false, `[${relPath}] JSON-LD parse failed: ${err.message}`);
      }
    }
  }
}

console.log(`\n========================================`);
console.log(`Verification Summary: ${passCount} passed, ${failCount} failed.`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
}
