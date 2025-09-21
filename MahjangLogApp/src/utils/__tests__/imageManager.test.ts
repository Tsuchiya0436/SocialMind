import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageManager } from '../imageManager';
import type { Tile } from '../../types/index.js';

// モック用のHTMLImageElementを作成
class MockImage {
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    // srcが設定されたら非同期でonloadを呼び出す
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 10);
  }
}

// グローバルのImageをモック
global.Image = MockImage as any;

describe('ImageManager', () => {
  let imageManager: ImageManager;

  beforeEach(() => {
    // 新しいインスタンスを作成（テスト用）
    imageManager = (ImageManager as any).instance = new (ImageManager as any)();
  });

  describe('getTileImageUrl', () => {
    it('should generate correct URL for normal man tile', () => {
      const tile: Tile = {
        id: 'man_1_0',
        type: 'man',
        number: 1,
        isRed: false,
        imageUrl: ''
      };

      const url = imageManager.getTileImageUrl(tile);
      expect(url).toBe('/images/tiles/man_1.png');
    });

    it('should generate correct URL for red dora tile', () => {
      const tile: Tile = {
        id: 'man_5_red',
        type: 'man',
        number: 5,
        isRed: true,
        imageUrl: ''
      };

      const url = imageManager.getTileImageUrl(tile);
      expect(url).toBe('/images/tiles/man_5_red.png');
    });

    it('should generate correct URL for honor tile', () => {
      const tile: Tile = {
        id: 'honor_1_0',
        type: 'honor',
        number: 1,
        isRed: false,
        imageUrl: ''
      };

      const url = imageManager.getTileImageUrl(tile);
      expect(url).toBe('/images/tiles/east.png');
    });

    it('should cache generated URLs', () => {
      const tile: Tile = {
        id: 'pin_3_0',
        type: 'pin',
        number: 3,
        isRed: false,
        imageUrl: ''
      };

      const url1 = imageManager.getTileImageUrl(tile);
      const url2 = imageManager.getTileImageUrl(tile);

      expect(url1).toBe(url2);
      expect(url1).toBe('/images/tiles/pin_3.png');
    });
  });

  describe('preloadTileImage', () => {
    it('should preload tile image successfully', async () => {
      const tile: Tile = {
        id: 'sou_7_0',
        type: 'sou',
        number: 7,
        isRed: false,
        imageUrl: ''
      };

      await expect(imageManager.preloadTileImage(tile)).resolves.toBeUndefined();
      expect(imageManager.isImagePreloaded(tile)).toBe(true);
    });

    it('should not preload same image twice', async () => {
      const tile: Tile = {
        id: 'sou_7_0',
        type: 'sou',
        number: 7,
        isRed: false,
        imageUrl: ''
      };

      await imageManager.preloadTileImage(tile);
      const promise1 = imageManager.preloadTileImage(tile);
      const promise2 = imageManager.preloadTileImage(tile);

      // 同じPromiseインスタンスが返されるはず
      expect(promise1).toBe(promise2);
    });
  });

  describe('cache management', () => {
    it('should provide cache information', () => {
      const info = imageManager.getCacheInfo();
      
      expect(info).toHaveProperty('urlCacheSize');
      expect(info).toHaveProperty('preloadedImageCount');
      expect(info).toHaveProperty('pendingPreloads');
      expect(typeof info.urlCacheSize).toBe('number');
      expect(typeof info.preloadedImageCount).toBe('number');
      expect(typeof info.pendingPreloads).toBe('number');
    });

    it('should clear cache correctly', () => {
      const tile: Tile = {
        id: 'test_tile',
        type: 'man',
        number: 1,
        isRed: false,
        imageUrl: ''
      };

      // キャッシュに何かを追加
      imageManager.getTileImageUrl(tile);
      
      // キャッシュをクリア
      imageManager.clearCache();
      
      const info = imageManager.getCacheInfo();
      expect(info.urlCacheSize).toBe(0);
      expect(info.preloadedImageCount).toBe(0);
      expect(info.pendingPreloads).toBe(0);
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = ImageManager.getInstance();
      const instance2 = ImageManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});