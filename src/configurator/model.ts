export type RoofType = 'mono' | 'gable' | 'hip' | 'multi';
export type SystemId = 'metal' | 'trapezoid' | 'seam' | 'ceramic' | 'concrete' | 'shingle';
export type RoofColor = 'anthracite' | 'black' | 'terracotta' | 'brown' | 'graphite' | 'silver';
export type LayerId = 'covering' | 'battens' | 'counter' | 'membrane' | 'sheathing' | 'structure';

export interface RoofConfig {
  version: 1;
  type: RoofType;
  length: number;
  width: number;
  height: number;
  pitch: number;
  overhang: number;
  ridgeLength: number | null;
  wingWidth: number;
  wingLength: number;
  productId: string;
  color: RoofColor;
  finish: 'matte' | 'satin';
  rafterSpacing: number;
  battenSpacing: number | null;
  timberLength: number;
  coveringWaste: number;
  timberWaste: number;
  membraneWaste: number;
  membraneId: 'membrane-red' | 'membrane-pure';
  membraneOverlap: number;
  windows: number;
  chimneys: number;
  sheathing: boolean;
  insulation: boolean;
  gutters: boolean;
  snowGuards: boolean;
  structuralTimber: boolean;
  labor: boolean;
  laborScope: 'itemized' | 'bundled';
  bundledLaborNet: number;
  demolition: 'none' | 'metal' | 'felt';
  disposalVolume: number;
  vatMode: 'standard' | 'residential';
  vatEligible: boolean;
  residentialArea: number;
  residentialType: 'house' | 'apartment';
  priceOverrides: Record<string, number>;
}

export const defaultConfig: RoofConfig = {
  version: 1, type: 'gable', length: 12, width: 8, height: 3.2, pitch: 35, overhang: .45,
  ridgeLength: null, wingWidth: 4, wingLength: 3, productId: 'classic-design',
  color: 'anthracite', finish: 'matte', rafterSpacing: .8, battenSpacing: null,
  timberLength: 4, coveringWaste: .03, timberWaste: .08, membraneWaste: .05,
  membraneId: 'membrane-red', membraneOverlap: .15, windows: 0, chimneys: 0,
  sheathing: false, insulation: false, gutters: true, snowGuards: false, structuralTimber: false,
  labor: true, laborScope: 'itemized', bundledLaborNet: 0, demolition: 'none', disposalVolume: 0,
  vatMode: 'standard', vatEligible: false, residentialArea: 150, residentialType: 'house', priceOverrides: {},
};

export const roofTypes: RoofType[] = ['mono', 'gable', 'hip', 'multi'];
export const numericLimits = {
  length: [3, 30], width: [3, 20], height: [2, 10], pitch: [5, 65], overhang: [0, 1.2],
  wingWidth: [2, 10], wingLength: [1, 12], rafterSpacing: [.4, 1.2], timberLength: [3, 6],
  coveringWaste: [0, .25], timberWaste: [0, .3], membraneWaste: [0, .2], membraneOverlap: [.1, .55],
  windows: [0, 4], chimneys: [0, 2], bundledLaborNet: [0, 1000], disposalVolume: [0, 100], residentialArea: [1, 10000],
} as const;
