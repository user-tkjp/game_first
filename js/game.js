'use strict';
// ============================================================
//  池袋ローグ ～単位を集めて卒業せよ～
//  ターン制ローグライク / 依存ライブラリなし / 静的ホスティングで動作
// ============================================================

const T = 16, VW = 20, VH = 13, MW = 48, MH = 30;
const WALL = 0, FLOOR = 1, STAIRS = 2;
const GRAD_CREDITS = 124;
const SUB_NAMES = ['前期', '後期', '期末試験'];
const SAVE_KEY = 'ikerogue_save_v1';
const BEST_KEY = 'ikerogue_best_v1';
const SOUND_KEY = 'ikerogue_sound';

// ---------------- 乱数 ----------------
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  chance: p => Math.random() < p,
  weighted(obj) {
    const entries = Object.entries(obj);
    let sum = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * sum;
    for (const [k, w] of entries) { if ((r -= w) < 0) return k; }
    return entries[entries.length - 1][0];
  },
};

// ---------------- データ ----------------
const YEARS = [
  {
    label: '1年', area: '池袋駅 地下迷宮', theme: 'station',
    enemies: { pigeon: 4, quiz: 3, oversleep: 2, catch: 2 }, boss: 'boss1',
    intro: '迷宮のような池袋駅。まずは無事に授業へたどり着け！',
  },
  {
    label: '2年', area: 'サンシャイン60通り', theme: 'street',
    enemies: { crow: 3, drunk: 3, report: 3, catch2: 2 }, boss: 'boss2',
    intro: 'サークルにバイトに浮かれる2年生。誘惑だらけの通りを抜けろ。',
  },
  {
    label: '3年', area: '西口 夜の繁華街', theme: 'night',
    enemies: { lasttrain: 3, midterm: 3, drunk2: 2, intern: 3 }, boss: 'boss3',
    intro: '就活の足音が聞こえてきた。終電を逃すな！',
  },
  {
    label: '4年', area: 'キャンパス 研究室棟', theme: 'campus',
    enemies: { deadline: 3, allnighter: 2, interviewer: 3, redpen: 3 }, boss: 'boss4',
    intro: '最後の関門。卒業論文が待ち受けている…',
  },
];

const ENEMIES = {
  pigeon: { name: '鳩', sprite: 'pigeon', hp: 6, atk: 3, def: 0, xp: 2, erratic: 0.5, money: [0, 20] },
  quiz: { name: '小テスト', sprite: 'paper', hp: 9, atk: 3, def: 1, xp: 3, credits: 1 },
  oversleep: { name: '寝坊の悪魔', sprite: 'ghost', hp: 10, atk: 2, def: 0, xp: 4, sleep: 0.3, speed: 0.75 },
  catch: { name: 'キャッチ', sprite: 'suit', hp: 12, atk: 2, def: 1, xp: 4, thief: true, money: [30, 120] },

  crow: { name: 'カラス', sprite: 'crow', hp: 12, atk: 5, def: 1, xp: 5, erratic: 0.35, speed: 1.5, money: [0, 30] },
  drunk: { name: '酔っ払い', sprite: 'drunk', hp: 20, atk: 6, def: 1, xp: 7, erratic: 0.4, money: [50, 200] },
  report: { name: 'レポート課題', sprite: 'report', hp: 16, atk: 5, def: 2, xp: 6, credits: 2 },
  catch2: { name: 'しつこいキャッチ', sprite: 'suit', hp: 18, atk: 4, def: 2, xp: 6, thief: true, money: [80, 250] },

  lasttrain: { name: '終電', sprite: 'lasttrain', hp: 18, atk: 6, def: 2, xp: 9, speed: 2 },
  midterm: { name: '中間試験', sprite: 'midterm', hp: 26, atk: 8, def: 3, xp: 10, credits: 2 },
  drunk2: { name: '泥酔サラリーマン', sprite: 'drunk2', hp: 34, atk: 10, def: 2, xp: 11, erratic: 0.4, money: [100, 400] },
  intern: { name: 'インターン選考', sprite: 'intern', hp: 28, atk: 9, def: 4, xp: 11, credits: 2 },

  deadline: { name: '締切', sprite: 'clock', hp: 24, atk: 9, def: 3, xp: 13, speed: 2 },
  allnighter: { name: '徹夜の悪魔', sprite: 'ghost2', hp: 32, atk: 8, def: 3, xp: 13, sleep: 0.25 },
  interviewer: { name: '圧迫面接官', sprite: 'interviewer', hp: 40, atk: 11, def: 5, xp: 16, money: [100, 300] },
  redpen: { name: '赤ペン教授', sprite: 'redpen', hp: 36, atk: 10, def: 4, xp: 15, credits: 3 },

  boss1: { name: '必修英語の期末試験', sprite: 'goldPaper', hp: 55, atk: 5, def: 2, xp: 40, credits: 12, boss: true, summon: 'quiz', summonEvery: 9 },
  boss2: { name: '統計学の鬼教授', sprite: 'boss2', hp: 75, atk: 7, def: 4, xp: 80, credits: 12, boss: true, summon: 'report', summonEvery: 10 },
  boss3: { name: '集団面接官', sprite: 'boss3', hp: 105, atk: 9, def: 6, xp: 120, credits: 12, boss: true, summon: 'intern', summonEvery: 10 },
  boss4: { name: '卒業論文', sprite: 'thesis', hp: 140, atk: 11, def: 7, xp: 0, credits: 14, boss: true, summon: 'deadline', summonEvery: 8 },
};
// 学業系（過去問が効く）
const ACADEMIC = new Set(['quiz', 'report', 'midterm', 'intern', 'redpen', 'boss1', 'boss2', 'boss3', 'boss4']);

const ITEMS = {
  onigiri: { name: 'おにぎり', sprite: 'onigiri', kind: 'food', price: 150, desc: '満腹度+35', use: g => feed(35) },
  bread: { name: 'メロンパン', sprite: 'bread', kind: 'food', price: 180, desc: '満腹度+25 体力+5', use: g => { feed(25); heal(5); } },
  ramen: { name: '池袋ラーメン', sprite: 'ramen', kind: 'food', price: 900, desc: '満腹度+100 体力+20', use: g => { feed(100); heal(20); } },
  coffee: { name: 'カフェラテ', sprite: 'coffee', kind: 'food', price: 350, desc: '満腹+10 体力+12 しばらく眠らない', use: g => { feed(10); heal(12); G.player.sleep = 0; G.player.awakeT = 60; log('目がシャキッとした！', 'good'); } },
  tea: { name: 'お茶', sprite: 'greenTea', kind: 'heal', price: 130, desc: '体力+12 満腹+5', use: g => { heal(12); feed(5); } },
  energy: { name: 'エナジードリンク', sprite: 'can', kind: 'heal', price: 250, desc: '体力+30', use: g => heal(30) },
  tonic: { name: '栄養ドリンク', sprite: 'bottle', kind: 'heal', price: 600, desc: '最大体力+5 体力+15', use: g => { G.player.maxHp += 5; heal(15); log('最大体力が5上がった！', 'good'); } },
  textbook: { name: '参考書', sprite: 'book', kind: 'misc', price: 1500, desc: '学力(攻撃)が永続的に+1', use: g => { G.player.atk += 1; log('学力が1上がった！', 'good'); } },
  pastexam: { name: '過去問', sprite: 'exam', kind: 'misc', price: 800, desc: '見えている試験系の敵を一掃', use: usePastExam },
  mapapp: { name: '地図アプリ', sprite: 'phone', kind: 'misc', price: 400, desc: 'フロア全体の地図がわかる', use: useMapApp },
  daihen: { name: '代返', sprite: 'ticket', kind: 'misc', price: 1200, desc: '出口の近くへワープ', use: useDaihen },

  pencil: { name: '鉛筆', sprite: 'pencil', kind: 'weapon', power: 1, price: 100, desc: '学力+1' },
  sharp: { name: 'シャーペン', sprite: 'pen2', kind: 'weapon', power: 2, price: 400, desc: '学力+2' },
  marker: { name: '蛍光ペン', sprite: 'pen3', kind: 'weapon', power: 3, price: 900, desc: '学力+3' },
  fountain: { name: '万年筆', sprite: 'pen4', kind: 'weapon', power: 5, price: 2500, desc: '学力+5' },
  laptop: { name: 'ノートPC', sprite: 'laptop', kind: 'weapon', power: 7, price: 5000, desc: '学力+7' },

  tshirt: { name: 'Tシャツ', sprite: 'tshirt', kind: 'armor', power: 1, price: 100, desc: '防御+1' },
  parka: { name: 'パーカー', sprite: 'parka', kind: 'armor', power: 2, price: 500, desc: '防御+2' },
  denim: { name: 'デニムジャケット', sprite: 'denim', kind: 'armor', power: 3, price: 1000, desc: '防御+3' },
  down: { name: 'ダウンジャケット', sprite: 'down', kind: 'armor', power: 4, price: 2200, desc: '防御+4' },
  recruit: { name: 'リクルートスーツ', sprite: 'recruit', kind: 'armor', power: 6, price: 4500, desc: '防御+6' },
};

