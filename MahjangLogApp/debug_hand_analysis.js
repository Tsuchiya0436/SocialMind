// 現在の手牌を分析
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

console.log('現在の手牌:', hand);

// 2pを切った場合の手牌
const remainingHand = hand.filter(tile => !(tile.type === 'pin' && tile.number === 2 && !tile.isRed));
console.log('2pを切った後の手牌:', remainingHand);

// 手牌の構成を分析
const handAnalysis = {
  man: remainingHand.filter(t => t.type === 'man').map(t => t.number).sort((a, b) => a - b),
  pin: remainingHand.filter(t => t.type === 'pin').map(t => t.number).sort((a, b) => a - b),
  sou: remainingHand.filter(t => t.type === 'sou').map(t => t.number).sort((a, b) => a - b),
  honor: remainingHand.filter(t => t.type === 'honor').map(t => t.number).sort((a, b) => a - b)
};

console.log('手牌分析:', handAnalysis);

// 有効牌を分析
console.log('\n=== 有効牌分析 ===');

// 萬子の有効牌
console.log('萬子の有効牌:');
const manTiles = handAnalysis.man;
console.log('現在の萬子:', manTiles);

// 1m, 2m, 3m の順子がある
// 6m, 7m の対子がある
// 有効牌: 4m (1m,2m,3m,4mの順子), 5m (4m,5m,6mの順子), 8m (6m,7m,8mの順子)

console.log('4m: 1m,2m,3m,4mの順子');
console.log('5m: 4m,5m,6mの順子'); 
console.log('8m: 6m,7m,8mの順子');

// 索子の有効牌
console.log('\n索子の有効牌:');
const souTiles = handAnalysis.sou;
console.log('現在の索子:', souTiles);

// 1s, 1s の対子がある
// 2s, 2s の対子がある
// 有効牌: 1s (1s,1s,1sの刻子), 2s (2s,2s,2sの刻子)

console.log('1s: 1s,1s,1sの刻子');
console.log('2s: 2s,2s,2sの刻子');

// 筒子の有効牌
console.log('\n筒子の有効牌:');
const pinTiles = handAnalysis.pin;
console.log('現在の筒子:', pinTiles);

// 3p, 4p, 5p(赤), 6p がある
// 有効牌: 2p (2p,3p,4pの順子), 7p (5p,6p,7pの順子)

console.log('2p: 2p,3p,4pの順子');
console.log('7p: 5p,6p,7pの順子');

console.log('\n=== 正しい有効牌 ===');
console.log('4m: 4枚 (山に4枚残っている)');
console.log('5m: 4枚 (山に4枚残っている)');
console.log('8m: 4枚 (山に4枚残っている)');
console.log('1s: 2枚 (手牌に2枚あるので山に2枚残っている)');
console.log('2s: 2枚 (手牌に2枚あるので山に2枚残っている)');
console.log('2p: 3枚 (手牌に1枚あるので山に3枚残っている)');
console.log('7p: 4枚 (山に4枚残っている)');
console.log('合計: 7種23枚');
