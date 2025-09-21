import React, { useState, useCallback } from 'react';
import type { Tile, Meld, MeldType, AcceptanceTile } from '../../types/index';
import { TileGrid } from './TileGrid';
import { HandDisplay } from './HandDisplay';
import { MeldSelector } from './MeldSelector';
import { tileInitializer } from '../../utils/tileInitializer';
import { AcceptanceCalculator } from '../../utils/acceptanceCalculator';
import { TileImage } from '../TileImage';

/**
 * TileGridコンポーネントのテスト用コンポーネント
 * 牌選択機能と鳴き機能の動作確認用
 */
export const TileGridTest: React.FC = () => {
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [melds, setMelds] = useState<Meld[]>([]);
  const [currentMeldType, setCurrentMeldType] = useState<MeldType | null>(null);
  const [meldTiles, setMeldTiles] = useState<Tile[]>([]);
  const [isHandConfirmed, setIsHandConfirmed] = useState(false);
  const [discardedTile, setDiscardedTile] = useState<Tile | null>(null);
  const [acceptanceTiles, setAcceptanceTiles] = useState<AcceptanceTile[]>([]);

  // 鳴きがある場合の手牌枚数調整
  const adjustedMaxTiles = 14 - (melds.length * 3);

  const handleTileSelect = useCallback((tile: Tile) => {
    if (isHandConfirmed) {
      // 手牌決定後は牌を切る
      setDiscardedTile(tile);
      const acceptance = AcceptanceCalculator.calculateAcceptance(selectedTiles, tile, melds);
      setAcceptanceTiles(acceptance);
      return;
    }

    if (currentMeldType) {
      // 鳴き選択中の場合
      const requiredTiles = currentMeldType === 'chi' ? 3 : 1;
      
      // ポン・カンでは赤ドラを選べない
      if ((currentMeldType === 'pon' || currentMeldType === 'kan') && tile.isRed) {
        return;
      }
      
      // チーの場合は順子かつ同じ牌種の制限
      if (currentMeldType === 'chi') {
        if (meldTiles.length === 0) {
          // 最初の牌は制限なし
          setMeldTiles(prev => [...prev, tile]);
        } else {
          // 2枚目以降は順子かつ同じ牌種の制限
          const firstTile = meldTiles[0];
          
          // 同じ牌種でない場合は選択不可
          if (firstTile.type !== tile.type) {
            return;
          }
          
          // 字牌は順子にならない
          if (tile.type === 'honor') {
            return;
          }
          
          // 既に選択された牌と同じ場合は選択不可
          if (meldTiles.some(selectedTile => 
            selectedTile.type === tile.type && 
            selectedTile.number === tile.number && 
            selectedTile.isRed === tile.isRed
          )) {
            return;
          }
          
          // 順子の制限チェック
          if (meldTiles.length === 1) {
            // 2枚目の場合：1つ違いの牌のみ
            const diff = Math.abs(firstTile.number - tile.number);
            if (diff === 1) {
              setMeldTiles(prev => [...prev, tile]);
            }
          } else if (meldTiles.length === 2) {
            // 3枚目の場合：順子を完成させる牌のみ
            const numbers = [...meldTiles.map(t => t.number), tile.number].sort((a, b) => a - b);
            const isConsecutive = numbers[1] === numbers[0] + 1 && numbers[2] === numbers[1] + 1;
            if (isConsecutive) {
              setMeldTiles(prev => [...prev, tile]);
            }
          }
        }
      } else {
        // ポン・カンの場合
        if (meldTiles.length < requiredTiles) {
          setMeldTiles(prev => [...prev, tile]);
        }
      }
    } else {
      // 通常の手牌選択
      if (selectedTiles.length < adjustedMaxTiles) {
        setSelectedTiles(prev => [...prev, tile]);
      }
    }
  }, [selectedTiles, currentMeldType, meldTiles, adjustedMaxTiles, isHandConfirmed]);

  const handleTileRemove = useCallback((index: number) => {
    setSelectedTiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleMeldStart = useCallback((meldType: MeldType) => {
    setCurrentMeldType(meldType);
    setMeldTiles([]);
  }, []);

  const handleMeldCancel = useCallback(() => {
    setCurrentMeldType(null);
    setMeldTiles([]);
  }, []);

  const handleMeldComplete = useCallback((direction: string, kanType?: string) => {
    if (currentMeldType && meldTiles.length > 0) {
      let meldTilesToAdd: Tile[] = [];
      
      if (currentMeldType === 'pon') {
        // ポンの場合：選択した牌を3枚に複製
        meldTilesToAdd = [meldTiles[0], meldTiles[0], meldTiles[0]];
      } else if (currentMeldType === 'kan') {
        // カンの場合：選択した牌を4枚に複製
        meldTilesToAdd = [meldTiles[0], meldTiles[0], meldTiles[0], meldTiles[0]];
      } else if (currentMeldType === 'chi') {
        // チーの場合：選択した3枚をそのまま使用
        meldTilesToAdd = [...meldTiles];
      }
      
      const newMeld: Meld = {
        id: Date.now().toString(),
        type: currentMeldType,
        tiles: meldTilesToAdd,
        direction: direction as any,
        kanType: kanType as any
      };
      
      setMelds(prev => [...prev, newMeld]);
      setCurrentMeldType(null);
      setMeldTiles([]);
    }
  }, [currentMeldType, meldTiles]);

  const handleMeldTileRemove = useCallback((index: number) => {
    setMeldTiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleMeldRemove = useCallback((meldIndex: number) => {
    setMelds(prev => prev.filter((_, i) => i !== meldIndex));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedTiles([]);
    setMelds([]);
    setCurrentMeldType(null);
    setMeldTiles([]);
    setIsHandConfirmed(false);
    setDiscardedTile(null);
    setAcceptanceTiles([]);
  }, []);

  const isTileSelectable = useCallback((tile: Tile) => {
    if (isHandConfirmed) {
      // 手牌決定後は手牌に含まれる牌のみ選択可能
      return selectedTiles.some(selectedTile => 
        selectedTile.type === tile.type && 
        selectedTile.number === tile.number && 
        selectedTile.isRed === tile.isRed
      );
    }

    if (currentMeldType) {
      const requiredTiles = currentMeldType === 'chi' ? 3 : 1;
      
      // ポン・カンでは赤ドラを選べない
      if ((currentMeldType === 'pon' || currentMeldType === 'kan') && tile.isRed) {
        return false;
      }
      
      // チーの場合の制限
      if (currentMeldType === 'chi') {
        if (meldTiles.length >= requiredTiles) {
          return false;
        }
        
        if (meldTiles.length === 0) {
          // 最初の牌は制限なし（字牌以外）
          return tile.type !== 'honor';
        } else {
          // 2枚目以降は順子かつ同じ牌種の制限
          const firstTile = meldTiles[0];
          
          // 同じ牌種でない場合は選択不可
          if (firstTile.type !== tile.type) {
            return false;
          }
          
          // 字牌は順子にならない
          if (tile.type === 'honor') {
            return false;
          }
          
          // 既に選択された牌と同じ場合は選択不可
          if (meldTiles.some(selectedTile => 
            selectedTile.type === tile.type && 
            selectedTile.number === tile.number && 
            selectedTile.isRed === tile.isRed
          )) {
            return false;
          }
          
          // 順子の制限チェック
          if (meldTiles.length === 1) {
            // 2枚目の場合：1つ違いの牌のみ
            const diff = Math.abs(firstTile.number - tile.number);
            return diff === 1;
          } else if (meldTiles.length === 2) {
            // 3枚目の場合：順子を完成させる牌のみ
            const numbers = [...meldTiles.map(t => t.number), tile.number].sort((a, b) => a - b);
            const isConsecutive = numbers[1] === numbers[0] + 1 && numbers[2] === numbers[1] + 1;
            return isConsecutive;
          }
        }
      } else {
        // ポン・カンの場合（赤ドラ以外）
        return meldTiles.length < requiredTiles;
      }
      
      return true;
    }

    // 通常の手牌選択の制限
    if (selectedTiles.length >= adjustedMaxTiles) {
      return false;
    }

    // 同じ牌の選択数をカウント
    const sameTiles = selectedTiles.filter(selectedTile => 
      selectedTile.type === tile.type && 
      selectedTile.number === tile.number && 
      selectedTile.isRed === tile.isRed
    );

    // 5以外の牌は4枚まで
    if (tile.number !== 5) {
      return sameTiles.length < 4;
    } else {
      // 5の牌の場合
      if (tile.isRed) {
        // 赤ドラ5は1枚まで
        return sameTiles.length < 1;
      } else {
        // 普通の5は3枚まで
        return sameTiles.length < 3;
      }
    }
  }, [selectedTiles, currentMeldType, meldTiles, adjustedMaxTiles, isHandConfirmed]);

  const handleConfirm = useCallback(() => {
    setIsHandConfirmed(true);
    alert(`手牌が確定されました！\n選択された牌: ${selectedTiles.length}枚\n鳴き: ${melds.length}個`);
  }, [selectedTiles, melds]);

  return (
    <div className="space-y-6">
      {/* 手牌表示エリア */}
      <HandDisplay
        selectedTiles={selectedTiles}
        melds={melds}
        onTileRemove={handleTileRemove}
        onMeldRemove={handleMeldRemove}
        maxTiles={14}
        onConfirm={handleConfirm}
        showCount={true}
        showConfirmButton={!isHandConfirmed}
      />

      {/* 手牌決定後の表示 */}
      {isHandConfirmed && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">切った牌と有効牌</h3>
          
          {discardedTile && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">切った牌:</p>
              <div className="flex items-center gap-2">
                <TileImage tile={discardedTile} size="medium" className="w-11 h-14" />
                <span className="text-sm font-medium">
                  {discardedTile.type === 'honor' 
                    ? `字牌${discardedTile.number}` 
                    : `${discardedTile.type}${discardedTile.number}${discardedTile.isRed ? '(赤)' : ''}`
                  }
                </span>
              </div>
            </div>
          )}

          {acceptanceTiles.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">有効牌 ({acceptanceTiles.length}種 {acceptanceTiles.reduce((sum, at) => sum + at.count, 0)}枚):</p>
              <div className="grid grid-cols-8 gap-2">
                {acceptanceTiles.slice(0, 16).map((acceptance, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <TileImage 
                      tile={acceptance.tile} 
                      size="small" 
                      className="w-8 h-10"
                    />
                    <span className="text-xs font-bold text-blue-600">
                      {acceptance.count}枚
                    </span>
                  </div>
                ))}
              </div>
              {acceptanceTiles.length > 16 && (
                <p className="text-xs text-gray-500 mt-2">
                  他 {acceptanceTiles.length - 16} 種類の有効牌があります
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* MeldSelector conditionally rendered */}
      {currentMeldType && (
        <MeldSelector
          meldType={currentMeldType}
          selectedTiles={meldTiles}
          onTileSelect={handleTileSelect}
          onTileRemove={handleMeldTileRemove}
          onMeldComplete={handleMeldComplete}
          onCancel={handleMeldCancel}
        />
      )}

      {/* Meld buttons */}
      {!currentMeldType && !isHandConfirmed && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">鳴き</h3>
          <div className="flex gap-3">
            <button onClick={() => handleMeldStart('pon')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">ポン</button>
            <button onClick={() => handleMeldStart('chi')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">チー</button>
            <button onClick={() => handleMeldStart('kan')} className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors">カン</button>
          </div>
        </div>
      )}

      {/* リセットボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleClearSelection}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          リセット
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">牌選択</h2>
        <TileGrid
          onTileSelect={handleTileSelect}
          selectedTiles={[]}
          disabledTiles={currentMeldType ? [] : tileInitializer.getSelectableTiles().filter(tile => !isTileSelectable(tile))}
          showGroupHeaders={true}
        />
      </div>
    </div>
  );
};

export default TileGridTest;