// [id, 重み, 出現開始学年, 出現終了学年]
const DROP_TABLE = [
  ['onigiri', 12, 0, 3], ['bread', 6, 0, 3], ['coffee', 4, 0, 3], ['ramen', 3, 1, 3],
  ['tea', 6, 0, 3], ['energy', 8, 0, 3], ['tonic', 3, 0, 3], ['textbook', 2, 0, 3],
  ['pastexam', 3, 0, 3], ['mapapp', 3, 0, 3], ['daihen', 1, 0, 3],
  ['pencil', 3, 0, 0], ['sharp', 3, 0, 1], ['marker', 3, 1, 2], ['fountain', 2, 2, 3], ['laptop', 1, 3, 3],
  ['tshirt', 3, 0, 0], ['parka', 3, 0, 1], ['denim', 3, 1, 2], ['down', 2, 2, 3], ['recruit', 1, 3, 3],
];

const OWL_TIPS = [
  '「過去問」は見えている試験系の敵をまとめて片づけられるホー。',
  '満腹度が0になると体力が減っていくホー。食べ物は大事だホー。',
  'キャッチにお金を取られたら、逃げられる前に倒して取り返すホー。',
  '卒業には124単位が必要だホー。出席票も忘れずに拾うホー。',
  'コンビニでは要らない物を売ることもできるホー。',
  '通路は見通しが悪いホー。部屋の入口で敵を迎え撃つのも手だホー。',
  '眠らされたらカフェラテで目を覚ますホー。',
  'ボスは仲間を呼ぶホー。長期戦は不利だホー。',
];

// ---------------- 状態 ----------------
const G = {
  mode: 'title', // title | play | menu | over
  floor: 0, map: null, roomId: null, rooms: [], explored: null, visible: null, dist: null,
  player: null, enemies: [], items: [], npcs: [], effects: [], turn: 0,
  stats: { kills: 0 }, yearStartCredits: 0, isBossFloor: false, respawnT: 0, frame: 0, sound: true,
};
let uidCounter = 1;
const makeItem = id => ({ id, uid: uidCounter++ });
const idx = (x, y) => y * MW + x;
const inBounds = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
const tileAt = (x, y) => inBounds(x, y) ? G.map[idx(x, y)] : WALL;
const walkable = (x, y) => tileAt(x, y) !== WALL;
const yearOf = f => Math.floor(f / 3);
const subOf = f => f % 3;

function newPlayer() {
  return {
    x: 0, y: 0, face: 1, hp: 30, maxHp: 30, atk: 4, def: 1, lvl: 1, xp: 0,
    hunger: 100, hungerAcc: 0, regenAcc: 0, money: 3000, credits: 0,
    inv: [makeItem('onigiri'), makeItem('onigiri'), makeItem('energy'), Object.assign(makeItem('pencil'), { eq: true })],
    sleep: 0, awakeT: 0, flash: 0,
  };
}
const equipped = kind => G.player.inv.find(i => i.eq && ITEMS[i.id].kind === kind);
const playerAtk = () => G.player.atk + (equipped('weapon') ? ITEMS[equipped('weapon').id].power : 0);
const playerDef = () => G.player.def + (equipped('armor') ? ITEMS[equipped('armor').id].power : 0);
const xpNeed = l => 3 * l * l + 7;
const INV_MAX = 12;

// ---------------- マップ生成 ----------------
function generateFloor() {
  const year = yearOf(G.floor);
  G.map = new Uint8Array(MW * MH);
  G.roomId = new Int8Array(MW * MH).fill(-1);
  G.explored = new Uint8Array(MW * MH);
  G.visible = new Uint8Array(MW * MH);
  G.rooms = []; G.enemies = []; G.items = []; G.npcs = []; G.effects = [];
  G.isBossFloor = subOf(G.floor) === 2;
  G.respawnT = 0;

  if (G.isBossFloor) { generateBossFloor(year); return; }

  const GX = 3, GY = 3, cw = 16, ch = 10;
  const cells = [];
  let realCount = 0;
  for (let gy = 0; gy < GY; gy++) {
    for (let gx = 0; gx < GX; gx++) {
      const isPoint = R.chance(0.18) && realCount + (GX * GY - (gy * GX + gx)) > 5;
      let r;
      if (isPoint) {
        r = { x: gx * cw + R.int(3, cw - 4), y: gy * ch + R.int(2, ch - 3), w: 1, h: 1, point: true };
      } else {
        const w = R.int(4, cw - 5), h = R.int(3, ch - 4);
        r = { x: gx * cw + R.int(1, cw - w - 2), y: gy * ch + R.int(1, ch - h - 2), w, h, point: false };
        realCount++;
      }
      r.gx = gx; r.gy = gy;
      cells.push(r);
    }
  }
  // 部屋を掘る
  for (const r of cells) {
    let id = -1;
    if (!r.point) { id = G.rooms.length; G.rooms.push(r); }
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
      G.map[idx(x, y)] = FLOOR; G.roomId[idx(x, y)] = id;
    }
  }
  // 全域木 + 追加の通路
  const cell = (gx, gy) => cells[gy * GX + gx];
  const visited = new Set([0]);
  const stack = [0];
  const edges = [];
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const cx = cur % GX, cy = Math.floor(cur / GX);
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => [cx + dx, cy + dy])
      .filter(([x, y]) => x >= 0 && y >= 0 && x < GX && y < GY && !visited.has(y * GX + x));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny] = R.pick(nb);
    const ni = ny * GX + nx;
    visited.add(ni); stack.push(ni);
    edges.push([cur, ni]);
  }
  for (let i = 0; i < 3; i++) {
    const a = R.int(0, GX * GY - 1);
    const ax = a % GX, ay = Math.floor(a / GX);
    const [dx, dy] = R.pick([[1, 0], [0, 1]]);
    if (ax + dx < GX && ay + dy < GY) edges.push([a, (ay + dy) * GX + ax + dx]);
  }
  for (const [ai, bi] of edges) {
    let a = cells[ai], b = cells[bi];
    if (a.gx > b.gx || a.gy > b.gy) [a, b] = [b, a];
    if (a.gy === b.gy) { // 横
      const ya = R.int(a.y, a.y + a.h - 1), yb = R.int(b.y, b.y + b.h - 1);
      const mx = R.int(a.x + a.w, b.x - 1);
      carveH(a.x + a.w, mx, ya); carveV(ya, yb, mx); carveH(mx, b.x - 1, yb);
    } else { // 縦
      const xa = R.int(a.x, a.x + a.w - 1), xb = R.int(b.x, b.x + b.w - 1);
      const my = R.int(a.y + a.h, b.y - 1);
      carveV(a.y + a.h, my, xa); carveH(xa, xb, my); carveV(my, b.y - 1, xb);
    }
  }
  void cell;

  // 配置
  const pr = R.int(0, G.rooms.length - 1);
  const ps = freeSpotInRoom(pr);
  G.player.x = ps.x; G.player.y = ps.y;
  let sr = pr;
  if (G.rooms.length > 1) while (sr === pr) sr = R.int(0, G.rooms.length - 1);
  const ss = freeSpotInRoom(sr);
  G.map[idx(ss.x, ss.y)] = STAIRS;

  const nEnemies = 6 + year + subOf(G.floor);
  for (let i = 0; i < nEnemies; i++) spawnEnemy(R.weighted(YEARS[year].enemies), true);
  const nItems = 5 + R.int(0, 2);
  for (let i = 0; i < nItems; i++) { const s = randomFreeSpot(); if (s) G.items.push({ x: s.x, y: s.y, kind: 'item', item: makeItem(randomItemId(year)) }); }
  for (let i = 0; i < 3; i++) { const s = randomFreeSpot(); if (s) G.items.push({ x: s.x, y: s.y, kind: 'money', amount: R.int(1, 5) * 100 * (year + 1) }); }
  for (let i = 0; i < 2; i++) { const s = randomFreeSpot(); if (s) G.items.push({ x: s.x, y: s.y, kind: 'card', amount: 2 }); }

  if (R.chance(0.6)) { const s = npcSpot(); if (s) G.npcs.push({ x: s.x, y: s.y, kind: 'shop', sprite: 'shop', stock: makeStock(year) }); }
  if (R.chance(year === 0 ? 0.6 : 0.25)) { const s = npcSpot(); if (s) G.npcs.push({ x: s.x, y: s.y, kind: 'owl', sprite: 'owlStatue', used: false }); }
}

function carveH(x1, x2, y) { for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) if (G.map[idx(x, y)] === WALL) G.map[idx(x, y)] = FLOOR; }
function carveV(y1, y2, x) { for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) if (G.map[idx(x, y)] === WALL) G.map[idx(x, y)] = FLOOR; }

