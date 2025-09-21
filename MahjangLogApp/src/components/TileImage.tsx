import React, { useState, useEffect, useCallback } from 'react';
import type { Tile } from '../types/index';
import { imageManager } from '../utils/imageManager';

interface TileImageProps {
  tile: Tile;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: (tile: Tile) => void;
  onError?: (tile: Tile, error: Error) => void;
  alt?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * 麻雀牌画像表示コンポーネント
 * 通常牌と赤ドラ牌を区別して表示し、画像の事前読み込みとエラーハンドリングを提供
 */
export const TileImage: React.FC<TileImageProps> = ({
  tile,
  size = 'medium',
  className = '',
  onClick,
  onError,
  alt,
  loading = 'lazy'
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // サイズに応じたCSSクラス
  const sizeClasses = {
    small: 'w-9 h-12 min-w-9',
    medium: 'w-11 h-14 min-w-11',
    large: 'w-13 h-18 min-w-13'
  };

  // 赤ドラ牌の視覚的強調用クラス
  const redDoraClasses = '';

  // クリック可能な場合のスタイル
  const interactiveClasses = onClick 
    ? 'cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95' 
    : '';

  // 画像URLの取得と設定
  useEffect(() => {
    try {
      // 実際の画像URLを取得して試行
      const url = imageManager.getTileImageUrl(tile);
      console.log(`Generated URL for tile ${tile.type}_${tile.number}${tile.isRed ? '_red' : ''}:`, url);
      
      // 画像の存在確認
      const img = new Image();
      img.onload = () => {
        console.log(`Image preloaded successfully: ${url}`);
        setImageUrl(url);
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        console.log(`Image preload failed: ${url}, using placeholder`);
        const placeholderUrl = imageManager.getPlaceholderImageUrl(tile);
        setImageUrl(placeholderUrl);
        setIsLoading(false);
        setHasError(false);
      };
      
      setIsLoading(true);
      img.src = url;
      
    } catch (error) {
      console.error('Failed to get tile image URL:', error);
      // エラーの場合はプレースホルダーを使用
      const placeholderUrl = imageManager.getPlaceholderImageUrl(tile);
      setImageUrl(placeholderUrl);
      setIsLoading(false);
      setHasError(false);
    }
  }, [tile]);

  // 画像読み込み完了ハンドラ
  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Successfully loaded image: ${imageUrl}`, event.currentTarget.naturalWidth, 'x', event.currentTarget.naturalHeight);
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
  }, [imageUrl]);

  // 画像読み込みエラーハンドラ
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`Failed to load image: ${imageUrl}, switching to placeholder`, event);
    setIsLoading(false);
    
    const error = new Error(`Failed to load tile image: ${imageUrl}`);
    onError?.(tile, error);

    // プレースホルダー画像に切り替え
    const placeholderUrl = imageManager.getPlaceholderImageUrl(tile);
    setImageUrl(placeholderUrl);
    setHasError(false);
  }, [imageUrl, tile, onError]);

  // クリックハンドラ
  const handleClick = useCallback(() => {
    if (onClick && !isLoading && !hasError) {
      onClick(tile);
    }
  }, [onClick, tile, isLoading, hasError]);

  // ALTテキストの生成
  const generateAltText = useCallback((): string => {
    if (alt) return alt;

    const typeNames = {
      man: '萬子',
      pin: '筒子', 
      sou: '索子',
      honor: '字牌'
    };

    const honorNames = ['', '東', '南', '西', '北', '白', '發', '中'];
    
    let baseName = '';
    if (tile.type === 'honor') {
      baseName = honorNames[tile.number] || `字牌${tile.number}`;
    } else {
      baseName = `${tile.number}${typeNames[tile.type]}`;
    }

    return tile.isRed ? `赤${baseName}` : baseName;
  }, [tile, alt]);

  // ローディング表示
  if (isLoading) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          ${className}
          bg-gray-200 
          rounded-md 
          flex 
          items-center 
          justify-center
          animate-pulse
        `}
      >
        <div className="w-4 h-4 bg-gray-400 rounded animate-spin border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  // エラー表示
  if (hasError) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          ${className}
          bg-red-100 
          border-2 
          border-red-300 
          rounded-md 
          flex 
          flex-col
          items-center 
          justify-center
          text-red-600
          ${interactiveClasses}
        `}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        } : undefined}
      >
        <div className="text-xs font-bold">!</div>
        <div className="text-xs">エラー</div>
        {retryCount < 3 && (
          <div className="text-xs mt-1">再試行中...</div>
        )}
      </div>
    );
  }

  // 画像URLが空の場合はローディング表示
  if (!imageUrl) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          ${className}
          bg-gray-200 
          rounded-md 
          flex 
          items-center 
          justify-center
          animate-pulse
        `}
      >
        <div className="w-4 h-4 bg-gray-400 rounded animate-spin border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  // 正常な画像表示
  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${redDoraClasses}
        ${interactiveClasses}
        ${className}
        relative
        rounded-md
        overflow-hidden
        shadow-sm
      `}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      <img
        key={imageUrl}
        src={imageUrl}
        alt={generateAltText()}
        loading="eager"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className="w-full h-full object-contain"
        draggable={false}
      />
      
      {/* 赤ドラ牌の視覚的インジケーター */}
      {tile.isRed && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1" />
      )}
      
      {/* タッチデバイス用のタップ領域確保 */}
      {onClick && (
        <div className="absolute inset-0 min-w-11 min-h-11" />
      )}
    </div>
  );
};

export default TileImage;
