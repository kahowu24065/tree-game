/**
 * 1.4.62 App Tracking Transparency: ask once per install, and only while iOS still has no answer.
 * The prompt itself runs at launch on the ios branch (before the first screen). UMP stays later.
 */
export function shouldRequestAtt(platform: string, status: string): boolean {
  return platform === 'ios' && status === 'notDetermined';
}