function generateBossFloor(year) {
  const r = { x: 11, y: 8, w: 26, h: 14 };
  G.rooms.push(r);
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { G.map[idx(x, y)] = FLOOR; G.roomId[idx(x, y)] = 0; }
  // 柱
  for (const [x, y] of [[17, 11], [17, 18], [30, 11], [30, 18]]) G.map[idx(x, y)] = WALL;
  G.player.x = r.x + 2; G.player.y = r.y + Math.floor(r.h / 2);
  const bossId = YEARS[year].boss;
  const boss = makeEnemy(bossId, r.x + r.w - 4, r.y + Math.floor(r.h / 2));
  boss.awake = true;
  G.enemies.push(boss);
  for (let i = 0; i < 2; i++) { const s = randomFreeSpot(); if (s) G.items.push({ x: s.x, y: s.y, kind: 'item', item: makeItem(R.pick(['energy', 'tea', 'onigiri'])) }); }
}

function makeStock(year) {
  const stock = [];
  for (let i = 0; i < 5; i++) stock.push(makeItem(randomItemId(year)));
  if (!stock.some(it => ITEMS[it.id].kind === 'food')) stock[0] = makeItem('onigiri');
  return stock;
}

function randomItemId(year) {
  const table = {};
  for (const [id, w, a, b] of DROP_TABLE) if (year >= a && year <= b) table[id] = w;
  return R.weighted(table);
}

function occupied(x, y) {
  if (G.player && G.player.x === x && G.player.y === y) return true;
  return G.enemies.some(e => e.x === x && e.y === y) || G.npcs.some(n => n.x === x && n.y === y);
}
const itemAt = (x, y) => G.items.find(i => i.x === x && i.y === y);
const enemyAt = (x, y) => G.enemies.find(e => e.x === x && e.y === y && e.hp > 0);
const npcAt = (x, y) => G.npcs.find(n => n.x === x && n.y === y);

function freeSpotInRoom(ri) {
  const r = G.rooms[ri];
  for (let t = 0; t < 100; t++) {
    const x = R.int(r.x, r.x + r.w - 1), y = R.int(r.y, r.y + r.h - 1);
    if (G.map[idx(x, y)] === FLOOR && !occupied(x, y) && !itemAt(x, y)) return { x, y };
  }
  return { x: r.x, y: r.y };
}
function randomFreeSpot(avoidVisible = false) {
  for (let t = 0; t < 200; t++) {
    const ri = R.int(0, G.rooms.length - 1);
    const r = G.rooms[ri];
    const x = R.int(r.x, r.x + r.w - 1), y = R.int(r.y, r.y + r.h - 1);
    if (G.map[idx(x, y)] !== FLOOR || occupied(x, y) || itemAt(x, y)) continue;
    if (avoidVisible && (G.visible[idx(x, y)] || Math.max(Math.abs(x - G.player.x), Math.abs(y - G.player.y)) < 6)) continue;
    return { x, y };
  }
  return null;
}

// 通路の出入口をふさがない場所（周囲8マスに通路が無い）
function npcSpot() {
  for (let t = 0; t < 50; t++) {
    const s = randomFreeSpot();
    if (!s) return null;
    let ok = true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = s.x + dx, y = s.y + dy;
      if (walkable(x, y) && G.roomId[idx(x, y)] < 0) ok = false;
    }
    if (ok) return s;
  }
  return null;
}

function makeEnemy(type, x, y) {
  const d = ENEMIES[type];
  const scale = d.boss ? 1 : 1 + 0.1 * subOf(G.floor);
  const hp = Math.round(d.hp * scale);
  return {
    type, d, x, y, hp, maxHp: hp, atk: d.atk, def: d.def, energy: 0, speed: d.speed || 1,
    awake: d.boss || R.chance(0.35), fleeing: false, stolen: 0, fleeT: 0, timer: 0, flash: 0, face: -1,
  };
}

function spawnEnemy(type, initial) {
  const s = randomFreeSpot(true);
  if (!s) return;
  if (initial && G.rooms.length > 1) {
    const pr = G.roomId[idx(G.player.x, G.player.y)];
    if (pr >= 0 && G.roomId[idx(s.x, s.y)] === pr) return;
  }
  G.enemies.push(makeEnemy(type, s.x, s.y));
}

// ---------------- 視界 ----------------
function los(x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, x = x0, y = y0;
  while (true) {
    if (x === x1 && y === y1) return true;
    if (!(x === x0 && y === y0) && G.map[idx(x, y)] === WALL) return false;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

function computeFOV() {
  const p = G.player;
  G.visible.fill(0);
  const rid = G.roomId[idx(p.x, p.y)];
  if (rid >= 0) {
    const r = G.rooms[rid];
    for (let y = r.y - 1; y <= r.y + r.h; y++) for (let x = r.x - 1; x <= r.x + r.w; x++) if (inBounds(x, y)) G.visible[idx(x, y)] = 1;
  }
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const x = p.x + dx, y = p.y + dy;
    if (inBounds(x, y) && los(p.x, p.y, x, y)) G.visible[idx(x, y)] = 1;
  }
  for (let i = 0; i < G.visible.length; i++) if (G.visible[i]) G.explored[i] = 1;
}

function diagOK(x, y, dx, dy) {
  if (dx && dy) return walkable(x + dx, y) && walkable(x, y + dy);
  return true;
}

function buildDistMap() {
  const dist = new Int16Array(MW * MH).fill(9999);
  const q = [idx(G.player.x, G.player.y)];
  dist[q[0]] = 0;
  for (let h = 0; h < q.length; h++) {
    const c = q[h], cx = c % MW, cy = Math.floor(c / MW);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (!walkable(nx, ny) || !diagOK(cx, cy, dx, dy)) continue;
      const ni = idx(nx, ny);
      if (dist[ni] > dist[c] + 1) { dist[ni] = dist[c] + 1; q.push(ni); }
    }
  }
  G.dist = dist;
}

// ---------------- メッセージ ----------------
const logLines = [];
function log(text, cls = '') {
  logLines.push({ text, cls });
  while (logLines.length > 5) logLines.shift();
  const el = document.getElementById('log');
  el.innerHTML = logLines.map(l => `<div class="${l.cls}">${l.text}</div>`).join('');
}
function popup(x, y, text, color) { G.effects.push({ x, y, text: String(text), color, t: 0 }); }

// ---------------- 効果音（WebAudio・外部ファイルなし） ----------------
let audioCtx = null;
function sfx(type) {
  if (!G.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = {
      hit: [[330, 0.05, 'square'], [220, 0.05, 'square']],
      hurt: [[160, 0.08, 'sawtooth'], [110, 0.08, 'sawtooth']],
      pick: [[880, 0.05, 'square'], [1320, 0.07, 'square']],
      level: [[523, 0.08, 'square'], [659, 0.08, 'square'], [784, 0.08, 'square'], [1046, 0.15, 'square']],
      stairs: [[392, 0.07, 'triangle'], [523, 0.07, 'triangle'], [659, 0.12, 'triangle']],
      kill: [[600, 0.04, 'square'], [300, 0.06, 'square']],
      boss: [[196, 0.15, 'sawtooth'], [185, 0.15, 'sawtooth'], [175, 0.3, 'sawtooth']],
      fanfare: [[523, 0.12, 'square'], [523, 0.12, 'square'], [523, 0.12, 'square'], [659, 0.3, 'square'], [587, 0.15, 'square'], [659, 0.15, 'square'], [784, 0.4, 'square']],
      miss: [[200, 0.04, 'triangle']],
    }[type];
    if (!seq) return;
    let t = audioCtx.currentTime;
    for (const [f, d, w] of seq) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = w; o.frequency.value = f;
      g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(audioCtx.destination);
      o.start(t); o.stop(t + d);
      t += d;
    }
  } catch (e) { /* 音が出なくても続行 */ }
}

// ---------------- 戦闘 ----------------
function calcDamage(atk, def) {
  return Math.max(1, Math.round(atk * (0.85 + Math.random() * 0.3) * 20 / (20 + def)));
}

