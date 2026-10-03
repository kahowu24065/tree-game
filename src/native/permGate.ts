import { kvSet } from './kv';

/**
 * 1.4.45: OS permission prompts (location, notifications) wait until the first tree is planted, named and the
 * watering + fertilizing coach is finished. Before that, location / reminders only run if permission was already
 * granted (no prompt). Existing players are let through at once; once open the gate stays open.
 */
export const PERMS_KEY = 'sekai-tree-perms-ready';

let open: boolean | null = null;

export function permsReady(): boolean {
  if (open) return true;
  try {
    if (localStorage.getItem(PERMS_KEY) === '1') open = true;
  } catch {
    /* no storage */
  }
  return open === true;
}

/** Open the gate; true when it was closed before (so the caller asks now, in order). */
export function openPerms(): boolean {
  if (permsReady()) return false;
  open = true;
  try {
    kvSet(PERMS_KEY, '1');
  } catch {
    /* storage full: still open for this session */
  }
  return true;
}

/** Tests. */
export function resetPermsGate(): void {
  open = null;
}

/** Onboarding is over: a planted tree, and the coach finished / skipped (or never armed: a pre-coach tree). */
export function onboardingDone(started: boolean, coach: { armed: boolean; done: boolean }): boolean {
  return started && (coach.done || !coach.armed);
}
