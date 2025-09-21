import type { Tile, AcceptanceTile } from '../types/index';
import { Riichi } from 'riichi-ts';

/**
 * riichi-tsライブラリを使用した有効牌計算
 */
export class AcceptanceCalculator {
  /**
   * 手牌から特定の牌を切った場合のシャンテン数が進む有効牌受け入れ枚数を計算
   */
  static calculateAcceptance(
    hand: Tile[], 
    discardedTile: Tile, 
    melds: any[] = []
  ): AcceptanceTile[] {
    // 切った牌を除いた手牌を作成
    const remainingHand = this.removeTileFromHand(hand, discardedTile);
    
    // 手牌をriichi-ts形式に変換
    const handString = this.convertHandToString(remainingHand);
    
    console.log('Hand string:', handString);
    
    try {
      // riichi-tsでシャンテン数と有効牌を計算
      const riichi = new Riichi(handString);
      const analysis = riichi.analysis();
      
      console.log('Analysis result:', analysis);
      
      // 有効牌をAcceptanceTile形式に変換
      const acceptanceTiles: AcceptanceTile[] = [];
      
      if (analysis.acceptance) {
        console.log('Acceptance:', analysis.acceptance);
        
        for (const [tileString, count] of Object.entries(analysis.acceptance)) {
          console.log('Processing tile:', tileString, 'count:', count);
          
          // 切った牌と同じ牌は除外
          if (this.isSameTileString(tileString, discardedTile)) {
            console.log('Skipping same tile:', tileString);
            continue;
          }
          
          const tile = this.convertStringToTile(tileString);
          if (tile && count > 0) {
            console.log('Adding tile:', tile, 'count:', count + 1);
            acceptanceTiles.push({ tile, count: count + 1 });
          }
        }
      }
      
      console.log('Final acceptance tiles:', acceptanceTiles);
      
      // 有効牌受け入れ枚数でソート（多い順）
      return acceptanceTiles.sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('riichi-ts error:', error);
      console.error('Hand string that caused error:', handString);
      
      // riichi-tsが使えない場合は、簡易的な有効牌計算を実行
      return this.calculateAcceptanceFallback(remainingHand, discardedTile);
    }
  }
  
  /**
   * riichi-tsが使えない場合の簡易的な有効牌計算
   */
  private static calculateAcceptanceFallback(
    hand: Tile[], 
    discardedTile: Tile
  ): AcceptanceTile[] {
    console.log('Using fallback calculation');
    
    const acceptanceTiles: AcceptanceTile[] = [];
    const tileCounts = this.getTileCounts(hand);
    
    // 各牌種・各数字について有効牌を計算
    const tileTypes: Array<'man' | 'pin' | 'sou' | 'honor'> = ['man', 'pin', 'sou', 'honor'];
    
    for (const type of tileTypes) {
      if (type === 'honor') {
        // 字牌の場合
        for (let number = 1; number <= 7; number++) {
          const tile: Tile = {
            id: `${type}-${number}`,
            type: 'honor',
            number,
            isRed: false,
            imageUrl: `/images/tiles/${type}-${number}.png`
          };
          
          // 切った牌と同じ牌は除外
          if (this.isSameTile(tile, discardedTile)) {
            continue;
          }
          
          const count = this.calculateShantenImprovingTiles(hand, tile);
          if (count > 0) {
            acceptanceTiles.push({ tile, count: count + 1 });
          }
        }
      } else {
        // 数牌の場合（赤ドラは除外）
        for (let number = 1; number <= 9; number++) {
          const normalTile: Tile = {
            id: `${type}-${number}`,
            type,
            number,
            isRed: false,
            imageUrl: `/images/tiles/${type}-${number}.png`
          };
          
          // 切った牌と同じ牌は除外
          if (this.isSameTile(normalTile, discardedTile)) {
            continue;
          }
          
          const normalCount = this.calculateShantenImprovingTiles(hand, normalTile);
          if (normalCount > 0) {
            acceptanceTiles.push({ tile: normalTile, count: normalCount + 1 });
          }
        }
      }
    }
    
    return acceptanceTiles.sort((a, b) => b.count - a.count);
  }
  
  /**
   * 簡易的なシャンテン数改善判定
   */
  private static calculateShantenImprovingTiles(hand: Tile[], targetTile: Tile): number {
    const newHand = [...hand, targetTile];
    const tileCounts = this.getTileCounts(newHand);
    
    // 刻子と順子を数える
    let melds = 0;
    let pairs = 0;
    
    for (const type of ['man', 'pin', 'sou', 'honor'] as const) {
      const counts = tileCounts[type];
      
      if (type === 'honor') {
        // 字牌の場合
        for (let i = 1; i <= 7; i++) {
          const count = counts[i] || 0;
          melds += Math.floor(count / 3);
          if (count >= 2) pairs++;
        }
      } else {
        // 数牌の場合
        const tempCounts = { ...counts };
        
        // 刻子を優先
        for (let i = 1; i <= 9; i++) {
          const count = tempCounts[i] || 0;
          const sets = Math.floor(count / 3);
          melds += sets;
          tempCounts[i] = count % 3;
        }
        
        // 順子
        for (let i = 1; i <= 7; i++) {
          const count1 = tempCounts[i] || 0;
          const count2 = tempCounts[i + 1] || 0;
          const count3 = tempCounts[i + 2] || 0;
          const minCount = Math.min(count1, count2, count3);
          melds += minCount;
          tempCounts[i] -= minCount;
          tempCounts[i + 1] -= minCount;
          tempCounts[i + 2] -= minCount;
        }
        
        // 対子
        for (let i = 1; i <= 9; i++) {
          const count = tempCounts[i] || 0;
          if (count >= 2) pairs++;
        }
      }
    }
    
    // シャンテン数が改善されるかチェック
    const currentMelds = this.countMelds(hand);
    const newMelds = melds;
    
    if (newMelds > currentMelds) {
      // 山に残っている枚数を返す
      const sameTiles = newHand.filter(tile => 
        tile.type === targetTile.type && 
        tile.number === targetTile.number && 
        tile.isRed === targetTile.isRed
      );
      
      const totalTiles = 4;
      const usedTiles = sameTiles.length;
      return Math.max(0, totalTiles - usedTiles);
    }
    
    return 0;
  }
  
