'use client';

import { atom, useAtom } from 'jotai';
import { LAYOUT_OPTIONS } from '@/lib/constants';

// 1. set initial atom for Bitchest layout
const BitchestLayoutAtom = atom(
  typeof window !== 'undefined'
    ? localStorage.getItem('Bitchest-layout')
    : LAYOUT_OPTIONS.MODERN,
);

const BitchestLayoutAtomWithPersistence = atom(
  (get) => get(BitchestLayoutAtom),
  (get, set, newStorage: any) => {
    set(BitchestLayoutAtom, newStorage);
    localStorage.setItem('Bitchest-layout', newStorage);
  },
);

// 2. useLayout hook to check which layout is available
export function useLayout() {
  const [layout, setLayout] = useAtom(BitchestLayoutAtomWithPersistence);
  return {
    layout: layout === null ? LAYOUT_OPTIONS.MODERN : layout,
    setLayout,
  };
}
