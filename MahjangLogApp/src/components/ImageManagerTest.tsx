import React, { useEffect, useState } from 'react';
import { TileImage } from './TileImage';
import { useImagePreloader } from '../utils/useImagePreloader';
import { tileInitializer } from '../utils/tileInitializer';
import type { Tile } from '../types/index';

/**
 * 画像管理システムのテスト用コンポーネント
 * 開発時の動作確認用
 */
export const ImageManagerTest: React.FC = () => {
  const [testTiles, setTestTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  
  const {
    isPreloading,
    progress,
    errors,
    hasErrors,
    preloadAllImages,
    getCacheInfo,
    clearCache
  } = useImagePreloader();

  // テスト用の牌を準備
  useEffect(() => {
    const tiles: Tile[] = [];
    
    // 各種類から1枚ずつサンプルを取得
    const sampleTiles = [
      tileInitializer.getTile('man', 1, false),
      tileInitializer.getTile('man', 5, false),
      tileInitializer.getTile('man', 5, true), // 赤ドラ
      tileInitializer.getTile('pin', 3, false),
      tileInitializer.getTile('pin', 5, true), // 赤ドラ
      tileInitializer.getTile('sou', 7, false),
      tileInitializer.getTile('sou', 5, true), // 赤ドラ
      tileInitializer.getTile('honor', 1, false), // 東
      tileInitializer.getTile('honor', 5, false), // 白
      tileInitializer.getTile('honor', 7, false), // 中
    ];

    const validTiles = sampleTiles.filter((tile): tile is Tile => tile !== null);
    setTestTiles(validTiles);
  }, []);

  const handleTileClick = (tile: Tile) => {
    setSelectedTile(tile);
  };

  const cacheInfo = getCacheInfo();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">画像管理システムテスト</h2>
      
      {/* 事前読み込み制御 */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">画像事前読み込み</h3>
        
        <div className="flex gap-3 mb-3">
          <button
            onClick={preloadAllImages}
            disabled={isPreloading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isPreloading ? '読み込み中...' : '全画像を事前読み込み'}
          </button>
          
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            キャッシュクリア
          </button>
        </div>

        {isPreloading && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">進行状況: {progress}%</p>
          </div>
        )}

        {hasErrors && (
          <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-red-700 font-semibold">エラーが発生しました:</p>
            <ul className="text-red-600 text-sm mt-1">
              {errors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>URLキャッシュ: {cacheInfo.urlCacheSize}件</p>
          <p>事前読み込み済み画像: {cacheInfo.preloadedImageCount}件</p>
          <p>読み込み中: {cacheInfo.pendingPreloads}件</p>
        </div>
      </div>

      {/* テスト用牌表示 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">サンプル牌（クリックして選択）</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
          {testTiles.map((tile) => (
            <TileImage
              key={tile.id}
              tile={tile}
              size="medium"
              onClick={handleTileClick}
              className={`
                border-2 transition-all duration-200
                ${selectedTile?.id === tile.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onError={(tile, error) => {
                console.error(`Failed to load tile ${tile.id}:`, error);
              }}
            />
          ))}
        </div>
      </div>

      {/* 選択された牌の詳細 */}
      {selectedTile && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">選択された牌</h3>
          <div className="flex items-start gap-4">
            <TileImage
              tile={selectedTile}
              size="large"
              className="border border-gray-300"
            />
            <div className="text-sm">
              <p><strong>ID:</strong> {selectedTile.id}</p>
              <p><strong>種類:</strong> {selectedTile.type}</p>
              <p><strong>数字:</strong> {selectedTile.number}</p>
              <p><strong>赤ドラ:</strong> {selectedTile.isRed ? 'はい' : 'いいえ'}</p>
              <p><strong>画像URL:</strong> {selectedTile.imageUrl}</p>
            </div>
          </div>
        </div>
      )}

      {/* 使用方法の説明 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">⚠️ 注意</h3>
        <p className="text-sm text-gray-700">
          このテストコンポーネントを使用するには、<code>public/images/tiles/</code>
          ディレクトリに適切な牌画像ファイルを配置する必要があります。
          詳細は<code>public/images/tiles/README.md</code>を参照してください。
        </p>
      </div>
    </div>
  );
};

export default ImageManagerTest;