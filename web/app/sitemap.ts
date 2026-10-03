import type { MetadataRoute } from 'next';
import { getPublicProjects } from '@/lib/content';
import { SITE_URL } from '@/lib/supabase/config';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const pages = ['/', '/about', '/services', '/projects', '/technology', '/contact'].map((path) => ({
    url: SITE_URL + path,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.8,
  }));
  const projects = await getPublicProjects();
  const projectPages = projects.map((p) => ({
    url: `${SITE_URL}/project/${p.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  return [...pages, ...projectPages];
}