function playerAttack(e) {
  const p = G.player;
  p.face = e.x < p.x ? -1 : e.x > p.x ? 1 : p.face;
  e.awake = true;
  if (R.chance(1 / 16)) { log(`${e.d.name}に攻撃をかわされた`); popup(e.x, e.y, '-', '#94b0c2'); sfx('miss'); return; }
  let dmg = calcDamage(playerAtk(), e.def);
  const crit = R.chance(1 / 14);
  if (crit) dmg = Math.round(dmg * 1.6);
  e.hp -= dmg; e.flash = 10;
  popup(e.x, e.y, dmg, crit ? '#ffcd75' : '#f4f4f4');
  log(`${crit ? '会心の一撃！ ' : ''}${e.d.name}に${dmg}のダメージ`);
  sfx('hit');
  if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e, viaExam = false) {
  const p = G.player;
  e.hp = 0;
  G.enemies = G.enemies.filter(x => x !== e);
  G.stats.kills++;
  log(`${e.d.name}${viaExam ? 'を過去問で攻略した！' : 'をやっつけた！'}`, 'good');
  sfx('kill');
  if (e.d.credits && !e.summoned) {
    p.credits += e.d.credits;
    popup(e.x, e.y, '+' + e.d.credits, '#a7f070');
    log(`単位を${e.d.credits}つ取得！（${p.credits}/${GRAD_CREDITS}）`, 'credit');
  }
  gainXp(e.summoned ? Math.floor(e.d.xp / 2) : e.d.xp);
  let money = e.stolen;
  if (e.d.money && !e.summoned) money += R.int(e.d.money[0], e.d.money[1]) * (yearOf(G.floor) + 1);
  if (money > 0) {
    if (!itemAt(e.x, e.y) && G.map[idx(e.x, e.y)] === FLOOR) G.items.push({ x: e.x, y: e.y, kind: 'money', amount: money });
    else { p.money += money; log(`${money}円を手に入れた`); }
  } else if (!e.d.boss && R.chance(0.1) && !itemAt(e.x, e.y) && G.map[idx(e.x, e.y)] === FLOOR) {
    G.items.push({ x: e.x, y: e.y, kind: 'item', item: makeItem(randomItemId(yearOf(G.floor))) });
  }
  if (e.d.boss) {
    sfx('fanfare');
    if (G.enemies.length) log('試験終了！ 残りの敵は去っていった', 'hint');
    G.enemies = [];
    let sx = e.x, sy = e.y;
    G.items = G.items.filter(it => !(it.x === sx && it.y === sy));
    G.map[idx(sx, sy)] = STAIRS;
    const last = G.floor === 11;
    log(last ? '卒業論文を書き上げた！ 出口から卒業式へ向かおう！' : `${e.d.name}を突破した！ 出口が現れた！`, 'good');
  }
}

function gainXp(n) {
  const p = G.player;
  if (!n) return;
  p.xp += n;
  while (p.xp >= xpNeed(p.lvl)) {
    p.xp -= xpNeed(p.lvl);
    p.lvl++;
    p.maxHp += 6; p.hp = Math.min(p.maxHp, p.hp + 6); p.atk += 1;
    if (p.lvl % 2 === 0) p.def += 1;
    log(`レベル${p.lvl}に上がった！`, 'level');
    sfx('level');
  }
}

function enemyAttack(e) {
  const p = G.player;
  e.face = p.x < e.x ? -1 : 1;
  if (R.chance(1 / 12)) { log(`${e.d.name}の攻撃は外れた`); return; }
  const dmg = calcDamage(e.atk, playerDef());
  p.hp -= dmg; p.flash = 12;
  popup(p.x, p.y, dmg, '#ef7d57');
  log(`${e.d.name}から${dmg}のダメージを受けた`, 'bad');
  sfx('hurt');
  if (p.hp <= 0) { gameOver(`${e.d.name}にやられて、大学をやめることになった…`); return; }
  if (e.d.thief && p.money > 0) {
    const amount = Math.min(p.money, R.int(100, 300) * (yearOf(G.floor) + 1));
    p.money -= amount; e.stolen += amount; e.fleeing = true;
    log(`${e.d.name}に${amount}円を取られた！`, 'bad');
  }
  if (e.d.sleep && p.awakeT <= 0 && p.sleep === 0 && R.chance(e.d.sleep)) {
    p.sleep = 3;
    log('強烈な眠気に襲われた… Zzz', 'bad');
  }
}

// ---------------- 敵AI ----------------
function stepTo(e, nx, ny) {
  if (nx < e.x) e.face = -1; else if (nx > e.x) e.face = 1;
  e.x = nx; e.y = ny;
}
function canEnemyEnter(e, dx, dy) {
  const nx = e.x + dx, ny = e.y + dy;
  return walkable(nx, ny) && diagOK(e.x, e.y, dx, dy) && !occupied(nx, ny);
}
function randomStep(e) {
  const dirs = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && canEnemyEnter(e, dx, dy)) dirs.push([dx, dy]);
  if (dirs.length) { const [dx, dy] = R.pick(dirs); stepTo(e, e.x + dx, e.y + dy); }
}
function stepByDist(e, away) {
  const cur = G.dist[idx(e.x, e.y)];
  let best = null, bestV = cur;
  const opts = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!(dx || dy) || !canEnemyEnter(e, dx, dy)) continue;
    const v = G.dist[idx(e.x + dx, e.y + dy)];
    if (away ? v > bestV : v < bestV) { bestV = v; opts.length = 0; opts.push([dx, dy]); }
    else if (v === bestV && v !== cur) opts.push([dx, dy]);
  }
  if (opts.length) best = R.pick(opts);
  if (best) stepTo(e, e.x + best[0], e.y + best[1]);
  else if (!away) randomStep(e);
}

function enemyAct(e) {
  const p = G.player;
  const vis = G.visible[idx(e.x, e.y)];
  if (vis && !e.awake) e.awake = true;
  if (e.d.summon && e.awake) {
    e.timer++;
    if (e.timer % e.d.summonEvery === 0 && G.enemies.filter(x => x.summoned).length < 3) {
      for (let t = 0; t < 8; t++) {
        const dx = R.int(-1, 1), dy = R.int(-1, 1);
        if (walkable(e.x + dx, e.y + dy) && !occupied(e.x + dx, e.y + dy)) {
          const m = makeEnemy(e.d.summon, e.x + dx, e.y + dy); m.awake = true; m.summoned = true;
          G.enemies.push(m);
          log(`${e.d.name}が${m.d.name}を呼び出した！`, 'bad');
          return;
        }
      }
    }
  }
  if (e.fleeing) {
    stepByDist(e, true);
    e.fleeT++;
    if (e.fleeT > (G.visible[idx(e.x, e.y)] ? 25 : 10)) {
      G.enemies = G.enemies.filter(x => x !== e);
      if (e.stolen > 0) log(`${e.d.name}は${e.stolen}円を持って人ごみに消えた…`, 'bad');
    }
    return;
  }
  const dx = p.x - e.x, dy = p.y - e.y;
  const adjacent = Math.max(Math.abs(dx), Math.abs(dy)) === 1 && diagOK(e.x, e.y, dx, dy);
  if (!e.awake) { if (R.chance(0.4)) randomStep(e); return; }
  if (e.d.erratic && R.chance(e.d.erratic)) { randomStep(e); return; }
  if (adjacent) { enemyAttack(e); return; }
  if (G.dist[idx(e.x, e.y)] > 30) { randomStep(e); return; }
  stepByDist(e, false);
}

// ---------------- ターン進行 ----------------
function advanceWorld() {
  const p = G.player;
  G.turn++;
  // 満腹度
  p.hungerAcc++;
  if (p.hungerAcc >= 8) {
    p.hungerAcc = 0;
    if (p.hunger > 0) {
      p.hunger--;
      if (p.hunger === 20) log('お腹が空いてきた…', 'warn');
      if (p.hunger === 0) log('お腹が空いて倒れそうだ！', 'bad');
    }
  }
  if (p.hunger <= 0) {
    p.hp -= 1;
    if (p.hp <= 0) { gameOver('空腹で倒れ、実家に連れ戻された…'); return; }
  } else if (p.hp < p.maxHp) {
    p.regenAcc += p.maxHp / 100;
    while (p.regenAcc >= 1) { p.regenAcc -= 1; p.hp = Math.min(p.maxHp, p.hp + 1); }
  }
  if (p.awakeT > 0) p.awakeT--;
  // 敵の再出現
  if (!G.isBossFloor) {
    G.respawnT++;
    if (G.respawnT >= 45) { G.respawnT = 0; if (G.enemies.length < 10) spawnEnemy(R.weighted(YEARS[yearOf(G.floor)].enemies)); }
  }
  computeFOV();
  buildDistMap();
  for (const e of [...G.enemies]) {
    if (e.hp <= 0) continue;
    e.energy += e.speed;
    while (e.energy >= 1) {
      e.energy -= 1;
      enemyAct(e);
      if (G.mode === 'over') return;
    }
  }
  computeFOV();
}

function endTurn() {
  advanceWorld();
  const p = G.player;
  let guard = 0;
  while (G.mode !== 'over' && p.sleep > 0 && guard++ < 10) {
    p.sleep--;
    if (p.sleep === 0) { log('はっ！ 目が覚めた', 'warn'); p.awakeT = 6; }
    advanceWorld();
  }
  updateHUD();
}

