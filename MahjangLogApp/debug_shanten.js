// シャンテン数計算をデバッグ
function getTileCounts(hand) {
  const counts = {
    man: {},
    pin: {},
    sou: {},
    honor: {}
  };
  
  hand.forEach(tile => {
    if (!counts[tile.type][tile.number]) {
      counts[tile.type][tile.number] = 0;
    }
    counts[tile.type][tile.number]++;
  });
  
  return counts;
}

function calculateShanten(hand) {
  const tileCounts = getTileCounts(hand);
  let shanten = 8;
  
  let sets = 0;
  let pairs = 0;
  
  // 各牌種について処理
  for (const type of ['man', 'pin', 'sou', 'honor']) {
    const counts = tileCounts[type];
    
    for (let i = 1; i <= (type === 'honor' ? 7 : 9); i++) {
      const count = counts[i] || 0;
      
      // 刻子
      sets += Math.floor(count / 3);
      
      // 対子
      if (count >= 2) {
        pairs++;
      }
    }
    
    // 順子（数牌のみ）
    if (type !== 'honor') {
      for (let i = 1; i <= 7; i++) {
        const count1 = counts[i] || 0;
        const count2 = counts[i + 1] || 0;
        const count3 = counts[i + 2] || 0;
        
        const minCount = Math.min(count1, count2, count3);
        sets += minCount;
      }
    }
  }
  
  // シャンテン数計算
  if (sets >= 4) {
    shanten = pairs > 0 ? 0 : 1;
  } else {
    shanten = 8 - sets * 2 - Math.min(pairs, 1);
  }
  
  return Math.max(0, shanten);
}

// テスト
const hand = [
  { type: 'man', number: 1, isRed: false },
  { type: 'man', number: 2, isRed: false },
  { type: 'man', number: 3, isRed: false },
  { type: 'man', number: 6, isRed: false },
  { type: 'man', number: 7, isRed: false },
  { type: 'pin', number: 3, isRed: false },
  { type: 'pin', number: 4, isRed: false },
  { type: 'pin', number: 5, isRed: true },
  { type: 'pin', number: 6, isRed: false },
  { type: 'sou', number: 1, isRed: false },
  { type: 'sou', number: 1, isRed: false },
  { type: 'sou', number: 2, isRed: false },
  { type: 'sou', number: 2, isRed: false }
];

console.log('現在の手牌:', hand);
console.log('現在のシャンテン数:', calculateShanten(hand));

// 8mを追加した場合
const handWith8m = [...hand, { type: 'man', number: 8, isRed: false }];
console.log('8m追加後のシャンテン数:', calculateShanten(handWith8m));

// 手牌の構成を分析
const tileCounts = getTileCounts(hand);
console.log('牌の枚数:', tileCounts);

// 萬子の分析
const manCounts = tileCounts.man;
console.log('萬子の枚数:', manCounts);

// 6m,7mの対子がある場合の8m待ち
console.log('6m枚数:', manCounts[6] || 0);
console.log('7m枚数:', manCounts[7] || 0);
console.log('8m枚数:', manCounts[8] || 0);

// 6m,7m,8mの順子の可能性
const count6 = manCounts[6] || 0;
const count7 = manCounts[7] || 0;
const count8 = manCounts[8] || 0;
const minCount = Math.min(count6, count7, count8);
console.log('6m,7m,8mの順子数:', minCount);
