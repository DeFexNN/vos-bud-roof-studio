import type { Locale } from '@/i18n/types';
export type Page = 'home' | 'services' | 'projects' | 'materials' | 'studio' | 'calculator' | 'contact' | 'privacy';
export const routes: Record<Locale, Record<Page, string>> = {
  pl: { home: '', services: 'podejscie', projects: 'realizacje', materials: 'materialy', studio: 'studio', calculator: 'kosztorys', contact: 'kontakt', privacy: 'prywatnosc' },
  en: { home: '', services: 'approach', projects: 'projects', materials: 'materials', studio: 'studio', calculator: 'estimate', contact: 'contact', privacy: 'privacy' },
};
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000${basePath}`).replace(/\/$/, '');
export const asset = (path: string) => `${basePath}${path}`;
export const href = (locale: Locale, page: Page = 'home', project?: string) => `/${locale}/${routes[locale][page] ? routes[locale][page] + '/' : ''}${project ? project + '/' : ''}`;
export const absolute = (path: string) => `${siteUrl}${path}`;
export const projectImage = (number: string, phase: 'before' | 'after' | 'collage', width = 960) => asset(`/images/projects/${number}-${phase}-${width}.webp`);
export const contactInstagram = 'https://www.instagram.com/v.o.s_bud/';
export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