function tryMove(dx, dy) {
  if (G.mode !== 'play') return;
  const p = G.player;
  if (dx || dy) {
    if (dx) p.face = dx;
    const nx = p.x + dx, ny = p.y + dy;
    if (!diagOK(p.x, p.y, dx, dy)) return;
    const e = enemyAt(nx, ny);
    if (e) { playerAttack(e); endTurn(); return; }
    const n = npcAt(nx, ny);
    if (n) { interactNpc(n); return; }
    if (!walkable(nx, ny)) return;
    p.x = nx; p.y = ny;
    pickup(false);
    if (G.map[idx(p.x, p.y)] === STAIRS) log('出口だ。［決定］で先へ進む', 'hint');
  }
  endTurn();
}

function pickup(manual) {
  const p = G.player;
  const it = itemAt(p.x, p.y);
  if (!it) { if (manual) log('足元には何もない'); return false; }
  if (it.kind === 'money') {
    p.money += it.amount; log(`${it.amount}円を拾った`, 'good');
  } else if (it.kind === 'card') {
    p.credits += it.amount; log(`出席票だ！ 単位を${it.amount}つ取得（${p.credits}/${GRAD_CREDITS}）`, 'credit');
    popup(p.x, p.y, '+' + it.amount, '#a7f070');
  } else {
    if (p.inv.length >= INV_MAX) { log(`持ち物がいっぱいで${ITEMS[it.item.id].name}を拾えない`, 'warn'); return false; }
    p.inv.push(it.item); log(`${ITEMS[it.item.id].name}を拾った`, 'good');
  }
  G.items = G.items.filter(x => x !== it);
  sfx('pick');
  updateHUD();
  return true;
}

function actionButton() {
  if (G.mode !== 'play') return;
  const p = G.player;
  if (G.map[idx(p.x, p.y)] === STAIRS) { confirmDescend(); return; }
  if (itemAt(p.x, p.y)) { if (pickup(true)) endTurn(); return; }
  log('（ここには何もない）');
}

// ---------------- アイテム効果 ----------------
function heal(n) {
  const p = G.player;
  const before = p.hp;
  p.hp = Math.min(p.maxHp, p.hp + n);
  if (p.hp > before) { popup(p.x, p.y, '+' + (p.hp - before), '#a7f070'); log(`体力が${p.hp - before}回復した`, 'good'); }
}
function feed(n) {
  const p = G.player;
  p.hunger = Math.min(100, p.hunger + n);
  log(`お腹がふくれた（満腹度${p.hunger}%）`, 'good');
}
function usePastExam() {
  const targets = G.enemies.filter(e => ACADEMIC.has(e.type) && G.visible[idx(e.x, e.y)]);
  if (!targets.length) { log('見える範囲に試験系の敵がいない…（使わずにしまった）', 'warn'); return false; }
  log('過去問を広げた！ 出題傾向は完全に把握済みだ！', 'good');
  for (const e of targets) {
    if (e.d.boss) {
      const dmg = Math.ceil(e.maxHp * 0.25);
      e.hp -= dmg; e.flash = 14; popup(e.x, e.y, dmg, '#ffcd75');
      log(`${e.d.name}に${dmg}のダメージ！`, 'good');
      if (e.hp <= 0) killEnemy(e);
    } else killEnemy(e, true);
  }
  return true;
}
function useMapApp() {
  for (let i = 0; i < G.map.length; i++) if (G.map[i] !== WALL) {
    G.explored[i] = 1;
    const x = i % MW, y = Math.floor(i / MW);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inBounds(x + dx, y + dy)) G.explored[idx(x + dx, y + dy)] = 1;
  }
  log('地図アプリでフロアの構造がわかった！', 'good');
  return true;
}
function useDaihen() {
  const s = G.map.indexOf(STAIRS);
  if (s < 0) { log('今は使えないようだ…（使わずにしまった）', 'warn'); return false; }
  const sx = s % MW, sy = Math.floor(s / MW);
  for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = sx + dx, y = sy + dy;
    if (walkable(x, y) && !occupied(x, y)) {
      G.player.x = x; G.player.y = y; computeFOV();
      log('友達に代返を頼んで出口の近くへ移動した！', 'good');
      return true;
    }
  }
  return false;
}

function useItem(item) {
  const def = ITEMS[item.id];
  const p = G.player;
  if (def.kind === 'weapon' || def.kind === 'armor') {
    if (item.eq) { item.eq = false; log(`${def.name}を外した`); }
    else {
      p.inv.forEach(i => { if (ITEMS[i.id].kind === def.kind) i.eq = false; });
      item.eq = true; log(`${def.name}を装備した`, 'good');
    }
    closeMenu(); endTurn(); return;
  }
  closeMenu();
  const consumed = def.use(G) !== false;
  if (consumed) {
    p.inv = p.inv.filter(i => i !== item);
    sfx('pick');
    endTurn();
  } else updateHUD();
}

function dropItem(item) {
  const p = G.player;
  if (item.eq) item.eq = false;
  p.inv = p.inv.filter(i => i !== item);
  if (!itemAt(p.x, p.y) && G.map[idx(p.x, p.y)] === FLOOR) {
    G.items.push({ x: p.x, y: p.y, kind: 'item', item });
    log(`${ITEMS[item.id].name}を足元に置いた`);
  } else log(`${ITEMS[item.id].name}を捨てた`);
  closeMenu(); endTurn();
}

// ---------------- NPC ----------------
function interactNpc(n) {
  if (n.kind === 'owl') {
    if (n.used) { log('いけふくろう像は静かに見守っている'); return; }
    n.used = true;
    G.player.hp = G.player.maxHp;
    log('いけふくろう像に触れた。体力が全回復した！', 'good');
    sfx('level');
    openMenu({
      title: 'いけふくろう像',
      body: `<p class="owl">${R.pick(OWL_TIPS)}</p>`,
      options: [{ label: 'ありがとう', action: closeMenu }],
      onCancel: closeMenu,
    });
    updateHUD();
  } else if (n.kind === 'shop') openShop(n);
}

function openShop(n) {
  const p = G.player;
  openMenu({
    title: 'コンビニ',
    body: `<p>「いらっしゃいませー」　所持金：<b>${p.money}円</b></p>`,
    options: [
      ...n.stock.map(it => {
        const d = ITEMS[it.id];
        return {
          label: `${d.name}　${d.price}円`, sub: d.desc, sprite: d.sprite,
          disabled: p.money < d.price || p.inv.length >= INV_MAX,
          action: () => {
            p.money -= d.price; p.inv.push(it); n.stock = n.stock.filter(x => x !== it);
            log(`${d.name}を買った`, 'good'); sfx('pick'); updateHUD(); openShop(n);
          },
        };
      }),
      { label: '持ち物を売る', action: () => openSell(n) },
      { label: '店を出る', action: closeMenu },
    ],
    onCancel: closeMenu,
  });
}
function openSell(n) {
  const p = G.player;
  const sellable = p.inv.filter(i => !i.eq);
  openMenu({
    title: '買い取り',
    body: `<p>「買い取りは定価の半額になりまーす」　所持金：<b>${p.money}円</b></p>`,
    options: [
      ...sellable.map(it => {
        const d = ITEMS[it.id], price = Math.floor(d.price / 2);
        return {
          label: `${d.name}　→ ${price}円`, sprite: d.sprite,
          action: () => { p.money += price; p.inv = p.inv.filter(x => x !== it); log(`${d.name}を${price}円で売った`); sfx('pick'); updateHUD(); openSell(n); },
        };
      }),
      { label: '戻る', action: () => openShop(n) },
    ],
    onCancel: () => openShop(n),
  });
}

// ---------------- 持ち物 ----------------
function openInventory() {
  if (G.mode !== 'play') return;
  const p = G.player;
  openMenu({
    title: `持ち物（${p.inv.length}/${INV_MAX}）`,
    body: p.inv.length ? '' : '<p>何も持っていない</p>',
    options: [
      ...p.inv.map(it => {
        const d = ITEMS[it.id];
        return { label: `${d.name}${it.eq ? '［装備中］' : ''}`, sub: d.desc, sprite: d.sprite, action: () => openItemMenu(it) };
      }),
      { label: '閉じる', action: closeMenu },
    ],
    onCancel: closeMenu,
  });
}
function openItemMenu(it) {
  const d = ITEMS[it.id];
  const isEquip = d.kind === 'weapon' || d.kind === 'armor';
  openMenu({
    title: d.name,
    body: `<p>${d.desc}</p>`,
    options: [
      { label: isEquip ? (it.eq ? '外す' : '装備する') : (d.kind === 'food' ? '食べる' : '使う'), action: () => useItem(it) },
      { label: '捨てる', action: () => dropItem(it) },
      { label: '戻る', action: openInventory },
    ],
    onCancel: openInventory,
  });
}

