import type { Tile, TileType } from '../types/index.js';

/**
 * 麻雀牌初期化ユーティリティクラス
 * 136枚の麻雀牌データ（赤ドラ3枚含む）を管理
 */
export class TileInitializer {
  private static instance: TileInitializer;
  private allTiles: Tile[] = [];
  private tileDatabase: Map<string, Tile[]> = new Map();

  private constructor() {
    this.initializeAllTiles();
    this.buildTileDatabase();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): TileInitializer {
    if (!TileInitializer.instance) {
      TileInitializer.instance = new TileInitializer();
    }
    return TileInitializer.instance;
  }

  /**
   * 全ての牌（136枚）を初期化
   */
  private initializeAllTiles(): void {
    this.allTiles = [];
    let tileId = 0;

    // 萬子（1-9）×4枚（5mは3枚通常+1枚赤ドラ）
    for (let number = 1; number <= 9; number++) {
      const normalCount = number === 5 ? 3 : 4;
      
      // 通常牌
      for (let i = 0; i < normalCount; i++) {
        this.allTiles.push(this.createTile(
          `man_${number}_${i}`,
          'man',
          number,
          false
        ));
        tileId++;
      }
      
      // 赤ドラ（5mのみ）
      if (number === 5) {
        this.allTiles.push(this.createTile(
          `man_5_red`,
          'man',
          5,
          true
        ));
        tileId++;
      }
    }

    // 筒子（1-9）×4枚（5pは3枚通常+1枚赤ドラ）
    for (let number = 1; number <= 9; number++) {
      const normalCount = number === 5 ? 3 : 4;
      
      // 通常牌
      for (let i = 0; i < normalCount; i++) {
        this.allTiles.push(this.createTile(
          `pin_${number}_${i}`,
          'pin',
          number,
          false
        ));
        tileId++;
      }
      
      // 赤ドラ（5pのみ）
      if (number === 5) {
        this.allTiles.push(this.createTile(
          `pin_5_red`,
          'pin',
          5,
          true
        ));
        tileId++;
      }
    }

    // 索子（1-9）×4枚（5sは3枚通常+1枚赤ドラ）
    for (let number = 1; number <= 9; number++) {
      const normalCount = number === 5 ? 3 : 4;
      
      // 通常牌
      for (let i = 0; i < normalCount; i++) {
        this.allTiles.push(this.createTile(
          `sou_${number}_${i}`,
          'sou',
          number,
          false
        ));
        tileId++;
      }
      
      // 赤ドラ（5sのみ）
      if (number === 5) {
        this.allTiles.push(this.createTile(
          `sou_5_red`,
          'sou',
          5,
          true
        ));
        tileId++;
      }
    }

    // 字牌（東南西北白發中）×4枚
    const honorNumbers = [1, 2, 3, 4, 5, 6, 7]; // 1:東, 2:南, 3:西, 4:北, 5:白, 6:發, 7:中
    for (const number of honorNumbers) {
      for (let i = 0; i < 4; i++) {
        this.allTiles.push(this.createTile(
          `honor_${number}_${i}`,
          'honor',
          number,
          false
        ));
        tileId++;
      }
    }
  }

  /**
   * 牌オブジェクトを作成
   */
  private createTile(id: string, type: TileType, number: number, isRed: boolean): Tile {
    return {
      id,
      type,
      number,
      isRed,
      imageUrl: this.generateImageUrl(type, number, isRed)
    };
  }

  /**
   * 牌の画像URLを生成
   */
  private generateImageUrl(type: TileType, number: number, isRed: boolean): string {
    if (isRed) {
      return `/images/tiles/${type}_${number}_red.png`;
    }
    
    if (type === 'honor') {
      return `/images/tiles/${number}z.png`;
    } else {
      const suffix = type === 'man' ? 'm' : type === 'pin' ? 'p' : 's';
      return `/images/tiles/${number}${suffix}.png`;
    }
  }