  /**
   * 手牌の面子数を数える
   */
  private static countMelds(hand: Tile[]): number {
    const tileCounts = this.getTileCounts(hand);
    let melds = 0;
    
    for (const type of ['man', 'pin', 'sou', 'honor'] as const) {
      const counts = tileCounts[type];
      
      if (type === 'honor') {
        for (let i = 1; i <= 7; i++) {
          const count = counts[i] || 0;
          melds += Math.floor(count / 3);
        }
      } else {
        const tempCounts = { ...counts };
        
        // 刻子
        for (let i = 1; i <= 9; i++) {
          const count = tempCounts[i] || 0;
          const sets = Math.floor(count / 3);
          melds += sets;
          tempCounts[i] = count % 3;
        }
        
        // 順子
        for (let i = 1; i <= 7; i++) {
          const count1 = tempCounts[i] || 0;
          const count2 = tempCounts[i + 1] || 0;
          const count3 = tempCounts[i + 2] || 0;
          const minCount = Math.min(count1, count2, count3);
          melds += minCount;
          tempCounts[i] -= minCount;
          tempCounts[i + 1] -= minCount;
          tempCounts[i + 2] -= minCount;
        }
      }
    }
    
    return melds;
  }
  
  /**
   * 手牌をriichi-ts形式の文字列に変換
   */
  private static convertHandToString(hand: Tile[]): string {
    const counts = {
      man: {} as Record<number, number>,
      pin: {} as Record<number, number>,
      sou: {} as Record<number, number>,
      honor: {} as Record<number, number>
    };
    
    hand.forEach(tile => {
      if (!counts[tile.type][tile.number]) {
        counts[tile.type][tile.number] = 0;
      }
      counts[tile.type][tile.number]++;
    });
    
    let result = '';
    
    // マンズ
    let manString = '';
    for (let i = 1; i <= 9; i++) {
      const count = counts.man[i] || 0;
      if (count > 0) {
        manString += i.toString().repeat(count);
      }
    }
    if (manString) result += manString + 'm';
    
    // ピンズ
    let pinString = '';
    for (let i = 1; i <= 9; i++) {
      const count = counts.pin[i] || 0;
      if (count > 0) {
        pinString += i.toString().repeat(count);
      }
    }
    if (pinString) result += pinString + 'p';
    
    // ソーズ
    let souString = '';
    for (let i = 1; i <= 9; i++) {
      const count = counts.sou[i] || 0;
      if (count > 0) {
        souString += i.toString().repeat(count);
      }
    }
    if (souString) result += souString + 's';
    
    // 字牌
    let honorString = '';
    for (let i = 1; i <= 7; i++) {
      const count = counts.honor[i] || 0;
      if (count > 0) {
        honorString += i.toString().repeat(count);
      }
    }
    if (honorString) result += honorString + 'z';
    
    return result;
  }
  
  /**
   * riichi-ts形式の文字列をTileオブジェクトに変換
   */
  private static convertStringToTile(tileString: string): Tile | null {
    const match = tileString.match(/^(\d+)([mpsz])$/);
    if (!match) return null;
    
    const number = parseInt(match[1]);
    const suit = match[2];
    
    let type: 'man' | 'pin' | 'sou' | 'honor';
    switch (suit) {
      case 'm': type = 'man'; break;
      case 'p': type = 'pin'; break;
      case 's': type = 'sou'; break;
      case 'z': type = 'honor'; break;
      default: return null;
    }
    
    return {
      id: `${type}-${number}`,
      type,
      number,
      isRed: false,
      imageUrl: `/images/tiles/${type}-${number}.png`
    };
  }
  
  /**
   * riichi-ts形式の文字列とTileオブジェクトが同じ牌かどうかを判定
   */
  private static isSameTileString(tileString: string, tile: Tile): boolean {
    const convertedTile = this.convertStringToTile(tileString);
    if (!convertedTile) return false;
    
    return convertedTile.type === tile.type && 
           convertedTile.number === tile.number && 
           convertedTile.isRed === tile.isRed;
  }
  
  /**
   * 2つの牌が同じかどうかを判定
   */
  private static isSameTile(tile1: Tile, tile2: Tile): boolean {
    return tile1.type === tile2.type && 
           tile1.number === tile2.number && 
           tile1.isRed === tile2.isRed;
  }
  
  /**
   * 手牌から特定の牌を1枚除去
   */
  private static removeTileFromHand(hand: Tile[], tileToRemove: Tile): Tile[] {
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
  
  /**
   * 牌の枚数をカウント
   */
  private static getTileCounts(hand: Tile[]): Record<string, Record<number, number>> {
    const counts = {
      man: {} as Record<number, number>,
      pin: {} as Record<number, number>,
      sou: {} as Record<number, number>,
      honor: {} as Record<number, number>
    };
    
    hand.forEach(tile => {
      if (!counts[tile.type][tile.number]) {
        counts[tile.type][tile.number] = 0;
      }
      counts[tile.type][tile.number]++;
    });
    
    return counts;
  }
}
