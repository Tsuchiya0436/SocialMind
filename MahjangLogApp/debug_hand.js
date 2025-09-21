// デバッグ用：手牌の状況を分析
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

// 2pを切った場合の手牌
const remainingHand = hand.filter(tile => !(tile.type === 'pin' && tile.number === 2 && !tile.isRed));

console.log('残り手牌:', remainingHand);

// 有効牌を分析
const effectiveTiles = [];

// 5mの有効性をチェック
const man5 = { type: 'man', number: 5, isRed: false };
const man5Hand = [...remainingHand, man5];
const man5Count = man5Hand.filter(t => t.type === 'man' && t.number === 5).length;
console.log('5m枚数:', man5Count);

// 8mの有効性をチェック  
const man8 = { type: 'man', number: 8, isRed: false };
const man8Hand = [...remainingHand, man8];
const man8Count = man8Hand.filter(t => t.type === 'man' && t.number === 8).length;
console.log('8m枚数:', man8Count);

// 2sの有効性をチェック
const sou2 = { type: 'sou', number: 2, isRed: false };
const sou2Hand = [...remainingHand, sou2];
const sou2Count = sou2Hand.filter(t => t.type === 'sou' && t.number === 2).length;
console.log('2s枚数:', sou2Count);

// 8sの有効性をチェック
const sou8 = { type: 'sou', number: 8, isRed: false };
const sou8Hand = [...remainingHand, sou8];
const sou8Count = sou8Hand.filter(t => t.type === 'sou' && t.number === 8).length;
console.log('8s枚数:', sou8Count);
