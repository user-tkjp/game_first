'use strict';
// ============================================================
//  ドット絵定義（すべてコード内で描画 → 画像ファイル不要）
//  16x16 / 1文字 = 1ピクセル / '.' は透明
// ============================================================

const PALETTE = {
  k: '#1a1c2c', p: '#5d275d', r: '#b13e53', o: '#ef7d57', y: '#ffcd75',
  g: '#a7f070', G: '#38b764', T: '#257179', b: '#3b5dc9', L: '#41a6f6',
  c: '#73eff7', w: '#f4f4f4', l: '#94b0c2', d: '#566c86', m: '#333c57',
  s: '#f4c9a0', h: '#3b2a20', n: '#8b5a2b', P: '#f49ac1',
};
const OUTLINE = '#1a1c2c';

const ART = {
  player: [
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '....hssssssh....',
    '....skssssks....',
    '....ssssssss....',
    '.....ssssss.....',
    '.....bbbbbb.....',
    '....bbnbbnbb....',
    '...bbbnbbnbbb...',
    '...sbbbbbbbbs...',
    '....bbbbbbbb....',
    '....mmmmmmmm....',
    '....mmm..mmm....',
    '....mmm..mmm....',
    '...kkkk..kkkk...',
  ],
  pigeon: [
    '................',
    '................',
    '......lll.......',
    '.....llkll......',
    '.....llllyy.....',
    '.....lccl.......',
    '....llccl.......',
    '...dllllllll....',
    '..ddlllllllll...',
    '..dddlllllllll..',
    '...ddddllllll...',
    '....dddddddd....',
    '......o..o......',
    '......o..o......',
    '.....oo.oo......',
    '................',
  ],
  paper: [
    '................',
    '...wwwwwwwww....',
    '...wwwwwwwwww...',
    '...wllllllwww...',
    '...wwwwwwwwww...',
    '...wkkwwwkkww...',
    '...wkkwwwkkww...',
    '...wwwwwwwwww...',
    '...wwrrrrrrww...',
    '...wwwwwwwwww...',
    '...wllllllwww...',
    '...wwwwwwwwww...',
    '...wwwwwwwwww...',
    '....w..w..w.....',
    '....k..k..k.....',
    '................',
  ],
  ghost: [
    '................',
    '......pppp......',
    '....pppppppp....',
    '...pppppppppp...',
    '...ppwwppwwpp...',
    '...ppwkppwkpp...',
    '...pppppppppp...',
    '...pppPPPPppp...',
    '...pppppppppp...',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pp.ppp.ppp.p..',
    '..p...p...p.....',
    '................',
    '................',
  ],
  suit: [
    '................',
    '.....yyyyyy.....',
    '....yyyyyyyy....',
    '....yssssssy....',
    '....skkkkkks....',
    '....ssssssss....',
    '.....ssssss.....',
    '....mmmwwmmm....',
    '...mmmmwwmmmm...',
    '...mmmmwrmmmm...',
    '...smmmwrmmms...',
    '....mmmmmmmm....',
    '....mmmmmmmm....',
    '....mmm..mmm....',
    '....mmm..mmm....',
    '...kkkk..kkkk...',
  ],
  drunk: [
    '................',
    '................',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '....hssssssh....',
    '....skssssks....',
    '....srssssrs....',
    '.....ssrrss.....',
    '....ddwrrwdd....',
    '...dddwwrwddd...',
    '..sddddwrdddds..',
    '...Gdddddddd....',
    '...G.mmmmmm.....',
    '.....mmm.mmm....',
    '.....mmm..mmm...',
    '....kkkk..kkkk..',
  ],
  clock: [
    '................',
    '...rr......rr...',
    '..rrr......rrr..',
    '....rrrrrrrr....',
    '...rwwwwwwwwr...',
    '..rwwwwkwwwwwr..',
    '..rwwwwkwwwwwr..',
    '..rwwwwkwwwwwr..',
    '..rwwwwkkkkwwr..',
    '..rwwwwwwwwwwr..',
    '..rwwwwwwwwwwr..',
    '...rwwwwwwwwr...',
    '....rrrrrrrr....',
    '....k......k....',
    '...kk......kk...',
    '................',
  ],
  prof: [
    '................',
    '................',
    '....ww....ww....',
    '...www.ss.www...',
    '...wwssssssww...',
    '....skksskks....',
    '....ssssssss....',
    '....swwwwwws....',
    '.....wwrrww.....',
    '....nnwwwwnn....',
    '...nnnnwwnnnn...',
    '...snnnwwnnns...',
    '....nnnnnnnn....',
    '....mmm..mmm....',
    '....mmm..mmm....',
    '...kkkk..kkkk...',
  ],
  thesis: [
    '................',
    '................',
    '..rrrrrrrrrrrw..',
    '..ryyyyyyyyyrw..',
    '..rrrrrrrrrrrw..',
    '..rrwwrrrwwrrw..',
    '..rrkwrrrwkrrw..',
    '..rrrrrrrrrrrw..',
    '..rrrkkkkkrrrw..',
    '..rrkrrrrrkrrw..',
    '..rrrrrrrrrrrw..',
    '..ryyyyyyyyyrw..',
    '..rrrrrrrrrrrw..',
    '...wwwwwwwwwww..',
    '................',
    '................',
  ],
  owl: [
    '................',
    '...n........n...',
    '...nn......nn...',
    '...nnnnnnnnnn...',
    '..nnyyynnyyynn..',
    '..nykkynnykkyn..',
    '..nnyyynnyyynn..',
    '...nnnnoonnnn...',
    '...nnwnnnnwnn...',
    '...nnnwnnwnnn...',
    '...nnwnnnnwnn...',
    '....nnnnnnnn....',
    '....oo....oo....',
    '..dddddddddddd..',
    '..dlllllllllld..',
    '..dddddddddddd..',
  ],
  // ---- アイテム ----
  onigiri: [
    '................',
    '................',
    '................',
    '.......ww.......',
    '......wwww......',
    '.....wwwwww.....',
    '....wwwwwwww....',
    '....wwwwwwww....',
    '...wwwwwwwwww...',
    '...wwkkkkkkww...',
    '..wwwkkkkkkwww..',
    '..wwwkkkkkkwww..',
    '...wwkkkkkkww...',
    '................',
    '................',
    '................',
  ],
  ramen: [
    '................',
    '................',
    '................',
    '..........nn....',
    '.........nn.....',
    '........nn......',
    '...yyyyynyyyy...',
    '..yywyyyyyywyy..',
    '..rrrrrrrrrrrr..',
    '..rwrrwrrwrrwr..',
    '...rrrrrrrrrr...',
    '....rrrrrrrr....',
    '.....kkkkkk.....',
    '................',
    '................',
    '................',
  ],
  can: [
    '................',
    '................',
    '......llll......',
    '.....gggggg.....',
    '.....gggggg.....',
    '.....gkkkkg.....',
    '.....gykykg.....',
    '.....gkkkkg.....',
    '.....gggggg.....',
    '.....gggggg.....',
    '.....gggggg.....',
    '.....gggggg.....',
    '......llll......',
    '................',
    '................',
    '................',
  ],
  bottle: [
    '................',
    '................',
    '.......yy.......',
    '.......nn.......',
    '......nnnn......',
    '......nnnn......',
    '......yyyy......',
    '......yrry......',
    '......yyyy......',
    '......nnnn......',
    '......nnnn......',
    '......nnnn......',
    '................',
    '................',
    '................',
    '................',
  ],
  book: [
    '................',
    '................',
    '................',
    '...bbbbbbbbbw...',
    '...byyyyyyybw...',
    '...bbbbbbbbbw...',
    '...bbwwwwwbbw...',
    '...bbbbbbbbbw...',
    '...bbbbbbbbbw...',
    '...bbbbbbbbbw...',
    '...bbbbbbbbbw...',
    '....wwwwwwwww...',
    '................',
    '................',
    '................',
    '................',
  ],
  exam: [
    '................',
    '................',
    '....wwwwwwww....',
    '....wllllllw....',
    '....wwwwwwww....',
    '....wllllllw....',
    '....wwwrrrww....',
    '....wwrwwwrw....',
    '....wwrwwwrw....',
    '....wwwrrrww....',
    '....wllllllw....',
    '....wwwwwwww....',
    '................',
    '................',
    '................',
    '................',
  ],
  phone: [
    '................',
    '................',
    '.....mmmmmm.....',
    '.....mccccm.....',
    '.....mcggcm.....',
    '.....mcgccm.....',
    '.....mccccm.....',
    '.....mccrcm.....',
    '.....mccccm.....',
    '.....mccccm.....',
    '.....mmmmmm.....',
    '.....mmwwmm.....',
    '.....mmmmmm.....',
    '................',
    '................',
    '................',
  ],
  coffee: [
    '................',
    '................',
    '................',
    '.......l...l....',
    '......l...l.....',
    '.......l...l....',
    '................',
    '....wwwwwwww....',
    '....wnnnnnnw....',
    '....wwwwwwwwww..',
    '....wwwGGwww.w..',
    '....wwwGGwwwww..',
    '....wwwwwwww....',
    '.....wwwwww.....',
    '................',
    '................',
  ],
  bread: [
    '................',
    '................',
    '................',
    '................',
    '.....yyyyyy.....',
    '....yoyyoyyy....',
    '...yyyyyyyyyy...',
    '...yoyyoyyoyy...',
    '...yyyyyyyyyy...',
    '....oooooooo....',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  pencil: [
    '................',
    '................',
    '...........PP...',
    '..........yPP...',
    '.........yyy....',
    '........yyy.....',
    '.......yyy......',
    '......yyy.......',
    '.....yyy........',
    '....yyy.........',
    '...nny..........',
    '..nnn...........',
    '..kn............',
    '................',
    '................',
    '................',
  ],
  laptop: [
    '................',
    '................',
    '................',
    '................',
    '....dddddddd....',
    '....dccccccd....',
    '....dcLccccd....',
    '....dccccccd....',
    '....dddddddd....',
    '...llllllllll...',
    '..llllllllllll..',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  cloth: [
    '................',
    '................',
    '................',
    '....bbb..bbb....',
    '..bbbbbbbbbbbb..',
    '.bbbbbbbbbbbbbb.',
    '.bbb.bbbbbb.bbb.',
    '.....bbbbbb.....',
    '.....bbbbbb.....',
    '.....bbbbbb.....',
    '.....bbbbbb.....',
    '.....bbbbbb.....',
    '................',
    '................',
    '................',
    '................',
  ],
  coin: [
    '................',
    '................',
    '................',
    '................',
    '.....yyyyyy.....',
    '....yyyyyyyy....',
    '...yyoyyyyoyy...',
    '...yyyoyyoyyy...',
    '...yyyyooyyyy...',
    '...yyyooooyyy...',
    '...yyyyooyyyy...',
    '....yyyooyyy....',
    '.....yyyyyy.....',
    '................',
    '................',
    '................',
  ],
  card: [
    '................',
    '................',
    '................',
    '................',
    '..wwwwwwwwwwww..',
    '..wGGGGGGGGGGw..',
    '..wwwwwwwwwwww..',
    '..wllwllllwwww..',
    '..wwwwwwwwwwww..',
    '..wllllwwrrrww..',
    '..wwwwwwwrwrww..',
    '..wwwwwwwrrrww..',
    '..wwwwwwwwwwww..',
    '................',
    '................',
    '................',
  ],
};

// 色替えバリエーション: name: [base, {from: to}]
const RECOLOR = {
  crow: ['pigeon', { l: 'm', d: 'k', c: 'p', y: 'k', o: 'd' }],
  report: ['paper', { w: 'c', l: 'L' }],
  midterm: ['paper', { w: 'P', l: 'r' }],
  goldPaper: ['paper', { w: 'y', l: 'o' }],
  ghost2: ['ghost', { p: 'T', P: 'c' }],
  interviewer: ['suit', { y: 'h' }],
  intern: ['suit', { y: 'n', m: 'd' }],
  boss3: ['suit', { y: 'l', m: 'b', r: 'y' }],
  drunk2: ['drunk', { d: 'n' }],
  lasttrain: ['clock', { r: 'G' }],
  redpen: ['prof', { n: 'r' }],
  boss2: ['prof', { n: 'p' }],
  shop: ['player', { b: 'G', n: 'w', h: 'n' }],
  owlStatue: ['owl', { n: 'l', y: 'w', o: 'd' }],
  pen2: ['pencil', { y: 'L' }],
  pen3: ['pencil', { y: 'g', n: 'g' }],
  pen4: ['pencil', { y: 'm', n: 'y', P: 'm' }],
  tshirt: ['cloth', { b: 'w' }],
  parka: ['cloth', { b: 'G' }],
  denim: ['cloth', { b: 'L' }],
  down: ['cloth', { b: 'r' }],
  recruit: ['cloth', { b: 'm' }],
  ticket: ['card', { G: 'p', r: 'b' }],
  greenTea: ['can', { g: 'G', y: 'w' }],
};

const SPRITES = {};

function buildSprite(rows, outline = true) {
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 16;
  const ctx = cv.getContext('2d');
  const solid = (x, y) => y >= 0 && y < 16 && x >= 0 && x < 16 && rows[y][x] && rows[y][x] !== '.';
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const ch = rows[y][x];
      if (ch && ch !== '.') {
        ctx.fillStyle = PALETTE[ch] || '#ff00ff';
        ctx.fillRect(x, y, 1, 1);
      } else if (outline && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) {
        ctx.fillStyle = OUTLINE;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return cv;
}

function normalizeRows(rows) {
  return rows.map(r => (r + '................').slice(0, 16));
}

function buildAllSprites() {
  for (const [name, rows] of Object.entries(ART)) {
    ART[name] = normalizeRows(rows);
    SPRITES[name] = buildSprite(ART[name]);
  }
  for (const [name, [base, map]] of Object.entries(RECOLOR)) {
    const rows = ART[base].map(r => r.split('').map(ch => map[ch] || ch).join(''));
    SPRITES[name] = buildSprite(rows);
  }
}

// ---------- 地形タイル（テーマ別に手続き生成） ----------
function hash2(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0);
}

function tileCanvas(draw) {
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 16;
  const ctx = cv.getContext('2d');
  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  draw(px, ctx);
  return cv;
}

const THEMES = {
  station: {
    bg: '#10121c',
    floor: [
      px => { px(0, 0, 16, 16, '#a8b0b8'); px(0, 0, 16, 1, '#959ca6'); px(0, 0, 1, 16, '#959ca6'); px(8, 0, 1, 16, '#9ba2ab'); px(0, 8, 16, 1, '#9ba2ab'); },
      px => { px(0, 0, 16, 16, '#a8b0b8'); px(0, 0, 16, 1, '#959ca6'); px(0, 0, 1, 16, '#959ca6'); px(5, 0, 6, 16, '#e8c040'); for (let y = 1; y < 16; y += 3) { px(6, y, 1, 1, '#c9a030'); px(9, y, 1, 1, '#c9a030'); } },
      px => { px(0, 0, 16, 16, '#a8b0b8'); px(0, 0, 16, 1, '#959ca6'); px(0, 0, 1, 16, '#959ca6'); px(3, 6, 10, 4, '#e8c040'); px(4, 7, 2, 2, '#1a1c2c'); px(9, 7, 3, 1, '#1a1c2c'); px(10, 8, 1, 1, '#1a1c2c'); },
    ],
    top: px => { px(0, 0, 16, 16, '#2e3444'); px(0, 15, 16, 1, '#252a38'); },
    face: [
      px => { px(0, 0, 16, 16, '#d8d8d0'); px(0, 0, 16, 1, '#b8b8b0'); px(0, 7, 16, 1, '#c4c4bc'); px(7, 0, 1, 16, '#c4c4bc'); px(0, 10, 16, 2, '#3b5dc9'); px(0, 15, 16, 1, '#8a8a84'); },
      px => { px(0, 0, 16, 16, '#d8d8d0'); px(0, 10, 16, 2, '#3b5dc9'); px(1, 2, 14, 6, '#ffcd75'); px(3, 4, 6, 1, '#1a1c2c'); px(10, 3, 1, 3, '#1a1c2c'); px(9, 4, 3, 1, '#1a1c2c'); px(0, 15, 16, 1, '#8a8a84'); },
      px => { px(0, 0, 16, 16, '#d8d8d0'); px(0, 10, 16, 2, '#3b5dc9'); px(2, 1, 12, 7, '#566c86'); px(3, 2, 10, 5, '#73eff7'); px(0, 15, 16, 1, '#8a8a84'); },
    ],
  },
  street: {
    bg: '#1a1c2c',
    floor: [
      px => { px(0, 0, 16, 16, '#c9a27a'); px(0, 7, 16, 1, '#b08860'); px(0, 15, 16, 1, '#b08860'); px(7, 0, 1, 7, '#b08860'); px(15, 8, 1, 7, '#b08860'); },
      px => { px(0, 0, 16, 16, '#c9a27a'); px(0, 7, 16, 1, '#b08860'); px(0, 15, 16, 1, '#b08860'); px(3, 3, 10, 10, '#6b6f80'); px(4, 4, 8, 8, '#7d8294'); px(5, 7, 6, 1, '#6b6f80'); px(7, 5, 1, 6, '#6b6f80'); },
      px => { px(0, 0, 16, 16, '#c9a27a'); px(0, 7, 16, 1, '#b08860'); px(7, 0, 1, 7, '#b08860'); px(2, 9, 12, 6, '#8b5a2b'); px(3, 6, 3, 3, '#38b764'); px(7, 5, 3, 4, '#a7f070'); px(10, 6, 3, 3, '#38b764'); px(5, 7, 1, 1, '#f49ac1'); },
    ],
    top: px => { px(0, 0, 16, 16, '#4a3f5c'); px(0, 15, 16, 1, '#3a3049'); },
    face: [
      px => { px(0, 0, 16, 16, '#e0d6c8'); px(2, 3, 4, 5, '#41a6f6'); px(10, 3, 4, 5, '#41a6f6'); px(2, 3, 4, 1, '#73eff7'); px(10, 3, 4, 1, '#73eff7'); px(0, 12, 16, 4, '#b8ab98'); },
      px => { px(0, 0, 16, 16, '#e0d6c8'); px(1, 1, 14, 6, '#b13e53'); px(3, 3, 10, 2, '#ffcd75'); px(1, 9, 14, 7, '#41a6f6'); px(1, 9, 14, 1, '#73eff7'); },
      px => { px(0, 0, 16, 16, '#d0c4ee'); px(1, 1, 14, 5, '#ef7d57'); px(3, 2, 2, 3, '#f4f4f4'); px(6, 2, 2, 3, '#f4f4f4'); px(9, 2, 4, 3, '#f4f4f4'); px(2, 8, 5, 8, '#8b5a2b'); px(9, 8, 5, 5, '#41a6f6'); },
    ],
  },
  night: {
    bg: '#07070d',
    floor: [
      px => { px(0, 0, 16, 16, '#2a2d3e'); px(3, 4, 1, 1, '#363a4e'); px(11, 9, 1, 1, '#363a4e'); px(6, 13, 1, 1, '#22253a'); },
      px => { px(0, 0, 16, 16, '#2a2d3e'); px(3, 3, 10, 10, '#1f2130'); for (let i = 4; i < 13; i += 2) px(i, 4, 1, 8, '#34384c'); },
      px => { px(0, 0, 16, 16, '#2a2d3e'); px(3, 5, 10, 6, '#3b3060'); px(5, 6, 3, 1, '#f49ac1'); px(8, 8, 3, 1, '#73eff7'); px(4, 9, 2, 1, '#f49ac1'); },
    ],
    top: px => { px(0, 0, 16, 16, '#121222'); px(0, 15, 16, 1, '#0b0b16'); },
    face: [
      px => { px(0, 0, 16, 16, '#3b3f5c'); px(2, 2, 3, 3, '#ffcd75'); px(7, 2, 3, 3, '#333c57'); px(12, 2, 2, 3, '#ffcd75'); px(2, 9, 3, 3, '#333c57'); px(7, 9, 3, 3, '#ffcd75'); px(12, 9, 2, 3, '#333c57'); },
      px => { px(0, 0, 16, 16, '#3b3f5c'); px(1, 2, 14, 7, '#1a1c2c'); px(2, 3, 12, 5, '#f49ac1'); px(3, 4, 10, 3, '#1a1c2c'); px(4, 5, 2, 1, '#f49ac1'); px(7, 5, 2, 1, '#f49ac1'); px(10, 5, 2, 1, '#f49ac1'); px(0, 12, 16, 4, '#2a2d3e'); },
      px => { px(0, 0, 16, 16, '#3b3f5c'); px(5, 1, 6, 14, '#1a1c2c'); px(6, 2, 4, 12, '#73eff7'); px(7, 4, 2, 1, '#1a1c2c'); px(7, 7, 2, 1, '#1a1c2c'); px(7, 10, 2, 1, '#1a1c2c'); },
    ],
  },
  campus: {
    bg: '#140d08',
    floor: [
      px => { px(0, 0, 16, 16, '#a0703c'); px(0, 3, 16, 1, '#86592c'); px(0, 7, 16, 1, '#86592c'); px(0, 11, 16, 1, '#86592c'); px(0, 15, 16, 1, '#86592c'); px(5, 0, 1, 3, '#86592c'); px(11, 4, 1, 3, '#86592c'); px(3, 8, 1, 3, '#86592c'); px(13, 12, 1, 3, '#86592c'); },
      px => { px(0, 0, 16, 16, '#7a3040'); px(1, 1, 14, 14, '#8e3a4c'); px(3, 3, 10, 10, '#7a3040'); px(5, 5, 6, 6, '#ffcd75'); px(6, 6, 4, 4, '#8e3a4c'); },
      px => { px(0, 0, 16, 16, '#a0703c'); px(0, 3, 16, 1, '#86592c'); px(0, 7, 16, 1, '#86592c'); px(0, 11, 16, 1, '#86592c'); px(4, 5, 7, 8, '#f4f4f4'); px(5, 7, 5, 1, '#94b0c2'); px(5, 9, 5, 1, '#94b0c2'); px(5, 11, 3, 1, '#94b0c2'); },
    ],
    top: px => { px(0, 0, 16, 16, '#3a2a1c'); px(0, 15, 16, 1, '#2a1e14'); },
    face: [
      px => { px(0, 0, 16, 16, '#6b4422'); px(0, 7, 16, 1, '#3a2a1c'); px(0, 15, 16, 1, '#3a2a1c'); const c = ['#b13e53', '#3b5dc9', '#38b764', '#ffcd75', '#5d275d', '#ef7d57']; for (let i = 0; i < 7; i++) { px(1 + i * 2, 1, 2, 6, c[i % 6]); px(1 + i * 2, 9, 2, 6, c[(i + 3) % 6]); } },
      px => { px(0, 0, 16, 16, '#6b4422'); px(0, 7, 16, 1, '#3a2a1c'); px(0, 15, 16, 1, '#3a2a1c'); const c = ['#3b5dc9', '#94b0c2', '#b13e53', '#38b764']; for (let i = 0; i < 7; i++) { px(1 + i * 2, 2, 2, 5, c[i % 4]); } px(2, 10, 12, 5, '#f4f4f4'); px(3, 11, 10, 1, '#94b0c2'); },
      px => { px(0, 0, 16, 16, '#e0d6c8'); px(1, 1, 14, 10, '#257179'); px(2, 2, 12, 8, '#2e8a7e'); px(3, 4, 5, 1, '#f4f4f4'); px(3, 6, 8, 1, '#f4f4f4'); px(0, 12, 16, 4, '#8b5a2b'); },
    ],
  },
};

const TILES = {};
function buildTiles() {
  for (const [name, t] of Object.entries(THEMES)) {
    TILES[name] = {
      floor: t.floor.map(f => tileCanvas(f)),
      top: tileCanvas(t.top),
      face: t.face.map(f => tileCanvas(f)),
      stairs: tileCanvas(px => {
        px(0, 0, 16, 16, '#333c57');
        for (let i = 0; i < 6; i++) px(1, 2 + i * 2, 14, 1, i % 2 ? '#94b0c2' : '#566c86');
        px(0, 0, 1, 16, '#ffcd75'); px(15, 0, 1, 16, '#ffcd75');
        px(6, 3, 4, 5, '#a7f070'); px(4, 8, 8, 1, '#a7f070'); px(5, 9, 6, 1, '#a7f070'); px(6, 10, 4, 1, '#a7f070'); px(7, 11, 2, 1, '#a7f070');
      }),
    };
  }
}

// ---------- 3x5 ドット数字フォント（ダメージ表示用） ----------
const DIGITS = {
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'],
  '+': ['000', '010', '111', '010', '000'], '-': ['000', '000', '111', '000', '000'],
};
function drawPixelText(ctx, text, x, y, color) {
  let cx = x;
  for (const ch of String(text)) {
    const g = DIGITS[ch];
    if (g) {
      for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 3; gx++) {
        if (g[gy][gx] === '1') {
          ctx.fillStyle = OUTLINE;
          ctx.fillRect(cx + gx - 1, y + gy, 3, 1); ctx.fillRect(cx + gx, y + gy - 1, 1, 3);
        }
      }
      for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 3; gx++) {
        if (g[gy][gx] === '1') { ctx.fillStyle = color; ctx.fillRect(cx + gx, y + gy, 1, 1); }
      }
    }
    cx += 4;
  }
}
