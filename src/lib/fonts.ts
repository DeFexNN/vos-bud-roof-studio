import localFont from 'next/font/local';

const manrope = localFont({ src: '../../public/fonts/manrope.woff2', variable: '--font-manrope-latin', display: 'swap', weight: '200 800' });
const manropeExtended = localFont({ src: '../../public/fonts/manrope-ext.woff2', variable: '--font-manrope-ext', display: 'swap', weight: '200 800' });
const editorial = localFont({ src: '../../public/fonts/editorial.woff2', variable: '--font-editorial-latin', display: 'swap', weight: '400' });
const editorialExtended = localFont({ src: '../../public/fonts/editorial-ext.woff2', variable: '--font-editorial-ext', display: 'swap', weight: '400' });
export const fontClasses = [manrope.variable, manropeExtended.variable, editorial.variable, editorialExtended.variable].join(' ');
