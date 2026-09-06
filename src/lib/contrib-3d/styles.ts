export type Contrib3dStyleId =
  | 'green'
  | 'season'
  | 'south-season'
  | 'night-view'
  | 'night-green'
  | 'night-rainbow'
  | 'gitblock';

export interface Contrib3dStyleOption {
  id: Contrib3dStyleId;
  name: string;
  description: string;
  bgColor: string;
  accentColor: string;
}

export const CONTRIB_3D_STYLES: Contrib3dStyleOption[] = [
  {
    id: 'green',
    name: 'Green',
    description: 'Classic green contribution blocks',
    bgColor: '#ffffff',
    accentColor: '#40c463',
  },
  {
    id: 'season',
    name: 'Season',
    description: 'Northern hemisphere seasonal colors',
    bgColor: '#ffffff',
    accentColor: '#ff7b72',
  },
  {
    id: 'south-season',
    name: 'South Season',
    description: 'Southern hemisphere seasonal colors',
    bgColor: '#ffffff',
    accentColor: '#58a6ff',
  },
  {
    id: 'night-view',
    name: 'Night View',
    description: 'Dark city night palette',
    bgColor: '#0d1117',
    accentColor: '#58a6ff',
  },
  {
    id: 'night-green',
    name: 'Night Green',
    description: 'Dark background with green blocks',
    bgColor: '#0d1117',
    accentColor: '#39d353',
  },
  {
    id: 'night-rainbow',
    name: 'Night Rainbow',
    description: 'Animated rainbow contribution blocks',
    bgColor: '#0d1117',
    accentColor: '#ff7edb',
  },
  {
    id: 'gitblock',
    name: 'Git Block',
    description: 'Pixel-pattern block style',
    bgColor: '#0d1117',
    accentColor: '#f78166',
  },
];

export function isContrib3dStyleId(value: string): value is Contrib3dStyleId {
  return CONTRIB_3D_STYLES.some((style) => style.id === value);
}
