/**
 * v1.4 設定 → 玩法: every rule / formula explanation in one tabbed, scrollable panel.
 * v1.4.1: complete content; every number comes from balance.ts / species data (nothing typed in by hand).
 */
import {
  AGE_MILESTONES,
  BADGES,
  BRANCH_EXPANSION,
  CARBON_FRACTION,
  CHAVE_COEF,
  CHAVE_EXP,
  CO2_PER_CARBON,
  DBH_HEIGHT_EXP,
  ROOT_SHOOT,
  STEM_FORM,
  CARE,
  COLLAPSE_HEIGHT_LOSS,
  COLLAPSE_MAX,
  COLLAPSE_REINFORCE_MULT,
  COLD_ABS_MIN_C,
  COLD_REL_DROP_C,
  COLD_REL_MAX_C,
  DYING_HOURS,
  EMERGENCY,
  GROWTH_FLOOR_SHARE,
  GROWTH_TAU_DAYS,
  H_MULT_TIERS,
  HOT_ABS_MAX_C,
  HOT_REL_MIN_C,
  HOT_REL_RISE_C,
  LANDMARK_N_BONUS,
  MILESTONE_TIER_SHARE,
  MIN_HEIGHT_CM,
  N_DAILY_USE,
  N_FACTOR,
  N_MALNOURISHED,
  N_OPTIMAL,
  NORMAL_PAST_DAYS,
  PEST_DAMAGE,
  PEST_TRIGGER_DAYS,
  RESIDENT_PEST_CUT,
  RESIDENT_PEST_MAX_SPECIES,
  pestDamageWith,
  pestTriggerDays,
  PREPS,
  R_DAILY_DECAY,
  R_MAX,
  RAIN_OVER_CAP,
  RECORD_MILESTONE,
  RESCUE_HEALTH,
  RESIDENT_LEAVE_H,
  RESIDENT_MIN_H,
  RESIDENT_STREAKS,
  RESIDENT_STREAK_LATER,
  REVIVE_HEALTH,
  START,
  STORM_SURVIVE_GROWTH,
  STORM_SURVIVE_SHARE,
  T1_WATER_LOSS_MULT,
  T2_RAIN_TO_N_CHANCE,
  W_MAX,
  W_NIGHT_LOSS,
  W_OPTIMAL,
  W_SATURATED,
  W_TIERS,
  WEATHER_EVENTS,
  WX_TRACKS,
  WIND_UNLOCK_STAGE,
  WX_CATEGORY_ORDER,
  WX_OBS,
  type WeatherEventId,
} from './balance';
import { SPECIES, STAGE_NAMES, STAGE_SHARES } from './data/species';
import { emergencyName, eventLabel, labelRegion, regionalize, weatherTrackCopy } from './labels';
import { emergencyBonus } from './rules';
import { eventTableHtml } from './ui';
import { t as tl, live } from './i18n';

export type GuideTab = 'play' | 'calc' | 'weather' | 'push';
export const GUIDE_TABS: { id: GuideTab; label: string }[] = live(() => ([
  { id: 'play', label: tl('guide.001') },
  { id: 'calc', label: tl('guide.002') },
  { id: 'weather', label: tl('guide.003') },
  { id: 'push', label: tl('guide.004') },
]));