// ---------------- フロア移動 ----------------
function confirmDescend() {
  const last = G.floor === 11;
  openMenu({
    title: last ? '卒業式会場へ' : '先へ進む',
    body: `<p>${last ? '卒業式会場へ向かいますか？' : G.isBossFloor ? `${YEARS[yearOf(G.floor)].label}の課程を終えて先へ進みますか？` : '次のエリアへ進みますか？'}</p>`,
    options: [
      { label: 'はい', action: () => { closeMenu(); descend(); } },
      { label: 'いいえ', action: closeMenu },
    ],
    onCancel: closeMenu,
  });
}

function descend() {
  sfx('stairs');
  if (G.floor === 11) { graduation(); return; }
  if (G.isBossFloor) { yearEnd(); return; }
  G.floor++;
  startFloor();
}

function yearEnd() {
  const p = G.player, y = yearOf(G.floor);
  const gained = p.credits - G.yearStartCredits;
  const target = (y + 1) * 31;
  const ok = p.credits >= target;
  const restName = ['春休み', '春休み', '春休み'][y];
  const choices = [
    { label: 'バイト三昧', sub: `${2500 * (y + 1)}円を稼ぐ`, fx: () => { p.money += 2500 * (y + 1); return `バイトで${2500 * (y + 1)}円稼いだ！`; } },
    { label: 'サークル合宿', sub: '最大体力+8', fx: () => { p.maxHp += 8; return '体力がついた！ 最大体力+8'; } },
    { label: '図書館にこもる', sub: '学力(攻撃)+2', fx: () => { p.atk += 2; return '勉強の成果で学力+2！'; } },
    { label: '実家に帰省', sub: '満腹度回復＆差し入れをもらう', fx: () => { p.hunger = 100; ['ramen', 'energy', 'onigiri'].forEach(id => { if (p.inv.length < INV_MAX) p.inv.push(makeItem(id)); }); return '実家でゆっくりして差し入れをもらった！'; } },
  ];
  openMenu({
    title: `${YEARS[y].label} 成績発表`,
    body: `<div class="report">
      <div>今年取得した単位：<b>${gained}</b></div>
      <div>累計取得単位：<b>${p.credits}</b> / ${GRAD_CREDITS}</div>
      <div>進級の目安：${target}</div>
      <p class="${ok ? 'good' : 'bad'}">${ok ? '順調に単位が取れている！' : 'このままでは卒業が危ない…'}</p>
      </div><p>${restName}の過ごし方を選ぼう（体力は全回復する）</p>`,
    options: choices.map(c => ({
      label: c.label, sub: c.sub,
      action: () => {
        const msg = c.fx();
        p.hp = p.maxHp; p.sleep = 0;
        closeMenu();
        G.floor++;
        startFloor();
        log(msg, 'good');
      },
    })),
  });
}

function startFloor() {
  const y = yearOf(G.floor), s = subOf(G.floor);
  if (s === 0) G.yearStartCredits = G.player.credits;
  generateFloor();
  computeFOV();
  buildDistMap();
  G.mode = 'play';
  saveGame();
  updateHUD();
  showBanner(`${YEARS[y].label} ${SUB_NAMES[s]}`, YEARS[y].area);
  if (s === 0) log(YEARS[y].intro, 'hint');
  if (G.isBossFloor) { log(`${ENEMIES[YEARS[y].boss].name}が立ちはだかる！`, 'bad'); sfx('boss'); }
}

function showBanner(t1, t2) {
  const b = document.getElementById('banner');
  b.innerHTML = `<div class="b1">${t1}</div><div class="b2">${t2}</div>`;
  b.classList.remove('hidden');
  b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
  clearTimeout(showBanner.t);
  showBanner.t = setTimeout(() => b.classList.add('hidden'), 2200);
}

// ---------------- 終了 ----------------
function loadBest() { try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch (e) { return {}; } }
function saveBest(update) {
  const b = Object.assign({ bestFloor: 0, bestCredits: 0, graduations: 0, runs: 0 }, loadBest());
  b.runs++;
  b.bestFloor = Math.max(b.bestFloor, G.floor);
  b.bestCredits = Math.max(b.bestCredits, G.player.credits);
  if (update.graduated) b.graduations++;
  try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) { }
  return b;
}
function statsHtml() {
  const p = G.player;
  return `<div class="report">
    <div>到達：${YEARS[yearOf(G.floor)].label} ${SUB_NAMES[subOf(G.floor)]}</div>
    <div>レベル：${p.lvl}　取得単位：${p.credits}/${GRAD_CREDITS}</div>
    <div>所持金：${p.money}円　倒した敵：${G.stats.kills}</div>
    <div>経過ターン：${G.turn}</div></div>`;
}

function gameOver(reason) {
  if (G.mode === 'over') return;
  G.mode = 'over';
  G.overReason = reason;
  G.player.hp = 0;
  clearSave();
  const b = saveBest({});
  updateHUD();
  setTimeout(() => {
    openMenu({
      title: '退学…',
      body: `<p class="bad">${reason}</p>${statsHtml()}<p class="small">最高到達：${YEARS[yearOf(b.bestFloor)].label} ${SUB_NAMES[subOf(b.bestFloor)]} / 最高単位：${b.bestCredits}</p>`,
      options: [{ label: 'もう一度入学する', action: () => { closeMenu(); newGame(); } }, { label: 'タイトルへ', action: toTitle }],
    });
  }, 600);
}

function graduation() {
  const p = G.player;
  G.mode = 'over';
  clearSave();
  const grad = p.credits >= GRAD_CREDITS;
  saveBest({ graduated: grad });
  let title, text, cls;
  if (p.credits >= 150) {
    title = '首席卒業！'; cls = 'good';
    text = '圧倒的な単位数で卒業！ 卒業式では総代として壇上に立った。池袋の街が、あなたの門出を祝福している。';
  } else if (grad) {
    title = '卒業おめでとう！'; cls = 'good';
    text = '124単位を見事にそろえ、晴れて卒業！ いけふくろうの前で撮った記念写真は一生の宝物だ。';
  } else {
    title = '留年…'; cls = 'bad';
    text = `卒業論文は書き上げたが、単位があと${GRAD_CREDITS - p.credits}足りなかった… もう1年、池袋に通うことになりそうだ。`;
  }
  sfx(grad ? 'fanfare' : 'hurt');
  openMenu({
    title, body: `<p class="${cls}">${text}</p>${statsHtml()}`,
    options: [{ label: 'もう一度入学する', action: () => { closeMenu(); newGame(); } }, { label: 'タイトルへ', action: toTitle }],
  });
}

// ---------------- セーブ ----------------
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      floor: G.floor, player: G.player, stats: G.stats, turn: G.turn, yearStartCredits: G.yearStartCredits, uid: uidCounter,
    }));
  } catch (e) { }
}
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } }

function newGame() {
  G.player = newPlayer();
  G.floor = 0; G.turn = 0; G.stats = { kills: 0 }; G.yearStartCredits = 0;
  logLines.length = 0; document.getElementById('log').innerHTML = '';
  hideTitle();
  openMenu({
    title: '入学おめでとう！',
    body: `<p>春。あなたは池袋にある大学に入学した。</p>
      <p>卒業に必要な単位は <b>${GRAD_CREDITS}</b>。</p>
      <p>迷宮のような駅、誘惑だらけの繁華街、そして待ち受ける試験と卒業論文──。</p>
      <p>4年間を生き延びて、卒業をつかみ取れ！</p>`,
    options: [{ label: 'キャンパスライフを始める', action: () => { closeMenu(); startFloor(); } }],
  });
}
function continueGame() {
  const s = loadSave();
  if (!s) return newGame();
  G.player = s.player; G.floor = s.floor; G.stats = s.stats; G.turn = s.turn; G.yearStartCredits = s.yearStartCredits;
  uidCounter = s.uid || 1000;
  logLines.length = 0; document.getElementById('log').innerHTML = '';
  hideTitle();
  startFloor();
  log('前回の続きから再開した（フロアの最初から）', 'hint');
}

