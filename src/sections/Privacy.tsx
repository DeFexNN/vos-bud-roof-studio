'use client';

import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { clearRoofStorage, useRoof } from '@/configurator/State';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/types';
import { PageIntro } from '@/components/ui';

export default function Privacy({ locale }: { locale: Locale }) {
  const d = messages[locale], { reset } = useRoof(), [cleared, setCleared] = useState(false);
  return <><PageIntro label={d.nav.privacy} title={d.privacyTitle} /><section className="container privacy-content"><p>{d.privacyBody}</p><button className="button" onClick={() => { reset(); try { clearRoofStorage(); } catch { /* Optional browser storage. */ } setCleared(true); }}>{cleared ? d.storageCleared : d.clearStorage}{cleared ? <Check size={18} /> : <Trash2 size={18} />}</button></section></>;
}
