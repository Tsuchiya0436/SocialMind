# 牌画像管理システム

このディレクトリには麻雀牌の画像管理に関するユーティリティが含まれています。

## 主要コンポーネント

### ImageManager クラス
静的ファイルから牌画像を取得し、事前読み込みとブラウザキャッシュ機能を提供するシングルトンクラス。

**主な機能:**
- 牌の種類に応じた適切な画像URLの生成
- 通常牌と赤ドラ牌の区別
- 画像の事前読み込み（プリロード）
- ブラウザキャッシュの活用
- キャッシュ管理とクリア機能

**使用例:**
```typescript
import { imageManager } from '../utils/imageManager';

// 牌の画像URLを取得
const imageUrl = imageManager.getTileImageUrl(tile);

// 画像を事前読み込み
await imageManager.preloadTileImage(tile);

// 全ての牌画像を事前読み込み
await imageManager.preloadAllTileImages();
```

### TileImage コンポーネント
牌画像を表示するReactコンポーネント。レスポンシブデザイン対応。

**主な機能:**
- 通常牌と赤ドラ牌の視覚的区別
- サイズ調整（small, medium, large）
- クリック操作対応（タッチデバイス対応）
- ローディング状態とエラーハンドリング
- プレースホルダー画像への自動フォールバック
- アクセシビリティ対応

**使用例:**
```tsx
import { TileImage } from '../components/TileImage';

<TileImage
  tile={tile}
  size="medium"
  onClick={handleTileClick}
  onError={handleImageError}
/>
```

### useImagePreloader フック
画像の事前読み込みを管理するカスタムフック。

**主な機能:**
- 進行状況の追跡
- エラーハンドリング
- バッチ処理による効率的な読み込み
- キャッシュ情報の取得

**使用例:**
```tsx
import { useImagePreloader } from '../utils/useImagePreloader';

const {
  isPreloading,
  progress,
  preloadAllImages,
  clearCache
} = useImagePreloader({ preloadOnMount: true });
```

### PlaceholderImageGenerator クラス
実際の画像が利用できない場合のプレースホルダー画像を生成。

**主な機能:**
- SVGベースのプレースホルダー生成
- 牌の種類に応じた適切な表示
- 赤ドラ牌の視覚的区別
- Base64エンコードによるデータURL生成

## 画像ファイル構造

```
public/images/tiles/
├── man_1.png ~ man_9.png     # 萬子（通常牌）
├── man_5_red.png             # 5萬（赤ドラ）
├── pin_1.png ~ pin_9.png     # 筒子（通常牌）
├── pin_5_red.png             # 5筒（赤ドラ）
├── sou_1.png ~ sou_9.png     # 索子（通常牌）
├── sou_5_red.png             # 5索（赤ドラ）
├── east.png                  # 東
├── south.png                 # 南
├── west.png                  # 西
├── north.png                 # 北
├── white.png                 # 白
├── green.png                 # 發
└── red.png                   # 中
```

## パフォーマンス最適化

### キャッシュ戦略
1. **URLキャッシュ**: 生成されたURLをメモリにキャッシュ
2. **画像プリロード**: HTMLImageElementを事前作成・キャッシュ
3. **ブラウザキャッシュ**: HTTPキャッシュヘッダーの活用

### 読み込み最適化
1. **バッチ処理**: 同時読み込み数を制限（最大10枚）
2. **遅延読み込み**: 必要に応じた段階的読み込み
3. **エラー処理**: 再試行とフォールバック機能

## 要件との対応

### 要件1.1: 牌の画像表示
- ✅ 全ての麻雀牌の画像を表示
- ✅ 通常牌と赤ドラ牌の区別表示

### 要件1.2: 視覚的な牌選択
- ✅ 牌画像のクリック操作対応
- ✅ タッチデバイス対応（最小44px×44pxのタップ領域）
- ✅ レスポンシブデザイン

## 使用方法

### 基本的な使用方法

1. **アプリケーション起動時**:
```tsx
import { useImagePreloader } from '../utils/useImagePreloader';

function App() {
  const { preloadAllImages } = useImagePreloader({ preloadOnMount: true });
  
  // アプリケーション起動時に全画像を事前読み込み
  useEffect(() => {
    preloadAllImages();
  }, []);
}
```

2. **牌の表示**:
```tsx
import { TileImage } from '../components/TileImage';

function TileSelector({ tiles, onTileSelect }) {
  return (
    <div className="grid grid-cols-10 gap-2">
      {tiles.map(tile => (
        <TileImage
          key={tile.id}
          tile={tile}
          size="medium"
          onClick={onTileSelect}
        />
      ))}
    </div>
  );
}
```

### 開発時のテスト

`ImageManagerTest` コンポーネントを使用して動作確認が可能です:

```tsx
import { ImageManagerTest } from '../components/ImageManagerTest';

// App.tsx などで使用
<ImageManagerTest />
```

## トラブルシューティング

### 画像が表示されない場合
1. `public/images/tiles/` ディレクトリに適切な画像ファイルが配置されているか確認
2. ファイル名が命名規則に従っているか確認
3. プレースホルダー画像が表示される場合は、実際の画像ファイルの問題

### パフォーマンスが悪い場合
1. 事前読み込みが適切に動作しているか確認
2. キャッシュ情報を確認（`getCacheInfo()`）
3. 画像ファイルサイズが適切か確認（推奨: 10KB以下）

### メモリ使用量が多い場合
1. 不要なキャッシュをクリア（`clearCache()`）
2. 事前読み込みする画像数を制限
3. 画像サイズを最適化