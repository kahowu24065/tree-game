import type { AnimalArrival, AnimalMarker } from './three/animals3d';
import type { AnimalCategory, LookKind, Motion } from './data/animals';
import { esc } from './util';

/**
 * v9 animal HUD: overview markers for animals too small to see, a 「一群…飛咗嚟」 arrival toast, and a
 * toggleable 「島上動物」 list. Everything here is DOM over the canvas; the scene only supplies positions.
 */

export interface HudScene {
  animalMarkers(): AnimalMarker[];
  followCrew(uid: number): boolean;
  followingUid(): number | null;
  crewList(): { uid: number; id: string; name: string; category: AnimalCategory; kind: LookKind; count: number; resident: boolean }[];
  takeArrivals(): AnimalArrival[];
}

export interface AnimalHud {
  update(time: number): void;
  /** For checks: what the HUD shows right now. */
  debug(): { markers: { uid: number; id: string; x: number; y: number; alpha: number; cluster: number }[]; toast: string | null; toastUids: number[]; listOpen: boolean; list: string[] };
  setEnabled(on: boolean): void;
  /** v10: re-render now (e.g. a species just became 「已見」, so its 新 badge must go everywhere). */
  refresh(): void;
}

/** Marker shows while the animal is smaller than this on screen (CSS px) and fades out by FADE_PX. */
export const MARKER_PX = 10;
export const FADE_PX = 22;
const MAX_MARKERS = 10;
const CLUSTER_PX = 30;

export function animalIcon(category: AnimalCategory, kind: LookKind): string {
  switch (kind) {
    case 'monkey':
      return '🐒';
    case 'squirrel':
      return '🐿️';
    case 'bat':
      return '🦇';
    case 'owl':
      return '🦉';
    case 'bee':
      return '🐝';
    case 'snake':
      return '🐍';
    case 'turtle':
      return '🐢';
    case 'frog':
      return '🐸';
    case 'firefly':
      return '✨';
    default:
  }
  switch (category) {
    case 'bird':
      return '🐦';
    case 'butterfly':
      return '🦋';
    case 'insect':
      return '🐞';
    case 'reptile':
      return '🦎';
    case 'amphibian':
      return '🐸';
    case 'mammal':
      return '🐾';
  }
}

const VERB: Record<Motion, string> = {
  perch: '飛咗嚟',
  flock: '飛咗嚟',
  soar: '喺天上盤旋',
  hover: '飛咗嚟',
  flutter: '飛咗嚟',
  bat: '飛咗嚟',
  walk: '行咗嚟',
  hop: '跳咗嚟',
  wade: '嚟咗水邊',
  climb: '爬上咗樹',
  crawl: '爬咗出嚟',
  glow: '亮起嚟',
  nest: '喺樹上築咗巢',
  hollow: '喺樹洞探頭',
};

function quantity(count: number): string {
  if (count >= 3) return '一群';
  if (count === 2) return '兩隻';
  return '一隻';
}

/** 「一群暗綠繡眼鳥飛咗嚟」 / 「兩隻獼猴行咗嚟」 / several at once: 「麻雀、獼猴同菜粉蝶嚟咗」. */
export function arrivalText(list: AnimalArrival[]): string {
  if (list.length === 1) {
    const a = list[0]!;
    return `${quantity(a.count)}${a.name}${VERB[a.motion]}`;
  }
  const names = list.map((a) => a.name);
  const head = names.slice(0, -1).join('、');
  return names.length > 3 ? `${names.slice(0, 3).join('、')}等 ${names.length} 群動物嚟咗` : `${head}同${names[names.length - 1]}嚟咗`;
}

function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

interface Rect {
  l: number;
  t: number;
  r: number;
  b: number;
}

