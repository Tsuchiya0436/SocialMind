// スライド判定をデバッグ
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

function isSlideTile(hand, targetTile) {
  // 数牌のみチェック
  if (targetTile.type === 'honor') {
    return false;
  }
  
  // 手牌に牌を追加
  const newHand = [...hand, targetTile];
  const tileCounts = getTileCounts(newHand);
  const counts = tileCounts[targetTile.type];
  
  const targetNumber = targetTile.number;
  
  console.log(`\n=== ${targetTile.type}${targetNumber}のスライド判定 ===`);
  console.log('手牌:', newHand.filter(t => t.type === targetTile.type).map(t => t.number).sort());
  console.log('牌の枚数:', counts);
  
  // 前後の牌との順子の可能性をチェック
  const prevTile = newHand.find(tile => 
    tile.type === targetTile.type && 
    tile.number === targetNumber - 1
  );
  const nextTile = newHand.find(tile => 
    tile.type === targetTile.type && 
    tile.number === targetNumber + 1
  );
  
  console.log(`前の牌(${targetNumber - 1}):`, prevTile ? 'あり' : 'なし');
  console.log(`後の牌(${targetNumber + 1}):`, nextTile ? 'あり' : 'なし');
  
  // 前後の牌がある場合、スライドの可能性
  if (prevTile && nextTile) {
    console.log('前後の牌があるためスライド');
    return true;
  }
  
  // 2つ前の牌との順子の可能性をチェック
  const prev2Tile = newHand.find(tile => 
    tile.type === targetTile.type && 
    tile.number === targetNumber - 2
  );
  if (prev2Tile && prevTile) {
    console.log('2つ前の牌との順子のためスライド');
    return true;
  }
  
  // 2つ後の牌との順子の可能性をチェック
  const next2Tile = newHand.find(tile => 
    tile.type === targetTile.type && 
    tile.number === targetNumber + 2
  );
  if (next2Tile && nextTile) {
    console.log('2つ後の牌との順子のためスライド');
    return true;
  }
  
  console.log('スライドではない');
  return false;
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

// 8mのスライド判定をテスト
const tile8m = { type: 'man', number: 8, isRed: false };
const isSlide = isSlideTile(hand, tile8m);
console.log(`\n8mはスライド: ${isSlide}`);

// 5mのスライド判定をテスト
const tile5m = { type: 'man', number: 5, isRed: false };
const isSlide5m = isSlideTile(hand, tile5m);
console.log(`\n5mはスライド: ${isSlide5m}`);