// ---------------- UI: メニュー ----------------
let menuState = null;
let menuOpenedAt = 0;
function openMenu(cfg) {
  if (!menuState) menuOpenedAt = performance.now();
  menuState = { ...cfg, sel: cfg.options.findIndex(o => !o.disabled) };
  if (G.mode !== 'over') G.mode = 'menu';
  renderMenu();
  document.getElementById('modal').classList.remove('hidden');
}
function closeMenu() {
  menuState = null;
  document.getElementById('modal').classList.add('hidden');
  if (G.mode === 'menu') G.mode = 'play';
  updateHUD();
}
function renderMenu() {
  const m = menuState;
  const modal = document.getElementById('modal');
  modal.querySelector('h2').textContent = m.title;
  modal.querySelector('.body').innerHTML = m.body || '';
  const opts = modal.querySelector('.options');
  opts.innerHTML = '';
  m.options.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt' + (i === m.sel ? ' sel' : '');
    btn.disabled = !!o.disabled;
    if (o.sprite && SPRITES[o.sprite]) {
      const c = document.createElement('canvas');
      c.width = 16; c.height = 16; c.className = 'icon';
      c.getContext('2d').drawImage(SPRITES[o.sprite], 0, 0);
      btn.appendChild(c);
    }
    const span = document.createElement('span');
    span.innerHTML = `<span class="lbl">${o.label}</span>${o.sub ? `<span class="sub">${o.sub}</span>` : ''}`;
    btn.appendChild(span);
    // タップ直後に開いたメニューへの誤クリック（ゴーストクリック）を無視
    btn.addEventListener('click', () => { if (!o.disabled && performance.now() - menuOpenedAt > 350) o.action(); });
    opts.appendChild(btn);
  });
  const selBtn = opts.children[m.sel];
  if (selBtn) selBtn.scrollIntoView({ block: 'nearest' });
}
function menuKey(key) {
  const m = menuState;
  if (!m) return;
  const n = m.options.length;
  const move = d => {
    for (let k = 1; k <= n; k++) {
      const i = (m.sel + d * k + n * k) % n;
      if (!m.options[i].disabled) { m.sel = i; break; }
    }
    renderMenu();
  };
  if (key === 'ArrowUp' || key === 'w' || key === 'k' || key === '8') move(-1);
  else if (key === 'ArrowDown' || key === 's' || key === 'j' || key === '2') move(1);
  else if (key === 'Enter' || key === ' ' || key === 'z') { const o = m.options[m.sel]; if (o && !o.disabled) o.action(); }
  else if (key === 'Escape' || key === 'x' || key === 'i') { if (m.onCancel) m.onCancel(); }
}

// ---------------- UI: HUD ----------------
function updateHUD() {
  const p = G.player;
  if (!p) return;
  const y = yearOf(G.floor), s = subOf(G.floor);
  const boss = G.enemies.find(e => e.d.boss);
  const fl = document.getElementById('hud-floor');
  fl.innerHTML = `<span>${YEARS[y].label} ${SUB_NAMES[s]}</span><span class="area">${YEARS[y].area}</span>` +
    (boss ? `<span class="boss">${boss.d.name} ${Math.max(0, boss.hp)}/${boss.maxHp}</span>` : '');
  const hpPct = Math.max(0, p.hp / p.maxHp * 100);
  const hpCol = hpPct > 50 ? '#38b764' : hpPct > 25 ? '#ffcd75' : '#b13e53';
  const w = equipped('weapon'), a = equipped('armor');
  document.getElementById('hud-stats').innerHTML = `
    <div class="row"><span>Lv${p.lvl}</span>
      <span class="hpbar"><span style="width:${hpPct}%;background:${hpCol}"></span><em>体力 ${Math.max(0, p.hp)}/${p.maxHp}</em></span></div>
    <div class="row small">
      <span>学力${playerAtk()}</span><span>防御${playerDef()}</span>
      <span class="${p.hunger <= 20 ? 'bad' : ''}">満腹${p.hunger}%</span>
      <span class="credit">単位${p.credits}/${GRAD_CREDITS}</span>
      <span>${p.money}円</span>${p.sleep > 0 ? '<span class="bad">睡眠中</span>' : ''}
    </div>
    <div class="row small dim"><span>装備：${w ? ITEMS[w.id].name : 'なし'} / ${a ? ITEMS[a.id].name : 'なし'}</span><span>EXP ${p.xp}/${xpNeed(p.lvl)}</span></div>`;
}

// ---------------- 描画 ----------------
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function drawSprite(name, x, y, flip = false, alpha = 1) {
  const s = SPRITES[name];
  if (!s) return;
  ctx.globalAlpha = alpha;
  if (flip) { ctx.save(); ctx.translate(x + 16, y); ctx.scale(-1, 1); ctx.drawImage(s, 0, 0); ctx.restore(); }
  else ctx.drawImage(s, x, y);
  ctx.globalAlpha = 1;
}

function drawGame() {
  const p = G.player;
  const theme = THEMES[YEARS[yearOf(G.floor)].theme];
  const tiles = TILES[YEARS[yearOf(G.floor)].theme];
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const camX = Math.max(0, Math.min(MW - VW, p.x - Math.floor(VW / 2)));
  const camY = Math.max(0, Math.min(MH - VH, p.y - Math.floor(VH / 2)));
  const sx = x => (x - camX) * T, sy = y => (y - camY) * T;

  for (let ty = camY; ty < camY + VH; ty++) for (let tx = camX; tx < camX + VW; tx++) {
    const i = idx(tx, ty);
    if (!G.explored[i]) continue;
    const t = G.map[i], h = hash2(tx, ty, G.floor);
    let img;
    if (t === WALL) {
      if (walkable(tx, ty + 1)) { const v = h % 10; img = tiles.face[v < 6 ? 0 : v < 8 ? 1 : 2]; }
      else img = tiles.top;
    } else if (t === STAIRS) img = tiles.stairs;
    else {
      const v = h % 100;
      img = G.roomId[i] < 0 ? tiles.floor[0] : tiles.floor[v < 88 ? 0 : v < 95 ? 1 : 2];
    }
    ctx.drawImage(img, sx(tx), sy(ty));
    if (!G.visible[i]) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(sx(tx), sy(ty), T, T); }
  }
  const onScreen = (x, y) => x >= camX && y >= camY && x < camX + VW && y < camY + VH;
  for (const it of G.items) {
    if (!onScreen(it.x, it.y) || !G.visible[idx(it.x, it.y)]) continue;
    const spr = it.kind === 'money' ? 'coin' : it.kind === 'card' ? 'card' : ITEMS[it.item.id].sprite;
    drawSprite(spr, sx(it.x), sy(it.y));
  }
  const bob = Math.floor(G.frame / 30) % 2;
  for (const n of G.npcs) {
    if (!onScreen(n.x, n.y) || !G.visible[idx(n.x, n.y)]) continue;
    drawSprite(n.sprite, sx(n.x), sy(n.y));
  }
  for (const e of G.enemies) {
    if (!onScreen(e.x, e.y) || !G.visible[idx(e.x, e.y)]) continue;
    if (e.flash > 0) { e.flash--; if (e.flash % 4 < 2) continue; }
    const ex = sx(e.x), ey = sy(e.y) - (e.awake ? bob : 0);
    if (e.d.boss) {
      ctx.fillStyle = `rgba(177,62,83,${0.25 + 0.15 * Math.sin(G.frame / 8)})`;
      ctx.fillRect(ex - 1, ey - 1, 18, 18);
    }
    drawSprite(e.d.sprite, ex, ey, e.face > 0 && !e.d.boss);
    if (e.hp < e.maxHp) {
      ctx.fillStyle = '#1a1c2c'; ctx.fillRect(ex + 1, ey - 3, 14, 3);
      ctx.fillStyle = '#b13e53'; ctx.fillRect(ex + 2, ey - 2, Math.max(1, Math.round(12 * e.hp / e.maxHp)), 1);
    }
    if (e.fleeing && e.stolen) drawPixelText(ctx, '-', ex + 12, ey, '#ffcd75');
  }
  // プレイヤー
  if (!(p.flash > 0 && (p.flash--) % 4 < 2)) {
    drawSprite('player', sx(p.x), sy(p.y) - (p.sleep > 0 ? 0 : bob * 0), p.face < 0);
  }
  if (p.sleep > 0) {
    ctx.fillStyle = '#f4f4f4';
    const zx = sx(p.x) + 11, zy = sy(p.y) - 2 - (Math.floor(G.frame / 15) % 3);
    ctx.fillRect(zx, zy, 4, 1); ctx.fillRect(zx + 2, zy + 1, 1, 1); ctx.fillRect(zx + 1, zy + 2, 1, 1); ctx.fillRect(zx, zy + 3, 4, 1);
  }
  // エフェクト
  G.effects = G.effects.filter(fx => fx.t < 40);
  for (const fx of G.effects) {
    fx.t++;
    const w = fx.text.length * 4 - 1;
    drawPixelText(ctx, fx.text, sx(fx.x) + 8 - Math.floor(w / 2), sy(fx.y) - 2 - Math.floor(fx.t / 4), fx.color);
  }
  // ミニマップ（右上）
  drawMinimap();
}

function drawMinimap() {
  const s = 1, ox = canvas.width - MW * s - 3, oy = 3;
  ctx.fillStyle = 'rgba(10,10,20,0.45)';
  ctx.fillRect(ox - 1, oy - 1, MW * s + 2, MH * s + 2);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = idx(x, y);
    if (!G.explored[i] || G.map[i] === WALL) continue;
    ctx.fillStyle = G.map[i] === STAIRS ? '#a7f070' : 'rgba(148,176,194,0.55)';
    ctx.fillRect(ox + x * s, oy + y * s, s, s);
  }
  for (const e of G.enemies) if (G.visible[idx(e.x, e.y)]) { ctx.fillStyle = '#ef7d57'; ctx.fillRect(ox + e.x * s, oy + e.y * s, s, s); }
  if (G.frame % 30 < 20) { ctx.fillStyle = '#ffcd75'; ctx.fillRect(ox + G.player.x * s, oy + G.player.y * s, s, s); }
}

