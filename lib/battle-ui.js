/* 전투 화면 조각 — battle.html 과 run.html 이 같이 쓴다.
   규칙은 여기 없다. 엔진(lib/battle.js)의 can() · reserve() · step() 을 부르고 보여 줄 뿐이다 */
import { h } from 'https://esm.sh/preact@10.24.3';
import htm from 'https://esm.sh/htm@3.1.1';
const html = htm.bind(h);
const W = (...a) => window.W(...a);
const B = () => window.AtelierBattle;

/* 그림. 도감에 등록된 것(data/img.json)만 그린다 — setImages 로 넘겨 받는다.
   폼 초상은 그 폼 그림, 열려 있으면 그 폼의 개방 그림 → 없으면 공통 개방 그림 → 없으면 폼 그림.
   없는 카드는 자리만 둔다 (그림이 없다고 판이 안 서면 안 된다) */
let IMGS = {};
export function setImages(map) { IMGS = map || {}; }
export function picOf(name, form, open) {
  const IMG = window.AtelierImg, entry = IMGS[name];
  if (!IMG || !entry) return null;
  const bs = IMG.styleMap(entry), want = open ? [form + '_overdrive', 'overdrive', form] : [form];
  for (const k of Object.keys(bs)) for (const f of want) {
    const one = IMG.formOf(bs[k], f);
    if (one && one.f) return IMG.thumbURL(one.f);
  }
  return null;
}

function Gauge({ kind, value, max }) {
  const w = max ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  return html`<div class=${'bt-gauge ' + kind}><span>${kind.toUpperCase()}</span><u><i style=${'width:' + w + '%'} /></u><span>${Math.round(value)}</span></div>`;
}
function Actor({ a }) {
  const cls = 'bt-actor' + (!a.alive ? ' down' : a.forced ? ' forced' : a.open ? ' open' : '');
  const tag = !a.alive ? W('battle.down') : a.forced ? W('battle.forced') : a.open ? W('battle.open') : '';
  const pic = picOf(a.name, a.form, a.open);
  return html`<div class=${cls} data-name=${a.name} data-form=${a.form} data-open=${a.open ? '1' : ''}>
    ${pic ? html`<img class="bt-pic" src=${pic} alt="" />` : html`<span class="bt-pic none">${W('form.' + a.form)}</span>`}
    <div class="bt-body">
      <div class="bt-name"><span>${a.name}</span><i class=${a.forced ? 'forced' : a.open ? 'open' : ''}>${W('form.' + a.form)}${tag ? ' · ' + tag : ''}</i></div>
      <${Gauge} kind="hp" value=${a.hp} max=${a.hpMax} />
      <${Gauge} kind="heat" value=${a.heat} max=${B().TUNING.maxHeat} />
      <${Gauge} kind="drive" value=${a.drive} max=${B().TUNING.maxDrive} />
    </div>
  </div>`;
}

/* 사건 한 줄. switch 의 to 는 폼이고 hit 의 to 는 이름이다 — 섞이지 않게 여기서 가른다 */
function line(e) {
  const v = Object.assign({}, e);
  if (e.kind === 'switch') v.form = W('form.' + e.to);
  v.guard = e.guard ? W('battle.ev.guard') : '';
  v.untargeted = e.untargeted ? W('battle.ev.untargeted') : '';
  const key = 'battle.ev.' + e.kind;
  const s = W(key, v);
  return s === key ? e.kind + ' ' + (e.who || '') : s;
}

/* 살아 있는 배우를 자리 꼴로 — Actor 는 스냅샷 꼴만 읽는다 */
function view(a) {
  return { name: a.name, side: a.side, form: a.form, hp: a.hp, hpMax: a.hpMax, heat: a.heat, drive: a.drive,
           alive: a.alive, open: !!a.open, forced: !!(a.open && a.open.forced) };
}
const FORMS = ['light', 'heavy', 'mobility'];

/* 아군 하나의 조종 단추. 엔진의 can() 이 켜고 끈다 — 규칙은 화면에 없다 */
function Cmd({ a, can, cmd, onChange }) {
  const kind = cmd.kind || 'auto';
  const set = patch => onChange(Object.assign({}, cmd, patch));
  const btn = (k, label, ok) => html`<button type="button" class=${kind === k ? 'on' : ''} disabled=${ok === false}
    data-cmd=${k} onClick=${() => set({ kind: k })}>${label}</button>`;
  return html`<div class="bt-cmd" data-name=${a.name}>
    ${btn('auto', W('battle.cmd.auto'))}
    ${btn('attack', W('battle.cmd.attack'))}
    ${btn('open', W('battle.cmd.open'), can.open)}
    ${FORMS.map(f => btn(f, W('form.' + f), can.forms.includes(f)))}
    ${(kind === 'attack' || kind === 'open') && html`<select aria-label=${W('battle.cmd.target')} value=${cmd.target || ''}
        onChange=${e => set({ target: e.currentTarget.value })}>
      <option value="">${W('battle.cmd.any')}</option>
      ${can.targets.map(t => html`<option key=${t} value=${t}>${t}</option>`)}
    </select>`}
    ${kind === 'attack' && can.extra && html`<label><input type="checkbox" checked=${!!cmd.extra}
        onChange=${e => set({ extra: e.currentTarget.checked })} />${W('battle.cmd.extra')}</label>`}
  </div>`;
}

/* 조종 — 박자 사이에 멈춘 자리. 아군마다 고르고 굴리면 한 박자가 간다 */
function Play({ g, cmds, setCmds, onStep, tickCount }) {
  const beat = g.beat();
  const actors = g.actors.map(view);
  const evs = g.log.filter(e => e.beat === beat);
  const sideOf = s => g.actors.filter(a => a.side === s);
  return html`<div class="bt-beat">
      <b data-beat=${beat}>${W('battle.beat', { n: beat, total: '…' })}</b>
      <button type="button" class="bt-step" onClick=${onStep}>${W('battle.step')}</button>
    </div>
    <p class="bt-plan">${W('battle.plan')}</p>
    <div class="bt-field">
      <div class="bt-team" data-side="a">${sideOf('a').map(a => html`<div key=${a.name}>
        <${Actor} a=${view(a)} />
        ${a.alive && html`<${Cmd} a=${a} can=${g.can(a)} cmd=${cmds[a.name] || {}}
          onChange=${c => setCmds(v => Object.assign({}, v, { [a.name]: c }))} />`}
      </div>`)}</div>
      <div class="bt-team" data-side="b">${sideOf('b').map(a => html`<${Actor} key=${a.name} a=${view(a)} />`)}</div>
    </div>
    ${beat > 0 && html`<div class="sec">${W('battle.events')}</div>
    <ul class="bt-log">${evs.map((e, k) => html`<li key=${k} class=${e.side || ''}>${line(e)}</li>`)}</ul>`}`;
}


export { Gauge, Actor, line, view, FORMS, Cmd, Play, html };