export function mountAnimalHud(scene: HudScene, isFresh: (id: string) => boolean): AnimalHud {
  const layer = document.createElement('div');
  layer.id = 'animal-markers';
  layer.className = 'animal-markers';
  document.body.insertBefore(layer, document.getElementById('app'));

  const app = document.getElementById('app')!;
  const toastEl = document.createElement('button');
  toastEl.type = 'button';
  toastEl.id = 'animal-toast';
  toastEl.className = 'animal-toast';
  toastEl.hidden = true;
  app.appendChild(toastEl);

  const listBtn = document.createElement('button');
  listBtn.type = 'button';
  listBtn.id = 'animal-list-btn';
  listBtn.className = 'glass animal-list-btn';
  listBtn.setAttribute('aria-label', '島上動物');
  listBtn.setAttribute('aria-expanded', 'false');
  app.appendChild(listBtn);

  const panel = document.createElement('section');
  panel.id = 'animal-list';
  panel.className = 'glass animal-list';
  panel.hidden = true;
  panel.setAttribute('aria-label', '島上動物');
  app.appendChild(panel);

  let enabled = true;
  const els = new Map<number, HTMLButtonElement>();
  let shown: { uid: number; id: string; x: number; y: number; alpha: number; cluster: number }[] = [];
  let rects: Rect[] = [];
  let rectT = -1e9;
  let listT = -1e9;
  let listKey = '';

  // ---- arrival toast queue ----
  let pending: AnimalArrival[] = [];
  let pendingSince = 0;
  const queue: AnimalArrival[][] = [];
  let current: { list: AnimalArrival[]; until: number } | null = null;
  let gapUntil = 0;
  let nextAllowed = 0;

  const follow = (uid: number) => {
    if (scene.followCrew(uid)) closeList();
  };

  // Markers move (flocks cross the screen fast) and their contents change, so a synthesized click can land on
  // the canvas: follow on pointerdown → pointerup instead, remembering which marker the finger went down on.
  let down: { uid: number; x: number; y: number; t: number } | null = null;
  layer.addEventListener('pointerdown', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-uid]');
    if (b) down = { uid: Number(b.dataset.uid), x: e.clientX, y: e.clientY, t: performance.now() };
  });
  window.addEventListener('pointerup', (e) => {
    const d = down;
    down = null;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 16 && performance.now() - d.t < 700) follow(d.uid);
  });
  window.addEventListener('pointercancel', () => (down = null));
  // Keyboard activation (Enter / Space on a focused marker).
  layer.addEventListener('click', (e) => {
    if (e.detail !== 0) return;
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-uid]');
    if (b) follow(Number(b.dataset.uid));
  });
  toastEl.addEventListener('click', () => {
    if (!current) return;
    const live = scene.crewList();
    const target = current.list.find((a) => live.some((c) => c.uid === a.uid));
    if (target) follow(target.uid);
    current.until = 0;
  });
  listBtn.addEventListener('click', () => (panel.hidden ? openList() : closeList()));
  panel.addEventListener('click', (e) => {
    const el = e.target as HTMLElement;
    if (el.closest('[data-close]')) return closeList();
    const b = el.closest<HTMLElement>('[data-uid]');
    if (b) follow(Number(b.dataset.uid));
  });

  function openList(): void {
    panel.hidden = false;
    listBtn.setAttribute('aria-expanded', 'true');
    listKey = '';
    renderList();
  }
  function closeList(): void {
    panel.hidden = true;
    listBtn.setAttribute('aria-expanded', 'false');
  }

  function renderList(): void {
    const crews = scene.crewList();
    const following = scene.followingUid();
    const total = crews.reduce((n, c) => n + c.count, 0);
    const btnHtml = `<span class="alb-ic">🐾</span><b>${crews.length}</b>`;
    if (listBtn.innerHTML !== btnHtml) listBtn.innerHTML = btnHtml;
    listBtn.classList.toggle('has-new', crews.some((c) => isFresh(c.id)));
    if (panel.hidden) return;
    const key = `${following}|${crews.map((c) => `${c.uid}:${c.count}:${isFresh(c.id)}`).join(',')}`;
    if (key === listKey) return;
    listKey = key;
    const rows = crews
      .slice()
      .sort((a, b) => Number(isFresh(b.id)) - Number(isFresh(a.id)) || b.count - a.count)
      .map(
        (c) => `<li><button type="button" data-uid="${c.uid}" class="${c.uid === following ? 'on' : ''}" data-cat="${c.category}">
          <span class="al-ic">${animalIcon(c.category, c.kind)}</span>
          <span class="al-name">${esc(c.name)}${isFresh(c.id) ? '<em class="al-new">新</em>' : ''}${c.resident ? '<small>長駐</small>' : ''}</span>
          <span class="al-n">×${c.count}</span></button></li>`,
      )
      .join('');
    panel.innerHTML = `<header><b>島上動物</b><small>${crews.length} 群・${total} 隻</small><button type="button" class="al-close" data-close aria-label="關閉">×</button></header>
      ${rows ? `<ul>${rows}</ul><p class="al-hint">撳一下跟拍・「新」＝圖鑑未睇過</p>` : '<p class="al-empty">暫時未有動物，照顧好棵樹佢哋就會嚟。</p>'}`;
  }

  function hudRects(): Rect[] {
    const ids = ['weather-card', 'status-card', 'rail', 'sheet', 'dock', 'place-pill', 'gear', 'view-reset', 'animal-list-btn', 'animal-list', 'animal-toast', 'toast', 'note-slot', 'zoom-hint'];
    const out: Rect[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el || el.hidden || el.offsetParent === null) continue;
      if (id === 'toast' && !el.classList.contains('show')) continue;
      const r = el.getBoundingClientRect();
      if (r.width && r.height) out.push({ l: r.left - 4, t: r.top - 4, r: r.right + 4, b: r.bottom + 4 });
    }
    const fab = document.querySelector('#dev-root .dev-fab');
    if (fab) {
      const r = fab.getBoundingClientRect();
      if (r.width) out.push({ l: r.left - 4, t: r.top - 4, r: r.right + 4, b: r.bottom + 4 });
    }
    return out;
  }

  function updateMarkers(time: number): void {
    if (time - rectT > 400) {
      rectT = time;
      rects = hudRects();
    }
    const following = scene.followingUid();
    const raw = enabled ? scene.animalMarkers() : [];
    // Fresh species first, then bigger groups, then the smallest on screen.
    raw.sort((a, b) => Number(isFresh(b.id)) - Number(isFresh(a.id)) || b.count - a.count || a.px - b.px);
    const kept: { m: AnimalMarker; alpha: number; cluster: number; icons: string[] }[] = [];
    for (const m of raw) {
      if (m.uid === following) continue;
      const alpha = 1 - smooth(MARKER_PX, FADE_PX, m.px);
      if (alpha < 0.04) continue;
      // Pin box: 30 px wide, 40 px above the animal.
      const box = { l: m.x - 16, t: m.y - 42, r: m.x + 16, b: m.y + 4 };
      if (m.y < 4 || m.x < 4 || m.x > window.innerWidth - 4 || m.y > window.innerHeight - 4) continue;
      if (rects.some((r) => box.l < r.r && box.r > r.l && box.t < r.b && box.b > r.t)) continue;
      const near = kept.find((k) => Math.hypot(k.m.x - m.x, k.m.y - m.y) < CLUSTER_PX);
      if (near) {
        near.cluster++;
        continue;
      }
      if (kept.length >= MAX_MARKERS) continue;
      kept.push({ m, alpha, cluster: 0, icons: [] });
    }
    const live = new Set<number>();
    for (const k of kept) {
      const m = k.m;
      live.add(m.uid);
      let el = els.get(m.uid);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'amk';
        el.dataset.uid = String(m.uid);
        el.dataset.cat = m.category;
        els.set(m.uid, el);
        layer.appendChild(el);
      }
      const html = `<span class="amk-ic">${animalIcon(m.category, m.kind)}</span>${m.count > 1 ? `<b>${m.count}</b>` : ''}${k.cluster ? `<i>+${k.cluster}</i>` : ''}${isFresh(m.id) ? '<em>新</em>' : ''}`;
      if (el.dataset.html !== html) {
        el.innerHTML = html;
        el.dataset.html = html;
        el.setAttribute('aria-label', `跟拍${m.name}`);
      }
      el.style.transform = `translate(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px)`;
      el.style.opacity = k.alpha.toFixed(2);
      el.style.pointerEvents = k.alpha > 0.35 ? 'auto' : 'none';
    }
    for (const [uid, el] of els) {
      if (!live.has(uid)) {
        el.remove();
        els.delete(uid);
      }
    }
    shown = kept.map((k) => ({ uid: k.m.uid, id: k.m.id, x: k.m.x, y: k.m.y, alpha: k.alpha, cluster: k.cluster }));
  }

  function updateToast(time: number): void {
    const fresh = scene.takeArrivals();
    if (fresh.length) {
      if (!pending.length) pendingSince = time;
      pending.push(...fresh);
    }
    // Merge arrivals that come within ~1.2 s of each other into one toast.
    if (pending.length && time - pendingSince > 1200) {
      queue.push(pending);
      pending = [];
      // Never let the queue grow: fold older batches together.
      while (queue.length > 1) {
        const a = queue.shift()!;
        queue[0] = [...a, ...queue[0]!];
      }
    }
    if (current && time > current.until) {
      current = null;
      toastEl.classList.remove('show');
      gapUntil = time + 450;
      window.setTimeout(() => {
        if (!current) toastEl.hidden = true;
      }, 260);
    }
    if (!current && queue.length && time > gapUntil && time > nextAllowed && enabled) {
      const list = queue.shift()!;
      const live = scene.crewList();
      const still = list.filter((a) => live.some((c) => c.uid === a.uid));
      if (!still.length) return;
      current = { list: still, until: time + 4200 };
      // At most one arrival toast every ~8 s; whatever arrives meanwhile is merged into the next one.
      nextAllowed = time + 8000;
      const a = still[0]!;
      const isNew = still.some((x) => isFresh(x.id));
      toastEl.dataset.cat = a.category;
      toastEl.innerHTML = `<span class="at-ic">${animalIcon(a.category, a.id === 'firefly' ? 'firefly' : (live.find((c) => c.uid === a.uid)?.kind ?? 'bird'))}</span>
        <span class="at-text">${isNew ? '<em>新</em>' : ''}${esc(arrivalText(still))}</span><small>撳一下跟拍</small>`;
      toastEl.hidden = false;
      requestAnimationFrame(() => toastEl.classList.add('show'));
    }
  }

  return {
    update(time: number): void {
      updateMarkers(time);
      updateToast(time);
      if (time - listT > 800) {
        listT = time;
        renderList();
      }
    },
    debug() {
      return {
        markers: shown,
        toast: current ? toastEl.querySelector('.at-text')?.textContent ?? '' : null,
        toastUids: current ? current.list.map((a) => a.uid) : [],
        listOpen: !panel.hidden,
        list: [...panel.querySelectorAll('[data-uid]')].map((b) => b.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
      };
    },
    refresh(): void {
      listT = 0;
      renderList();
      // Drop the 新 tag from a toast that is still showing.
      if (current && !current.list.some((x) => isFresh(x.id))) toastEl.querySelector('.at-text em')?.remove();
    },
    setEnabled(on: boolean): void {
      enabled = on;
      layer.hidden = !on;
      listBtn.hidden = !on;
      if (!on) closeList();
    },
  };
}