// タイトル画面の背景（池袋の夜景）
const titleScene = (() => {
  const stars = Array.from({ length: 40 }, () => [R.int(0, 319), R.int(0, 90), Math.random()]);
  const bld = [];
  let x = 0;
  while (x < 320) { const w = R.int(14, 34); bld.push({ x, w, h: R.int(30, 80), lights: Array.from({ length: 40 }, () => Math.random()) }); x += w; }
  return { stars, bld };
})();
function drawTitle() {
  const g = ctx.createLinearGradient(0, 0, 0, 208);
  g.addColorStop(0, '#1a1c2c'); g.addColorStop(0.55, '#5d275d'); g.addColorStop(0.85, '#b13e53');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 320, 208);
  for (const [x, y, ph] of titleScene.stars) {
    if (Math.sin(G.frame / 20 + ph * 6) > -0.3) { ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x, y, 1, 1); }
  }
  // 奥のビル
  for (const b of titleScene.bld) {
    ctx.fillStyle = '#29243a';
    ctx.fillRect(b.x, 208 - b.h - 30, b.w - 1, b.h + 30);
    let k = 0;
    for (let wy = 208 - b.h - 26; wy < 190; wy += 6) for (let wx = b.x + 3; wx < b.x + b.w - 4; wx += 5) {
      if (b.lights[k++ % 40] > 0.6) { ctx.fillStyle = '#ffcd75'; ctx.fillRect(wx, wy, 2, 2); }
    }
  }
  // 高層ビル（サンシャイン風の塔）
  const tx = 222;
  ctx.fillStyle = '#333c57'; ctx.fillRect(tx, 40, 34, 170);
  ctx.fillStyle = '#3e4868'; ctx.fillRect(tx, 40, 6, 170);
  ctx.fillStyle = '#566c86'; ctx.fillRect(tx + 15, 28, 3, 12);
  ctx.fillStyle = G.frame % 60 < 30 ? '#b13e53' : '#5d275d'; ctx.fillRect(tx + 15, 26, 3, 2);
  for (let wy = 46; wy < 200; wy += 5) for (let wx = tx + 9; wx < tx + 32; wx += 4) {
    if (hash2(wx, wy) % 5 < 2) { ctx.fillStyle = '#ffcd75'; ctx.fillRect(wx, wy, 2, 2); }
  }
  // 地面と道路
  ctx.fillStyle = '#1a1c2c'; ctx.fillRect(0, 176, 320, 32);
  ctx.fillStyle = '#333c57'; for (let i = 0; i < 320; i += 24) ctx.fillRect((i + G.frame) % 344 - 24, 190, 12, 2);
  // キャラ
  ctx.save(); ctx.translate(36, 120); ctx.scale(3, 3); ctx.drawImage(SPRITES.owlStatue, 0, 0); ctx.restore();
  ctx.save(); ctx.translate(100, 130 - (Math.floor(G.frame / 20) % 2)); ctx.scale(3, 3); ctx.drawImage(SPRITES.player, 0, 0); ctx.restore();
}

function loop() {
  G.frame++;
  if (G.mode === 'title') drawTitle();
  else if (G.player && G.map) drawGame();
  requestAnimationFrame(loop);
}

// ---------------- タイトル ----------------
function showTitle() {
  G.mode = 'title';
  document.getElementById('title').classList.remove('hidden');
  document.getElementById('btn-continue').style.display = loadSave() ? '' : 'none';
  const b = loadBest();
  document.getElementById('best').textContent = b.runs ? `入学${b.runs}回 / 卒業${b.graduations || 0}回 / 最高単位${b.bestCredits}` : '';
  document.getElementById('hud-floor').innerHTML = '';
  document.getElementById('hud-stats').innerHTML = '<div class="row small dim">池袋の大学に入学し、124単位を集めて卒業を目指すローグライク</div>';
}
function hideTitle() { document.getElementById('title').classList.add('hidden'); }
function toTitle() { closeMenu(); G.mode = 'title'; G.map = null; showTitle(); }

function showHelp(back) {
  openMenu({
    title: '遊び方',
    body: `<div class="help">
      <p><b>目的</b>：池袋の4年間（全12エリア）を生き延び、<b>${GRAD_CREDITS}単位</b>以上集めて卒業する。</p>
      <p>単位は試験系の敵（小テスト・レポートなど）やボスを倒す、または出席票を拾うと手に入る。</p>
      <p>体力が0になると<b>退学</b>（ゲームオーバー）。満腹度が0になると体力が減っていく。</p>
      <p><b>操作（キーボード）</b><br>
      移動：矢印 / WASD / テンキー　斜め：Q E Z C<br>
      足踏み：スペース / 5　決定（出口・拾う）：Enter<br>
      持ち物：I　閉じる：Esc</p>
      <p><b>操作（スマホ）</b>：画面下のボタン。長押しで連続移動。</p>
      <p>敵に向かって移動すると攻撃。ターン制なので、あなたが動くまで敵も動かない。</p>
      </div>`,
    options: [{ label: '閉じる', action: back || closeMenu }],
    onCancel: back || closeMenu,
  });
}
function openSystemMenu() {
  if (G.mode !== 'play') return;
  openMenu({
    title: 'メニュー',
    options: [
      { label: '遊び方', action: () => showHelp(openSystemMenu) },
      { label: `効果音：${G.sound ? 'ON' : 'OFF'}`, action: () => { G.sound = !G.sound; try { localStorage.setItem(SOUND_KEY, G.sound ? '1' : '0'); } catch (e) { } openSystemMenu(); } },
      { label: 'タイトルへ戻る', sub: '次回はこのフロアの最初から再開', action: toTitle },
      { label: '閉じる', action: closeMenu },
    ],
    onCancel: closeMenu,
  });
}

// ---------------- 入力 ----------------
const KEYMAP = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  k: [0, -1], j: [0, 1], h: [-1, 0], l: [1, 0], y: [-1, -1], u: [1, -1], b: [-1, 1], n: [1, 1],
  q: [-1, -1], e: [1, -1], z: [-1, 1], c: [1, 1],
  '8': [0, -1], '2': [0, 1], '4': [-1, 0], '6': [1, 0], '7': [-1, -1], '9': [1, -1], '1': [-1, 1], '3': [1, 1],
  '5': [0, 0], ' ': [0, 0], '.': [0, 0],
};
document.addEventListener('keydown', ev => {
  const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
  if (G.mode === 'title') {
    if (key === 'Enter' || key === ' ') { ev.preventDefault(); loadSave() ? continueGame() : newGame(); }
    return;
  }
  if (menuState) { ev.preventDefault(); menuKey(key); return; }
  if (G.mode !== 'play') return;
  if (KEYMAP[key]) { ev.preventDefault(); tryMove(...KEYMAP[key]); }
  else if (key === 'Enter' || key === '>' || key === 'g' || key === ',') { ev.preventDefault(); actionButton(); }
  else if (key === 'i' || key === 'Tab') { ev.preventDefault(); openInventory(); }
  else if (key === 'Escape' || key === 'm') { ev.preventDefault(); openSystemMenu(); }
});

function bindHold(el, fn) {
  let timer = null, delay = null;
  const stop = () => { clearTimeout(delay); clearInterval(timer); timer = delay = null; };
  el.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    stop(); fn();
    delay = setTimeout(() => { timer = setInterval(() => { if (G.mode === 'play') fn(); else stop(); }, 140); }, 320);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => el.addEventListener(t, stop));
}

function init() {
  buildAllSprites();
  buildTiles();
  try { G.sound = localStorage.getItem(SOUND_KEY) !== '0'; } catch (e) { }
  document.querySelectorAll('#dpad button').forEach(btn => {
    const dx = +btn.dataset.dx, dy = +btn.dataset.dy;
    bindHold(btn, () => tryMove(dx, dy));
  });
  document.getElementById('btn-inv').addEventListener('click', openInventory);
  document.getElementById('btn-act').addEventListener('click', actionButton);
  document.getElementById('btn-menu').addEventListener('click', openSystemMenu);
  document.getElementById('btn-new').addEventListener('click', () => {
    if (loadSave() && !confirm('中断中のデータは消えます。はじめから入学しますか？')) return;
    clearSave(); newGame();
  });
  document.getElementById('btn-continue').addEventListener('click', continueGame);
  document.getElementById('btn-help').addEventListener('click', () => showHelp(() => { closeMenu(); G.mode = 'title'; }));
  document.addEventListener('contextmenu', e => { if (e.target.closest('#controls')) e.preventDefault(); });
  showTitle();
  loop();
}
init();
