import React from 'react';
import { useSEO } from '../../hooks/useSEO';
import { SEO_DATA } from '../../seo/seoConfig';

export default function SEO({ route, ...overrideProps }) {
  const baseData = (route && SEO_DATA[route]) ? SEO_DATA[route] : {};
  const merged = { ...baseData, ...overrideProps };

  useSEO(merged);

  return null;
}
