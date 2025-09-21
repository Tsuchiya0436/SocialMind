import React, { useCallback } from 'react';
import type { Tile, Meld } from '../../types/index';
import { TileImage } from '../TileImage';
import { tileInitializer } from '../../utils/tileInitializer';

interface HandDisplayProps {
  selectedTiles: Tile[];
  melds?: Meld[];
  onTileRemove?: (index: number) => void;
  onMeldRemove?: (index: number) => void;
  maxTiles?: number;
  className?: string;
  showCount?: boolean;
  showConfirmButton?: boolean;
  onConfirm?: () => void;
  isConfirmDisabled?: boolean;
}

/**
 * 選択した手牌と鳴きを表示するコンポーネント
 * 手牌の牌をクリックして削除する機能を実装
 * 残り枚数表示と決定ボタンの状態管理を実装
 */
export const HandDisplay: React.FC<HandDisplayProps> = ({
  selectedTiles,
  melds = [],
  onTileRemove,
  onMeldRemove,
  maxTiles = 14,
  className = '',
  showCount = true,
  showConfirmButton = true,
  onConfirm,
  isConfirmDisabled = false
}) => {
  // 鳴きがある場合の手牌枚数調整
  const adjustedMaxTiles = maxTiles - (melds.length * 3);

  // 牌削除ハンドラ
  const handleTileClick = useCallback((index: number) => {
    if (onTileRemove) {
      onTileRemove(index);
    }
  }, [onTileRemove]);

  // 鳴き削除ハンドラ
  const handleMeldClick = useCallback((index: number) => {
    if (onMeldRemove) {
      onMeldRemove(index);
    }
  }, [onMeldRemove]);

  // 決定ボタンのクリックハンドラ
  const handleConfirm = useCallback(() => {
    if (onConfirm && selectedTiles.length === adjustedMaxTiles) {
      onConfirm();
    }
  }, [onConfirm, selectedTiles.length, adjustedMaxTiles]);

  // 空の牌スロットを生成
  const emptySlots = Math.max(0, adjustedMaxTiles - selectedTiles.length);
  const emptySlotElements = Array.from({ length: emptySlots }, (_, index) => (
    <div
      key={`empty-${index}`}
      className="w-11 h-14 min-w-11 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50"
    >
      <div className="text-gray-400 text-xs">空</div>
    </div>
  ));

  const getMeldTypeName = (type: string): string => {
    switch (type) {
      case 'pon': return 'ポン';
      case 'chi': return 'チー';
      case 'kan': return 'カン';
      default: return type;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          手牌
        </h2>
        {showCount && (
          <div className="text-sm text-gray-600">
            あと {adjustedMaxTiles - selectedTiles.length} 枚選択してください
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* 説明テキスト */}
        <p className="text-sm text-gray-600">
          牌をクリックして削除できます
        </p>
        
        {/* 手牌と鳴きの表示 */}
        <div className="flex items-start gap-4">
          {/* 手牌 */}
          <div className="flex flex-wrap gap-0 p-3 bg-gray-50 rounded-md min-h-20">
            {/* 選択済みの牌 */}
            {selectedTiles.map((tile, index) => (
              <div
                key={`${tile.id}-${index}`}
                className="relative group"
              >
                <TileImage
                  tile={tile}
                  size="medium"
                  onClick={() => handleTileClick(index)}
                  className="
                    cursor-pointer 
                    hover:shadow-lg 
                    hover:scale-105 
                    active:scale-95 
                    transition-all 
                    duration-150
                    group-hover:ring-2 
                    group-hover:ring-red-400 
                    group-hover:ring-offset-1
                  "
                />
                
                {/* 削除アイコン（ホバー時に表示） */}
                <div className="
                  absolute -top-1 -right-1 
                  w-5 h-5 
                  bg-red-500 
                  rounded-full 
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-150
                  pointer-events-none
                ">
                  <svg 
                    className="w-3 h-3 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </div>
              </div>
            ))}
            
            {/* 空のスロット */}
            {emptySlotElements}
          </div>

          {/* 鳴き */}
          {melds.length > 0 && (
            <div className="flex gap-4" style={{ marginTop: '-10px' }}>
              {melds.slice().reverse().map((meld, meldIndex) => (
                <div key={meld.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMeldClick(melds.length - 1 - meldIndex)}
                      className="px-1 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex">
                    {meld.tiles.map((tile, tileIndex) => {
                      let isHorizontal = false;
                      
                      // 方向に応じて牌の向きを決定
                      if (meld.direction) {
                        if (meld.direction === 'kamicha' && tileIndex === 0) {
                          // 上家: 一番左の牌を横に
                          isHorizontal = true;
                        } else if (meld.direction === 'toimen' && tileIndex === 1) {
                          // 対面: 真ん中の牌を横に
                          isHorizontal = true;
                        } else if (meld.direction === 'shimocha' && tileIndex === 2) {
                          // 下家: 一番右の牌を横に
                          isHorizontal = true;
                        }
                      }
                      
                      // カンの場合も横にする
                      if (meld.type === 'kan' && meld.kanType === 'daiminkan') {
                        if (meld.direction === 'kamicha' && tileIndex === 0) {
                          isHorizontal = true;
                        } else if (meld.direction === 'toimen' && tileIndex === 1) {
                          isHorizontal = true;
                        } else if (meld.direction === 'shimocha' && tileIndex === 2) {
                          isHorizontal = true;
                        }
                      }
                      
                      return (
                        <div
                          key={`${tile.id}-${tileIndex}`}
                          className={`${isHorizontal ? 'transform -rotate-90' : ''} flex items-end justify-center`}
                          style={
                            isHorizontal 
                              ? { 
                                  width: '40px', 
                                  height: '56px',
                                  marginTop: '6px'
                                } 
                              : { 
                                  width: '40px', 
                                  height: '56px'
                                }
                          }
                        >
                          <TileImage
                            tile={tile}
                            size="small"
                            className="w-11 h-14"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 決定ボタン */}
        {showConfirmButton && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled || selectedTiles.length !== adjustedMaxTiles}
              className={`
                px-6 py-2 rounded-md font-medium transition-colors
                ${selectedTiles.length === adjustedMaxTiles && !isConfirmDisabled
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              決定
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandDisplay;