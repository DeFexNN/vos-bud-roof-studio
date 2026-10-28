import '@/styles/globals.css';
import '@/styles/loft.css';
import { fontClasses } from '@/lib/fonts';
export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pl" className={fontClasses}><body>{children}</body></html>;
}
