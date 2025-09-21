import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 開発時の牌データモデル検証
if (import.meta.env.DEV) {
  import('./utils/tileInitializer').then(({ tileInitializer }) => {
    console.log('🀄 麻雀牌データモデル初期化完了');
    console.log(`総牌数: ${tileInitializer.getTotalTileCount()}枚`);
    console.log(`牌の種類: ${tileInitializer.getUniqueTileCount()}種類`);
    
    // サンプル牌の表示
    const sampleTile = tileInitializer.getTile('man', 1, false);
    if (sampleTile) {
      console.log(`サンプル牌: ${tileInitializer.getTileString(sampleTile)} (${sampleTile.imageUrl})`);
    }
    
    // 赤ドラのテスト
    const redTile = tileInitializer.getTile('man', 5, true);
    if (redTile) {
      console.log(`赤ドラ: ${tileInitializer.getTileString(redTile)} (${redTile.imageUrl})`);
    }
  }).catch(error => {
    console.error('❌ 牌データモデルの初期化に失敗:', error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