  /**
   * 牌データベースを構築（検索用）
   */
  private buildTileDatabase(): void {
    this.tileDatabase.clear();
    
    for (const tile of this.allTiles) {
      const key = this.getTileKey(tile.type, tile.number, tile.isRed);
      
      if (!this.tileDatabase.has(key)) {
        this.tileDatabase.set(key, []);
      }
      
      this.tileDatabase.get(key)!.push(tile);
    }
  }

  /**
   * 牌のキーを生成
   */
  private getTileKey(type: TileType, number: number, isRed: boolean): string {
    return `${type}_${number}_${isRed ? 'red' : 'normal'}`;
  }

  /**
   * 全ての牌を取得（136枚）
   */
  public getAllTiles(): Tile[] {
    return [...this.allTiles];
  }

  /**
   * 指定した条件の牌を取得
   */
  public getTiles(type: TileType, number: number, isRed: boolean = false): Tile[] {
    const key = this.getTileKey(type, number, isRed);
    return this.tileDatabase.get(key) || [];
  }

  /**
   * 特定の牌を1枚取得
   */
  public getTile(type: TileType, number: number, isRed: boolean = false): Tile | null {
    const tiles = this.getTiles(type, number, isRed);
    return tiles.length > 0 ? tiles[0] : null;
  }

  /**
   * 牌の種類別に分類して取得
   */
  public getTilesByType(): Record<TileType, Tile[]> {
    const result: Record<TileType, Tile[]> = {
      man: [],
      pin: [],
      sou: [],
      honor: []
    };

    for (const tile of this.allTiles) {
      result[tile.type].push(tile);
    }

    return result;
  }

  /**
   * 選択可能な牌の一覧を取得（重複なし）
   */
  public getSelectableTiles(): Tile[] {
    const selectableTiles: Tile[] = [];
    const seenKeys = new Set<string>();

    for (const tile of this.allTiles) {
      const key = this.getTileKey(tile.type, tile.number, tile.isRed);
      
      if (!seenKeys.has(key)) {
        selectableTiles.push(tile);
        seenKeys.add(key);
      }
    }

    return selectableTiles;
  }

  /**
   * 牌の残り枚数を計算
   */
  public getRemainingCount(
    targetTile: Tile, 
    usedTiles: Tile[] = []
  ): number {
    const availableTiles = this.getTiles(
      targetTile.type, 
      targetTile.number, 
      targetTile.isRed
    );
    
    const usedCount = usedTiles.filter(tile => 
      this.isSameTile(tile, targetTile)
    ).length;
    
    return Math.max(0, availableTiles.length - usedCount);
  }

  /**
   * 2つの牌が同じかどうかを判定
   */
  public isSameTile(tile1: Tile, tile2: Tile): boolean {
    return tile1.type === tile2.type && 
           tile1.number === tile2.number && 
           tile1.isRed === tile2.isRed;
  }

  /**
   * 牌の文字列表現を取得
   */
  public getTileString(tile: Tile): string {
    const suffix = tile.type === 'man' ? 'm' : 
                   tile.type === 'pin' ? 'p' : 
                   tile.type === 'sou' ? 's' : 'z';
    
    const redSuffix = tile.isRed ? 'r' : '';
    return `${tile.number}${suffix}${redSuffix}`;
  }

  /**
   * 文字列から牌を作成
   */
  public createTileFromString(tileString: string): Tile | null {
    const match = tileString.match(/^(\d)([mpsz])(r?)$/);
    if (!match) return null;

    const [, numberStr, typeChar, redFlag] = match;
    const number = parseInt(numberStr, 10);
    const isRed = redFlag === 'r';
    
    let type: TileType;
    switch (typeChar) {
      case 'm': type = 'man'; break;
      case 'p': type = 'pin'; break;
      case 's': type = 'sou'; break;
      case 'z': type = 'honor'; break;
      default: return null;
    }

    return this.getTile(type, number, isRed);
  }

  /**
   * 牌の総数を取得
   */
  public getTotalTileCount(): number {
    return this.allTiles.length;
  }

  /**
   * 牌の種類数を取得
   */
  public getUniqueTileCount(): number {
    return this.getSelectableTiles().length;
  }
}

// シングルトンインスタンスをエクスポート
export const tileInitializer = TileInitializer.getInstance();