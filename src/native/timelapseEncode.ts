/**
 * 1.4.67: native H.264 MP4 stitch for 小樹成長片段 (iOS AVAssetWriter / Android MediaCodec).
 */
import { registerPlugin } from '@capacitor/core';
import { isNative } from './platform';

type TreeTimelapsePlugin = {
  encode(opts: { frames: string[]; holdMs?: number }): Promise<{ uri: string; path: string }>;
};

const TreeTimelapse = registerPlugin<TreeTimelapsePlugin>('TreeTimelapse');

/** Returns a file URI to an MP4, or null when not native / plugin missing / encode failed. */
export async function nativeEncodeTimelapseMp4(
  frames: string[],
  holdMs = 450,
): Promise<{ uri: string; path: string } | null> {
  if (!isNative() || frames.length < 1) return null;
  try {
    return await TreeTimelapse.encode({ frames, holdMs });
  } catch {
    return null;
  }
}
