import localFont from 'next/font/local';

// Subsets must fall through to one another before the system fallback. An
// injected Arial fallback in the extended subset otherwise masks Latin glyphs.
const manrope = localFont({ src: '../../public/fonts/manrope.woff2', variable: '--font-manrope-latin', display: 'swap', weight: '200 800', adjustFontFallback: false });
const manropeExtended = localFont({ src: '../../public/fonts/manrope-ext.woff2', variable: '--font-manrope-ext', display: 'swap', weight: '200 800', adjustFontFallback: false });
const editorial = localFont({ src: '../../public/fonts/editorial.woff2', variable: '--font-editorial-latin', display: 'swap', weight: '400', adjustFontFallback: false });
const editorialExtended = localFont({ src: '../../public/fonts/editorial-ext.woff2', variable: '--font-editorial-ext', display: 'swap', weight: '400', adjustFontFallback: false });
export const fontClasses = [manrope.variable, manropeExtended.variable, editorial.variable, editorialExtended.variable].join(' ');
