import { expect, it } from 'vitest';
import { switchLocale, t } from '../src/i18n';

it('1.4.47 iOS weather album: "1 day ... is saved" / "3 days ... are saved"', () => {
  switchLocale('en' as never);
  expect(t('prem.albumLocked', { n: 1 })).toContain('1 day of real weather is saved.');
  expect(t('prem.albumLocked', { n: 3 })).toContain('3 days of real weather are saved.');
  switchLocale('zh-HK' as never);
});
