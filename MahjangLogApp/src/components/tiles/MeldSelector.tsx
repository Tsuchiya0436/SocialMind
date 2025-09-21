import React, { useState, useCallback } from 'react';
import type { Tile, Meld, MeldType, MeldDirection, KanType } from '../../types/index';
import { TileImage } from '../TileImage';

interface MeldSelectorProps {
  onMeldComplete: (meld: Meld) => void;
  onCancel: () => void;
  meldType: MeldType;
  selectedTiles: Tile[];
  onTileSelect: (tile: Tile) => void;
  onTileRemove: (index: number) => void;
}

export const MeldSelector: React.FC<MeldSelectorProps> = ({
  onMeldComplete,
  onCancel,
  meldType,
  selectedTiles,
  onTileSelect,
  onTileRemove
}) => {
  const [direction, setDirection] = useState<MeldDirection | null>(null);
  const [kanType, setKanType] = useState<KanType | null>(null);

  // ポンとカンは1枚選択、チーは3枚選択
  const requiredTiles = meldType === 'chi' ? 3 : 1;
  const isComplete = selectedTiles.length === requiredTiles && 
    (meldType === 'kan' 
      ? (kanType === 'ankan' || (kanType === 'daiminkan' && direction !== null))
      : meldType === 'pon' 
        ? direction !== null
        : true // チーは方向選択不要
    );

  const handleComplete = useCallback(() => {
    if (isComplete) {
      // ポンとカンの場合、選択した牌を複製して3枚または4枚にする
      let tiles = [...selectedTiles];
      if (meldType === 'pon') {
        // ポンは3枚同じ牌
        tiles = [selectedTiles[0], selectedTiles[0], selectedTiles[0]];
      } else if (meldType === 'kan') {
        // カンは4枚同じ牌
        tiles = [selectedTiles[0], selectedTiles[0], selectedTiles[0], selectedTiles[0]];
      }
      
      const meld: Meld = {
        id: `meld-${Date.now()}`,
        type: meldType,
        tiles: tiles,
        direction: meldType !== 'kan' ? direction! : undefined,
        kanType: meldType === 'kan' ? kanType! : undefined,
        timestamp: new Date()
      };
      onMeldComplete(meld);
    }
  }, [isComplete, meldType, selectedTiles, direction, kanType, onMeldComplete]);

  const getMeldTypeName = (type: MeldType): string => {
    switch (type) {
      case 'pon': return 'ポン';
      case 'chi': return 'チー';
      case 'kan': return 'カン';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {getMeldTypeName(meldType)}を選択
        </h3>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
        >
          キャンセル
        </button>
      </div>

      {/* 選択済み牌表示 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          {meldType === 'chi' 
            ? `${selectedTiles.length} / ${requiredTiles} 枚選択済み`
            : selectedTiles.length > 0 
              ? '牌を選択済み'
              : '牌を選択してください'
          }
        </p>
        <div className="flex flex-wrap gap-0 p-3 bg-gray-50 rounded-md min-h-20">
          {selectedTiles.map((tile, index) => (
            <div
              key={`${tile.id}-${index}`}
              className="relative group"
            >
              <TileImage
                tile={tile}
                size="medium"
                className="w-11 h-14"
              />
              <button
                onClick={() => onTileRemove(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {/* 空のスロット */}
          {Array.from({ length: requiredTiles - selectedTiles.length }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="w-11 h-14 min-w-11 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50"
            >
              <div className="text-gray-400 text-xs">空</div>
            </div>
          ))}
        </div>
      </div>

      {/* 槓の種類選択（カンの場合） */}
      {meldType === 'kan' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">槓の種類</p>
          <div className="flex gap-2">
            <button
              onClick={() => setKanType('daiminkan')}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                kanType === 'daiminkan' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              大明槓
            </button>
            <button
              onClick={() => setKanType('ankan')}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                kanType === 'ankan' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              暗槓
            </button>
          </div>
        </div>
      )}

      {/* 方向選択（ポン、大明槓の場合） */}
      {(meldType === 'pon' || (meldType === 'kan' && kanType === 'daiminkan')) && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">誰から鳴きましたか？</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDirection('kamicha')}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                direction === 'kamicha' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              上家
            </button>
            <button
              onClick={() => setDirection('toimen')}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                direction === 'toimen' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              対面
            </button>
            <button
              onClick={() => setDirection('shimocha')}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                direction === 'shimocha' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              下家
            </button>
          </div>
        </div>
      )}

      {/* 完了ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!isComplete}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${
            isComplete
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {getMeldTypeName(meldType)}を確定
        </button>
      </div>
    </div>
  );
};

export default MeldSelector; 