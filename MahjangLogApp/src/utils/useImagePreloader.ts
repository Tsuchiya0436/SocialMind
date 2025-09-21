import { useState, useEffect, useCallback } from 'react';
import type { Tile } from '../types/index.js';
import { imageManager } from './imageManager.js';

interface UseImagePreloaderOptions {
  preloadOnMount?: boolean;
  tiles?: Tile[];
}

interface ImagePreloaderState {
  isPreloading: boolean;
  preloadedCount: number;
  totalCount: number;
  errors: Error[];
  progress: number; // 0-100
}

/**
 * 画像事前読み込み管理用カスタムフック
 * アプリケーション起動時や特定のタイミングで牌画像を事前読み込み
 */
export const useImagePreloader = (options: UseImagePreloaderOptions = {}) => {
  const { preloadOnMount = false, tiles } = options;
  
  const [state, setState] = useState<ImagePreloaderState>({
    isPreloading: false,
    preloadedCount: 0,
    totalCount: 0,
    errors: [],
    progress: 0
  });

  // 全ての牌画像を事前読み込み
  const preloadAllImages = useCallback(async (): Promise<void> => {
    setState(prev => ({
      ...prev,
      isPreloading: true,
      preloadedCount: 0,
      errors: [],
      progress: 0
    }));

    try {
      await imageManager.preloadAllTileImages();
      
      setState(prev => ({
        ...prev,
        isPreloading: false,
        progress: 100
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isPreloading: false,
        errors: [...prev.errors, error as Error]
      }));
    }
  }, []);

  // 指定した牌の画像を事前読み込み
  const preloadImages = useCallback(async (tilesToPreload: Tile[]): Promise<void> => {
    if (tilesToPreload.length === 0) return;

    setState(prev => ({
      ...prev,
      isPreloading: true,
      preloadedCount: 0,
      totalCount: tilesToPreload.length,
      errors: [],
      progress: 0
    }));

    const errors: Error[] = [];
    let preloadedCount = 0;

    // 並行読み込みを制限（同時に最大10枚まで）
    const batchSize = 10;
    for (let i = 0; i < tilesToPreload.length; i += batchSize) {
      const batch = tilesToPreload.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (tile) => {
        try {
          await imageManager.preloadTileImage(tile);
          preloadedCount++;
          
          setState(prev => ({
            ...prev,
            preloadedCount,
            progress: Math.round((preloadedCount / tilesToPreload.length) * 100)
          }));
        } catch (error) {
          errors.push(error as Error);
        }
      });

      await Promise.allSettled(batchPromises);
    }

    setState(prev => ({
      ...prev,
      isPreloading: false,
      errors,
      preloadedCount,
      progress: 100
    }));
  }, []);

  // 単一の牌画像を事前読み込み
  const preloadImage = useCallback(async (tile: Tile): Promise<void> => {
    try {
      await imageManager.preloadTileImage(tile);
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: [...prev.errors, error as Error]
      }));
    }
  }, []);

  // 画像が事前読み込み済みかチェック
  const isImagePreloaded = useCallback((tile: Tile): boolean => {
    return imageManager.isImagePreloaded(tile);
  }, []);

  // キャッシュ情報を取得
  const getCacheInfo = useCallback(() => {
    return imageManager.getCacheInfo();
  }, []);

  // キャッシュをクリア
  const clearCache = useCallback(() => {
    imageManager.clearCache();
    setState({
      isPreloading: false,
      preloadedCount: 0,
      totalCount: 0,
      errors: [],
      progress: 0
    });
  }, []);

  // マウント時の自動事前読み込み
  useEffect(() => {
    if (preloadOnMount) {
      if (tiles && tiles.length > 0) {
        preloadImages(tiles);
      } else {
        preloadAllImages();
      }
    }
  }, [preloadOnMount, tiles, preloadImages, preloadAllImages]);

  return {
    // 状態
    ...state,
    
    // アクション
    preloadAllImages,
    preloadImages,
    preloadImage,
    
    // ユーティリティ
    isImagePreloaded,
    getCacheInfo,
    clearCache,
    
    // 便利なフラグ
    isComplete: !state.isPreloading && state.progress === 100,
    hasErrors: state.errors.length > 0
  };
};