const p = (html: string) => `<p>${html}</p>`;
const h = (text: string) => `<h3>${text}</h3>`;
const ul = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const table = (head: string[], rows: (string | number)[][]) =>
  `<div class="gtable-wrap"><table class="gtable"><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
const E = WEATHER_EVENTS;
const L = (id: WeatherEventId) => eventLabel(id);
const youth = STAGE_NAMES[WIND_UNLOCK_STAGE];
const rainDrain = () => emergencyName('rainDrain');
const windIds = () => WX_CATEGORY_ORDER.wind;
const windRow = (id: WeatherEventId) => `${L(id)} ${E[id].damage}`;

function playTab(): string {
  const wOpt = `${W_OPTIMAL[0]}–${W_OPTIMAL[1]}`;
  return [
    h(tl('guide.005')),
    p(tl('guide.006')),
    h(tl('guide.007')),
    table(
      [tl('guide.008'), tl('guide.009'), tl('guide.010'), tl('guide.011'), tl('guide.012')],
      [
        [tl('guide.013'), '0–100', tl('guide.014'), START.health, tl('guide.015')],
        [tl('guide.016'), `0–${W_MAX}`, wOpt, START.moisture, tl('guide.017', { W_SATURATED, W_MAX })],
        [tl('guide.018'), '0–100', `${N_OPTIMAL[0]}+`, START.nutrients, tl('guide.019', { N_DAILY_USE, N_MALNOURISHED })],
        [tl('guide.020'), `0–${R_MAX}`, tl('guide.021'), START.resist, tl('guide.022', { youth })],
      ],
    ),
    h(tl('guide.023')),
    table(
      [tl('guide.024'), tl('guide.025'), tl('guide.026')],
      [
        [tl('ui.115'), tl('guide.027', { amount: CARE.water.amount, W_SATURATED }), tl('guide.waterLimit', { perHour: CARE.water.perHour })],
        [tl('ui.209'), tl('guide.028', { amount: CARE.drain.amount }), CARE.drain.perDay],
        [tl('ui.099'), tl('guide.029', { amount: CARE.fertilize.amount }), CARE.fertilize.perDay],
        [tl('ui.122'), tl('guide.030'), 1],
        [tl('ui.123'), tl('guide.031', { amount: PREPS.stakes.amount, amount_: PREPS.ropes.amount, amount__: PREPS.prune.amount, R_MAX, youth }), tl('guide.032')],
      ],
    ),
    h(tl('guide.033')),
    p(tl('guide.034')),
    table(
      [tl('guide.035'), tl('ui.180'), tl('guide.025')],
      [
        [L('hot'), emergencyName('heatWater'), tl('guide.036', { amount: EMERGENCY.heatWater.amount, W_SATURATED })],
        [tl('guide.037', { p0: L('rainstorm'), p1: L('blackrain') }), rainDrain(), tl('guide.038', { amount: EMERGENCY.rainDrain.amount, floor: EMERGENCY.rainDrain.floor })],
        [L('cold'), emergencyName('warmCover'), tl('guide.039')],
        [tl('guide.041', { p0: labelRegion() === 'intl' ? '' : tl('guide.040') }), tl('ui.123'), tl('guide.042', { youth })],
      ],
    ),
    h(tl('guide.043')),
    table(
      [tl('guide.044'), tl('guide.045'), tl('guide.046')],
      STAGE_NAMES.map((n, i) => [n, pct(STAGE_SHARES[i]!), i === WIND_UNLOCK_STAGE ? tl('guide.047') : i === 0 ? tl('guide.048', { heightCm: START.heightCm }) : '']),
    ),
    h(tl('ui.068')),
    p(tl('guide.049', { PEST_TRIGGER_DAYS, N_MALNOURISHED, W_SATURATED, RESIDENT_PEST_MAX_SPECIES, p5: pestTriggerDays(RESIDENT_PEST_MAX_SPECIES), PEST_DAMAGE, RESIDENT_PEST_CUT, p9: pestDamageWith(RESIDENT_PEST_MAX_SPECIES) })),
    h(tl('guide.050')),
    ul([
      tl('guide.051', { W_MAX, DYING_HOURS }),
      tl('guide.052', { wOpt, p1: N_OPTIMAL[0], RESCUE_HEALTH }),
      tl('guide.053', { REVIVE_HEALTH }),
      tl('guide.054', { p0: Math.round(COLLAPSE_HEIGHT_LOSS * 100), COLLAPSE_MAX, p2: COLLAPSE_MAX + 1 }),
      tl('guide.055', { LANDMARK_N_BONUS }),
    ]),
    h(tl('guide.056')),
    p(tl('guide.057', { p0: RESIDENT_STREAKS[0], RESIDENT_MIN_H, p2: RESIDENT_STREAKS[1], RESIDENT_STREAK_LATER, RESIDENT_LEAVE_H })),
    p(tl('guide.058')),
    h(tl('guide.059')),
    table(
      [tl('guide.060'), tl('guide.061')],
      [
        ...AGE_MILESTONES.map((m) => [m.label, tl('guide.063', { p0: m.perk ? tl('guide.062', { p0: BADGES[m.perk].name, p1: BADGES[m.perk].perk }) : '' })]),
        [tl('guide.064'), RECORD_MILESTONE.label],
      ],
    ),
    p(tl('guide.065')),
    p(tl('guide.066')),
    h(tl('ui.192')),
    table(
      [tl('guide.067'), tl('guide.068')],
      WX_TRACKS.map((t) => {
        const copy = weatherTrackCopy(t.id);
        return [copy.name, copy.detail];
      }),
    ),
    p(tl('guide.069')),
    h(tl('guide.070')),
    table(
      [tl('guide.070'), tl('ui.367')],
      SPECIES.map((s) => [`${s.name}<br><small>${s.english}</small>`, tl('guide.071', { targetM: s.targetM })]),
    ),
    h(tl('guide.072')),
    p(tl('guide.073')),
  ].join('');
}

function calcTab(): string {
  const tiers = W_TIERS.map((t, i) => {
    const lo = i === 0 ? 0 : Math.floor(W_TIERS[i - 1]!.max) + 1;
    const hi = t.max === Infinity ? W_MAX - 1 : Math.floor(t.max);
    return [`${lo}–${hi}`, t.label, `${t.score > 0 ? '+' : ''}${t.score}`];
  });
  tiers.push([`${W_MAX}`, tl('ui.043'), tl('guide.074')]);
  return [
    h(tl('guide.075')),
    p(tl('guide.076')),
    h(tl('guide.077')),
    ul([
      tl('guide.078', { W_NIGHT_LOSS, p1: L('rainstorm'), p2: L('blackrain'), dW: E.drizzle.dW, W_SATURATED, drizzle: RAIN_OVER_CAP.drizzle, dW_: E.rainstorm.dW, heavy: RAIN_OVER_CAP.heavy }),
      tl('guide.079', { N_DAILY_USE }),
      tl('guide.080', { youth, R_DAILY_DECAY }),
    ]),
    h(tl('guide.081')),
    ul([
      tl('guide.082'),
      tl('guide.083'),
      tl('guide.084'),
      tl('guide.085'),
    ]),
    h(tl('guide.086')),
    p(tl('guide.087')),
    table([tl('ui.091'), tl('guide.088'), tl('guide.089')], tiers),
    table(
      [tl('ui.111'), tl('guide.090')],
      [
        [`${N_OPTIMAL[0]}+`, `+${N_FACTOR.good}`],
        [`${N_MALNOURISHED}–${N_OPTIMAL[0] - 1}`, `${N_FACTOR.mid}`],
        [tl('guide.091', { N_MALNOURISHED }), `${N_FACTOR.bad}`],
      ],
    ),
    h(tl('guide.092')),
    table(
      [tl('guide.093'), tl('guide.094'), tl('guide.095'), tl('guide.096')],
      [
        [tl('guide.097'), L('hot'), `−${E.hot.damage}`, tl('guide.098', { p0: emergencyName('heatWater') })],
        [tl('guide.099'), L('cold'), `−${E.cold.damage}`, tl('guide.098', { p0: emergencyName('warmCover') })],
        [tl('guide.100'), tl('guide.037', { p0: L('rainstorm'), p1: L('blackrain') }), tl('guide.101', { damage: E.rainstorm.damage, damage_: E.blackrain.damage }), tl('guide.098', { p0: rainDrain() })],
        [tl('ui.164'), windIds().map(windRow).join(tl('ui.206')), tl('guide.102'), tl('guide.103', { youth })],
      ],
    ),
    p(tl('guide.104', { PEST_DAMAGE, RESIDENT_PEST_CUT })),
    h(tl('ui.065')),
    p(tl('guide.105', { p0: emergencyBonus(1), bonus: EMERGENCY.bonus, bothMult: EMERGENCY.bothMult, p3: emergencyBonus(2), p4: emergencyBonus(3) })),
    h(tl('guide.106')),
    ul([
      tl('guide.107'),
      tl('guide.109', { p0: L('rainstorm'), p1: L('blackrain'), p2: windIds().map(L).join(' &lt; ').replace(`${L('landslip')} &lt; ${L('typhoon1')}`, `${L('typhoon1')}${labelRegion() === 'intl' ? '' : tl('guide.108') + L('landslip')}`) }),
      tl('guide.110', { p0: L('rainstorm'), p1: L('blackrain'), dW: E.rainstorm.dW }),
      labelRegion() === 'intl' ? '' : tl('guide.111'),
    ].filter(Boolean)),
    h(tl('guide.112')),
    table(
      [tl('guide.113'), tl('guide.114'), tl('guide.115'), tl('guide.116')],
      windIds().filter((id) => labelRegion() !== 'intl' || id !== 'landslip').map((id) => [L(id), E[id].damage, -E[id].dR, E[id].collapseBelow ?? '—']),
    ),
    ul([
      tl('guide.117'),
      tl('guide.118', { p0: Math.round(COLLAPSE_HEIGHT_LOSS * 100), p1: COLLAPSE_MAX + 1, COLLAPSE_REINFORCE_MULT }),
      tl('guide.119', { youth }),
    ]),
    h(tl('guide.120')),
    p(tl('guide.121', { GROWTH_TAU_DAYS, p1: GROWTH_FLOOR_SHARE * 100 })),
    p(tl('guide.122')),
    table([tl('guide.123'), tl('guide.124')], H_MULT_TIERS.map((t, i) => [i === 0 ? `${t.min}+` : `${t.min}–${H_MULT_TIERS[i - 1]!.min - 1}`, tl('guide.125', { mult: t.mult, label: t.label })])),
    p(tl('guide.126', { p0: (['clear', 'drizzle', 'hot', 'cold', 'rainstorm', 'blackrain', 'typhoon1', 'thunder', 'typhoon8'] as WeatherEventId[]).map((id) => `${L(id)} ×${E[id].growth}`).join(tl('ui.206')), youth, p2: Math.round(STORM_SURVIVE_SHARE * 100), p3: Math.round((1 - STORM_SURVIVE_SHARE) * 100), STORM_SURVIVE_GROWTH, MIN_HEIGHT_CM })),
    p(tl('guide.127', { p0: pct(1 - Math.exp(-30 / GROWTH_TAU_DAYS)), p1: pct(1 - Math.exp(-90 / GROWTH_TAU_DAYS)), p2: pct(1 - Math.exp(-182 / GROWTH_TAU_DAYS)), p3: pct(1 - Math.exp(-365 / GROWTH_TAU_DAYS)) })),
    h(tl('guide.128')),
    p(tl('guide.129', { GROWTH_TAU_DAYS, p1: Math.round(MILESTONE_TIER_SHARE.gold * 100), p2: Math.round(MILESTONE_TIER_SHARE.silver * 100) })),
    p(tl('guide.130', { T1_WATER_LOSS_MULT, p1: L('rainstorm'), p2: Math.round(T2_RAIN_TO_N_CHANCE * 100) })),
    h(tl('guide.131')),
    p(tl('guide.132', { DBH_HEIGHT_EXP, CHAVE_COEF, CHAVE_EXP, STEM_FORM, BRANCH_EXPANSION, p5: 1 + ROOT_SHOOT, CARBON_FRACTION, p7: Math.round(CO2_PER_CARBON * 1000) / 1000 })),
  ].join('');
}

function weatherTab(): string {
  const L = (id: WeatherEventId) => eventLabel(id, 'hk');
  const rainDrain = () => emergencyName('rainDrain', 'hk');
  const hkRows: string[][] = [
    [tl('guide.133'), L('hot'), emergencyName('heatWater'), tl('guide.134', { dW: E.hot.dW, damage: E.hot.damage })],
    [tl('guide.135'), L('cold'), emergencyName('warmCover'), tl('guide.136', { damage: E.cold.damage })],
    [tl('guide.137'), L('rainstorm'), rainDrain(), tl('guide.138', { dW: E.rainstorm.dW, W_SATURATED, heavy: RAIN_OVER_CAP.heavy, damage: E.rainstorm.damage })],
    [tl('guide.139'), L('blackrain'), rainDrain(), tl('guide.140', { damage: E.blackrain.damage })],
    [tl('guide.141'), L('thunder'), tl('ui.123'), tl('guide.142', { damage: E.thunder.damage, collapseBelow: E.thunder.collapseBelow })],
    [tl('guide.143'), L('typhoon1'), tl('ui.123'), tl('guide.142', { damage: E.typhoon1.damage, collapseBelow: E.typhoon1.collapseBelow })],
    [tl('guide.144'), L('landslip'), tl('ui.123'), tl('guide.145', { damage: E.landslip.damage, collapseBelow: E.landslip.collapseBelow })],
    [tl('guide.146'), L('typhoon8'), tl('ui.123'), tl('guide.142', { damage: E.typhoon8.damage, collapseBelow: E.typhoon8.collapseBelow })],
  ];
  const intlRows: string[][] = [
    [eventLabel('hot', 'intl'), tl('guide.147', { HOT_ABS_MAX_C, HOT_REL_MIN_C, NORMAL_PAST_DAYS, HOT_REL_RISE_C })],
    [L('cold'), tl('guide.148', { COLD_ABS_MIN_C, COLD_REL_MAX_C, NORMAL_PAST_DAYS, COLD_REL_DROP_C })],
    [eventLabel('rainstorm', 'intl'), tl('guide.obsRain', { mm: WX_OBS.rainstorm.mmHour })],
    [eventLabel('blackrain', 'intl'), tl('guide.obsBlack', { mm: WX_OBS.blackrain.mmHour, mm3: WX_OBS.blackrain.mm3h })],
    [L('thunder'), tl('guide.obsThunder', { code: WX_OBS.thunderCode })],
    [eventLabel('typhoon1', 'intl'), tl('guide.obsWind', { hours: WX_OBS.windHours, wind: WX_OBS.typhoon1.wind, gust: WX_OBS.typhoon1.gust })],
    [eventLabel('typhoon8', 'intl'), tl('guide.obsWind', { hours: WX_OBS.windHours, wind: WX_OBS.typhoon8.wind, gust: WX_OBS.typhoon8.gust })],
  ];
  const ev = { black: eventLabel('blackrain', 'intl'), rain: eventLabel('rainstorm', 'intl'), t8: eventLabel('typhoon8', 'intl'), t1: eventLabel('typhoon1', 'intl'), thunder: L('thunder'), hot: eventLabel('hot', 'intl'), cold: L('cold') };
  const I = (id: WeatherEventId) => eventLabel(id, 'intl');
  const twRows: string[][] = [
    [tl('guide.152'), I('typhoon1'), tl('ui.123')],
    [tl('guide.153'), I('typhoon8'), tl('ui.123')],
    [tl('guide.154'), I('typhoon1'), tl('ui.123')],
    [tl('guide.155'), L('thunder'), tl('ui.123')],
    [tl('guide.156'), I('typhoon8'), tl('ui.123')],
    [tl('guide.157'), L('thunder'), tl('ui.123')],
    [tl('guide.158'), I('rainstorm'), emergencyName('rainDrain', 'intl')],
    [tl('guide.159'), I('blackrain'), emergencyName('rainDrain', 'intl')],
    [tl('guide.160'), I('hot'), emergencyName('heatWater')],
    [tl('guide.161'), L('cold'), emergencyName('warmCover')],
    [tl('guide.162'), tl('guide.163'), '—'],
  ];
  return [
    h(tl('guide.164')),
    table([tl('guide.165'), tl('guide.166'), tl('guide.167'), tl('guide.168')], hkRows),
    ul([
      tl('guide.169'),
      tl('guide.170', { youth }),
      tl('guide.171'),
      tl('guide.172'),
      tl('guide.173'),
      tl('guide.174'),
    ]),
    h(tl('guide.175')),
    table([tl('guide.176'), tl('guide.166'), tl('guide.167')], twRows),
    ul([
      tl('guide.177'),
      tl('guide.178'),
      tl('guide.179'),
      tl('guide.180'),
    ]),
    h(tl('guide.181')),
    p(tl('guide.182', { p0: eventLabel('hot', 'intl'), p1: eventLabel('typhoon1', 'intl'), p2: eventLabel('typhoon8', 'intl'), p3: eventLabel('rainstorm', 'intl'), p4: eventLabel('blackrain', 'intl'), p5: emergencyName('rainDrain', 'intl') })),
    p(tl('guide.feedIntro')),
    ul([tl('guide.feedUS', ev), tl('guide.feedCA', ev), tl('guide.feedJP', ev), tl('guide.feedEU', ev)]),
    p(tl('guide.obsIntro', { x: WX_OBS.currentToHour })),
    table([tl('guide.094'), tl('guide.183')], intlRows),
    p(tl('guide.184')),
    h(tl('guide.185')),
    ul([
      tl('guide.186'),
      tl('guide.187'),
      tl('guide.188'),
      tl('guide.feedCard'),
    ].filter(Boolean)),
    h(tl('guide.189')),
    eventTableHtml(),
  ].join('');
}

function pushTab(): string {
  return [
    h(tl('guide.190')),
    p(tl('guide.191')),
    h(tl('guide.192')),
    table(
      [tl('guide.193'), tl('guide.194')],
      [
        [tl('guide.195'), tl('guide.196')],
        [tl('guide.197', { youth }), tl('guide.198')],
        [tl('guide.199'), tl('guide.200')],
        [tl('guide.201'), tl('guide.202')],
      ],
    ),
  ].join('');
}

export function guideModal(tab: GuideTab = 'play'): string {
  const body = tab === 'calc' ? calcTab() : tab === 'weather' ? weatherTab() : tab === 'push' ? pushTab() : playTab();
  return tl('guide.212', { p0: GUIDE_TABS.map((t) => `<button type="button" class="${t.id === tab ? 'on' : ''}" data-guide="${t.id}">${t.label}</button>`).join(''), p1: tab === 'weather' || tab === 'push' ? body : regionalize(body) });
}
