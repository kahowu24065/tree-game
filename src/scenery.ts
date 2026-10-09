/**
 * 1.4.58 tappable scenery: the one-line caption for a tapped rock, bush, flower, island decoration or 養分地標.
 * Decorations say which hatch earned them (1st, then every 10th: see nest.ts nestBuildAt).
 */
import { t as tl } from './i18n';
import { NEST_BUILD_LABEL, type NestBuildKind } from './nest';
import { formatHeight } from './util';

export type SceneryTap =
  | { kind: 'decor'; decor: NestBuildKind; index: number }
  | { kind: 'landmark' | 'rock' | 'bush' | 'flower'; index: number }
  | { kind: 'vignette'; eventId: string; index: number };

/** Hatch count that built decoration `index` (earn order): 1, 10, 20, 30… */
export function decorHatchCount(index: number): number {
  return index <= 0 ? 1 : index * 10;
}

const LINES = { rock: 3, bush: 2, flower: 3 } as const;

/** `turn` rotates the flavour lines so repeated taps don't always say the same thing. */
export function sceneryCaption(hit: SceneryTap, landmark: { name: string; heightCm: number } | null, turn = 0, vignetteLine: string | null = null): string | null {
  if (hit.kind === 'vignette') return vignetteLine;
  if (hit.kind === 'decor') return tl('scene.decor', { name: NEST_BUILD_LABEL[hit.decor], n: decorHatchCount(hit.index) });
  if (hit.kind === 'landmark') return landmark ? tl('scene.landmark', { name: landmark.name, height: formatHeight(landmark.heightCm) }) : null;
  const n = LINES[hit.kind];
  return tl(`scene.${hit.kind}${((hit.index + turn) % n) + 1}`);
}
