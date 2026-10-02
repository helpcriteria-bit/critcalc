import { useEffect } from 'react';
import { SITE_NAME, DEFAULT_OG_IMAGE } from '../seo/seoConfig';

function updateTag(selector, attrName, attrValue, content) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('meta') ? 'meta' : 'link');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  if (selector.startsWith('meta')) {
    el.setAttribute('content', content || '');
  } else if (selector.startsWith('link')) {
    el.setAttribute('href', content || '');
  }
}

export function useSEO({
  title,
  description,
  canonical,
  robots = 'index, follow',
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  schema
} = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (title) {
      document.title = title;
    }

    if (description) {
      updateTag('meta[name="description"]', 'name', 'description', description);
    }

    if (robots) {
      updateTag('meta[name="robots"]', 'name', 'robots', robots);
    }

    if (canonical) {
      updateTag('link[rel="canonical"]', 'rel', 'canonical', canonical);
    }

    // Open Graph
    updateTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    updateTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    updateTag('meta[property="og:title"]', 'property', 'og:title', ogTitle || title);
    updateTag('meta[property="og:description"]', 'property', 'og:description', ogDescription || description);
    updateTag('meta[property="og:url"]', 'property', 'og:url', ogUrl || canonical);
    updateTag('meta[property="og:image"]', 'property', 'og:image', ogImage);

    // Twitter
    updateTag('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    updateTag('meta[name="twitter:title"]', 'name', 'twitter:title', twitterTitle || ogTitle || title);
    updateTag('meta[name="twitter:description"]', 'name', 'twitter:description', twitterDescription || ogDescription || description);
    updateTag('meta[name="twitter:image"]', 'name', 'twitter:image', twitterImage || ogImage);

    // Schema JSON-LD
    let scriptTag = document.querySelector('script[data-critcalc-schema="true"]');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.setAttribute('data-critcalc-schema', 'true');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [
    title,
    description,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    schema
  ]);
}
