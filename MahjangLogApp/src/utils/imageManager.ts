import type { Tile, TileType } from '../types/index.js';
import { PlaceholderImageGenerator } from './placeholderImageGenerator.js';

/**
 * 麻雀牌画像管理クラス
 * 静的ファイルから牌画像を取得し、事前読み込みとキャッシュ機能を提供
 */
export class ImageManager {
  private static instance: ImageManager;
  private imageCache: Map<string, string> = new Map();
  private preloadedImages: Map<string, HTMLImageElement> = new Map();
  private preloadPromises: Map<string, Promise<void>> = new Map();

  private constructor() {
    // プライベートコンストラクタでシングルトンパターンを実装
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
    }
    return ImageManager.instance;
  }

  /**
   * 牌の画像URLを取得
   * 通常牌と赤ドラ牌を区別して適切なURLを生成
   */
  public getTileImageUrl(tile: Tile): string {
    const cacheKey = this.generateCacheKey(tile);
    
    // キャッシュから取得を試行
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // 新しいURLを生成
    const imageUrl = this.generateImageUrl(tile);
    
    // キャッシュに保存
    this.imageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
  }

  /**
   * 牌の画像URLを生成
   * 設計書に基づいて適切なファイル名を生成
   */
  private generateImageUrl(tile: Tile): string {
    const { type, number, isRed } = tile;

    // 赤ドラの場合
    if (isRed) {
      return `/images/tiles/${type}_${number}_red.png`;
    }

    // 字牌の場合
    if (type === 'honor') {
      const honorNames = ['', 'east', 'south', 'west', 'north', 'white', 'green', 'red'];
      const honorName = honorNames[number] || `honor_${number}`;
      return `/images/tiles/${honorName}.png`;
    }

    // 数牌の場合（萬子、筒子、索子）
    const typeNames = {
      man: 'man',
      pin: 'pin', 
      sou: 'sou'
    };
    
    return `/images/tiles/${typeNames[type]}_${number}.png`;
  }

  /**
   * キャッシュキーを生成
   */
  private generateCacheKey(tile: Tile): string {
    return `${tile.type}_${tile.number}_${tile.isRed ? 'red' : 'normal'}`;
  }

  /**
   * 指定した牌の画像を事前読み込み
   */
  public async preloadTileImage(tile: Tile): Promise<void> {
    const imageUrl = this.getTileImageUrl(tile);
    const cacheKey = this.generateCacheKey(tile);

    // 既に読み込み済みの場合はスキップ
    if (this.preloadedImages.has(cacheKey)) {
      return Promise.resolve();
    }

    // 既に読み込み中の場合は既存のPromiseを返す
    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey)!;
    }

    // 新しい読み込みPromiseを作成
    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.set(cacheKey, img);
        this.preloadPromises.delete(cacheKey);
        resolve();
      };
      
      img.onerror = () => {
        this.preloadPromises.delete(cacheKey);
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });

    this.preloadPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * 複数の牌画像を並行して事前読み込み
   */
  public async preloadTileImages(tiles: Tile[]): Promise<void> {
    const loadPromises = tiles.map(tile => this.preloadTileImage(tile));
    
    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.warn('Some tile images failed to preload:', error);
      // 一部の画像が読み込めなくても続行
    }
  }

  /**
   * 全ての牌画像を事前読み込み
   * アプリケーション起動時に呼び出すことを想定
   */
  public async preloadAllTileImages(): Promise<void> {
    const allTileTypes: Array<{ type: TileType; numbers: number[]; hasRed: boolean }> = [
      { type: 'man', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], hasRed: true },
      { type: 'pin', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], hasRed: true },
      { type: 'sou', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], hasRed: true },
      { type: 'honor', numbers: [1, 2, 3, 4, 5, 6, 7], hasRed: false }
    ];

    const tilesToPreload: Tile[] = [];

    for (const tileGroup of allTileTypes) {
      for (const number of tileGroup.numbers) {
        // 通常牌
        tilesToPreload.push({
          id: `${tileGroup.type}_${number}`,
          type: tileGroup.type,
          number,
          isRed: false,
          imageUrl: ''
        });

        // 赤ドラ（5の場合のみ）
        if (tileGroup.hasRed && number === 5) {
          tilesToPreload.push({
            id: `${tileGroup.type}_${number}_red`,
            type: tileGroup.type,
            number,
            isRed: true,
            imageUrl: ''
          });
        }
      }
    }

    await this.preloadTileImages(tilesToPreload);
  }

  /**
   * 事前読み込み済みの画像要素を取得
   */
  public getPreloadedImage(tile: Tile): HTMLImageElement | null {
    const cacheKey = this.generateCacheKey(tile);
    return this.preloadedImages.get(cacheKey) || null;
  }

  /**
   * 画像が事前読み込み済みかどうかを確認
   */
  public isImagePreloaded(tile: Tile): boolean {
    const cacheKey = this.generateCacheKey(tile);
    return this.preloadedImages.has(cacheKey);
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    this.imageCache.clear();
    this.preloadedImages.clear();
    this.preloadPromises.clear();
  }

  /**
   * キャッシュサイズを取得（デバッグ用）
   */
  public getCacheInfo(): {
    urlCacheSize: number;
    preloadedImageCount: number;
    pendingPreloads: number;
  } {
    return {
      urlCacheSize: this.imageCache.size,
      preloadedImageCount: this.preloadedImages.size,
      pendingPreloads: this.preloadPromises.size
    };
  }

  /**
   * 画像の存在確認
   * 開発時のデバッグ用
   */
  public async checkImageExists(tile: Tile): Promise<boolean> {
    const imageUrl = this.getTileImageUrl(tile);
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * プレースホルダー画像URLを取得
   * 実際の画像が利用できない場合のフォールバック
   */
  public getPlaceholderImageUrl(tile: Tile): string {
    return PlaceholderImageGenerator.generatePlaceholderDataUrl(tile);
  }
}

// シングルトンインスタンスをエクスポート
export const imageManager = ImageManager.getInstance();