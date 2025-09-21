// 現在の計算ロジックをテスト
function removeTileFromHand(hand, tileToRemove) {
  const result = [...hand];
  const index = result.findIndex(tile => 
    tile.type === tileToRemove.type && 
    tile.number === tileToRemove.number && 
    tile.isRed === tileToRemove.isRed
  );
  
  if (index !== -1) {
    result.splice(index, 1);
  }
  
  return result;
}

function calculateEffectiveTiles(hand, targetTile, melds) {
  // 手牌に牌を追加
  const newHand = [...hand, targetTile];
  
  // 同じ牌の枚数をカウント
  const sameTiles = newHand.filter(tile => 
    tile.type === targetTile.type && 
    tile.number === targetTile.number && 
    tile.isRed === targetTile.isRed
  );
  
  // 4枚制限
  if (sameTiles.length > 4) {
    return 0;
  }
  
  // 有効牌かどうかを判定
  let isEffective = false;
  
  // 刻子の可能性（3枚以上）
  if (sameTiles.length >= 3) {
    isEffective = true;
  }
  
  // 順子の可能性（数牌のみ）
  if (targetTile.type !== 'honor' && targetTile.number >= 1 && targetTile.number <= 9) {
    // 前後の牌との順子の可能性
    const prevTile = newHand.find(tile => 
      tile.type === targetTile.type && 
      tile.number === targetTile.number - 1
    );
    const nextTile = newHand.find(tile => 
      tile.type === targetTile.type && 
      tile.number === targetTile.number + 1
    );
    
    if (prevTile && nextTile) {
      isEffective = true;
    }
    
    // 2つ前の牌との順子の可能性
    const prev2Tile = newHand.find(tile => 
      tile.type === targetTile.type && 
      tile.number === targetTile.number - 2
    );
    if (prev2Tile && prevTile) {
      isEffective = true;
    }
    
    // 2つ後の牌との順子の可能性
    const next2Tile = newHand.find(tile => 
      tile.type === targetTile.type && 
      tile.number === targetTile.number + 2
    );
    if (next2Tile && nextTile) {
      isEffective = true;
    }
  }
  
  // 対子の可能性（2枚以上）
  if (sameTiles.length >= 2) {
    isEffective = true;
  }
  
  // 有効牌の場合、その牌が山に残っている枚数を返す
  if (isEffective) {
    // 麻雀では各牌は4枚ずつ存在する
    const totalTiles = 4;
    const usedTiles = sameTiles.length;
    return totalTiles - usedTiles;
  }
  
  return 0;
}

// テスト
const hand = [
  { type: 'man', number: 1, isRed: false },
  { type: 'man', number: 2, isRed: false },
  { type: 'man', number: 3, isRed: false },
  { type: 'man', number: 6, isRed: false },
  { type: 'man', number: 7, isRed: false },
  { type: 'pin', number: 2, isRed: false },
  { type: 'pin', number: 3, isRed: false },
  { type: 'pin', number: 4, isRed: false },
  { type: 'pin', number: 5, isRed: true },
  { type: 'pin', number: 6, isRed: false },
  { type: 'sou', number: 1, isRed: false },
  { type: 'sou', number: 1, isRed: false },
  { type: 'sou', number: 2, isRed: false },
  { type: 'sou', number: 2, isRed: false }
];

const discardedTile = { type: 'pin', number: 2, isRed: false };
const remainingHand = removeTileFromHand(hand, discardedTile);

console.log('残り手牌:', remainingHand);

// 有効牌をテスト
const testTiles = [
  { type: 'man', number: 4, isRed: false },
  { type: 'man', number: 5, isRed: false },
  { type: 'man', number: 8, isRed: false },
  { type: 'sou', number: 1, isRed: false },
  { type: 'sou', number: 2, isRed: false },
  { type: 'pin', number: 2, isRed: false },
  { type: 'pin', number: 7, isRed: false }
];

console.log('\n=== 有効牌テスト ===');
testTiles.forEach(tile => {
  const count = calculateEffectiveTiles(remainingHand, tile, []);
  console.log(`${tile.type}${tile.number}: ${count}枚`);
});
