export interface PaletteColor {
  id: number;
  name: string;
  color: string;
}

/** Quick-spawn color palette (hotbar 1-9) — a plain color set, not a block-type registry. */
export const PALETTE: PaletteColor[] = [
  { id: 1, name: 'Concrete', color: '#8a8f98' },
  { id: 2, name: 'Clay', color: '#a24936' },
  { id: 3, name: 'Moss', color: '#4f9e3a' },
  { id: 4, name: 'Timber', color: '#9c6b3c' },
  { id: 5, name: 'Sandstone', color: '#dcc27a' },
  { id: 6, name: 'Brick', color: '#8f3b2c' },
  { id: 7, name: 'Glass', color: '#bfe3f0' },
  { id: 8, name: 'Chrome', color: '#c7ccd6' },
  { id: 9, name: 'Emissive', color: '#5eead4' }
];
