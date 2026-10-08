import { describe, expect, it } from 'vitest';
import { shouldRequestAtt } from '../src/native/att';

describe('ATT prompt', () => {
  it('asks only on iOS, and only before the user has answered', () => {
    expect(shouldRequestAtt('ios', 'notDetermined')).toBe(true);
    expect(shouldRequestAtt('ios', 'authorized')).toBe(false);
    expect(shouldRequestAtt('ios', 'denied')).toBe(false);
    expect(shouldRequestAtt('ios', 'restricted')).toBe(false);
    expect(shouldRequestAtt('android', 'notDetermined')).toBe(false);
    expect(shouldRequestAtt('web', 'notDetermined')).toBe(false);
  });
});
