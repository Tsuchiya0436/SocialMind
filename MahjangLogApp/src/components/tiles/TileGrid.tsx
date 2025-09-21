import React, { useMemo, useCallback } from 'react';
import type { Tile, TileType } from '../../types/index';
import { TileImage } from '../TileImage';
import { tileInitializer } from '../../utils/tileInitializer';

interface TileGridProps {
  onTileSelect?: (tile: Tile) => void;
  selectedTiles?: Tile[];
  disabledTiles?: Tile[];
  className?: string;
  showGroupHeaders?: boolean;
}

/**
 * 麻雀牌グリッド表示コンポーネント
 * 全ての麻雀牌を種類別にグリッド表示し、タッチ操作に対応
 * レスポンシブデザインでモバイル・デスクトップ両対応
 */
export const TileGrid: React.FC<TileGridProps> = ({
  onTileSelect,
  selectedTiles = [],
  disabledTiles = [],
  className = '',
  showGroupHeaders = true
}) => {
  // 選択可能な牌を種類別に取得
  const tilesByType = useMemo(() => {
    const selectableTiles = tileInitializer.getSelectableTiles();
    const grouped: Record<TileType, Tile[]> = {
      man: [],
      pin: [],
      sou: [],
      honor: []
    };

    selectableTiles.forEach(tile => {
      grouped[tile.type].push(tile);
    });

    // 各グループ内で番号順にソート
    Object.keys(grouped).forEach(type => {
      grouped[type as TileType].sort((a, b) => {
        if (a.number !== b.number) {
          return a.number - b.number;
        }
        // 同じ番号の場合、通常牌を先に表示
        return a.isRed ? 1 : -1;
      });
    });

    return grouped;
  }, []);

  // 牌が選択済みかどうかを判定
  const isTileSelected = useCallback((tile: Tile): boolean => {
    return selectedTiles.some(selectedTile => 
      tileInitializer.isSameTile(tile, selectedTile)
    );
  }, [selectedTiles]);

  // 牌が無効化されているかどうかを判定
  const isTileDisabled = useCallback((tile: Tile): boolean => {
    return disabledTiles.some(disabledTile => 
      tileInitializer.isSameTile(tile, disabledTile)
    );
  }, [disabledTiles]);

  // 牌クリックハンドラ
  const handleTileClick = useCallback((tile: Tile) => {
    if (!isTileDisabled(tile) && onTileSelect) {
      onTileSelect(tile);
    }
  }, [onTileSelect, isTileDisabled]);

  // 種類名の表示用マッピング
  const typeDisplayNames: Record<TileType, string> = {
    man: '萬子 (マンズ)',
    pin: '筒子 (ピンズ)',
    sou: '索子 (ソーズ)',
    honor: '字牌 (ジハイ)'
  };

  // 牌グループのレンダリング
  const renderTileGroup = (type: TileType, tiles: Tile[]) => (
    <div key={type} className="mb-6">
      {showGroupHeaders && (
        <h3 className="text-sm font-semibold text-gray-700 mb-3 px-2">
          {typeDisplayNames[type]}
        </h3>
      )}
      <div className="grid grid-cols-12 sm:grid-cols-12 md:grid-cols-12 lg:grid-cols-12 gap-0 sm:gap-0">
        {tiles.map((tile) => {
          const isSelected = isTileSelected(tile);
          const isDisabled = isTileDisabled(tile);
          
          return (
            <div
              key={tile.id}
              className={`
                relative -mx-1
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 rounded-md' : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${!isDisabled && onTileSelect ? 'cursor-pointer' : ''}
              `}
            >
              <TileImage
                tile={tile}
                size="medium"
                onClick={!isDisabled ? handleTileClick : undefined}
                className={`
                  w-full
                  min-w-10 min-h-12
                  touch-manipulation
                  ${isSelected ? 'transform scale-95' : ''}
                  ${isDisabled ? 'opacity-50' : ''}
                  ${!isDisabled && onTileSelect ? 'hover:shadow-md active:scale-90' : ''}
                  transition-all duration-150
                `}
              />
              
              {/* 選択状態のインジケーター */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-2.5 h-2.5 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              )}
              
              {/* 無効化状態のオーバーレイを削除 */}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-4">
        {/* 数牌（萬子、筒子、索子） */}
        {(['man', 'pin', 'sou'] as TileType[]).map(type => 
          renderTileGroup(type, tilesByType[type])
        )}
        
        {/* 字牌 */}
        {renderTileGroup('honor', tilesByType.honor)}
      </div>
      
      {/* タッチデバイス用の説明テキスト */}
      <div className="mt-6 text-center text-sm text-gray-500 sm:hidden">
        牌をタップして選択してください
      </div>
      
      {/* デスクトップ用の説明テキスト */}
      <div className="mt-6 text-center text-sm text-gray-500 hidden sm:block">
        牌をクリックして選択してください
      </div>
    </div>
  );
};

export default TileGrid;