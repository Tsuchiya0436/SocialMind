# 麻雀牌画像ディレクトリ

このディレクトリには麻雀牌の画像ファイルを配置します。

## ファイル命名規則

### 数牌（萬子、筒子、索子）

- 通常牌: `{type}_{number}.png`
  - 例: `man_1.png`, `pin_5.png`, `sou_9.png`
- 赤ドラ牌: `{type}_{number}_red.png`
  - 例: `man_5_red.png`, `pin_5_red.png`, `sou_5_red.png`

### 字牌

- `{name}.png`
  - `east.png` (東)
  - `south.png` (南)
  - `west.png` (西)
  - `north.png` (北)
  - `white.png` (白)
  - `green.png` (發)
  - `red.png` (中)

## 必要な画像ファイル一覧

### 萬子 (man)

- man_1.png ~ man_9.png (通常牌)
- man_5_red.png (赤ドラ)

### 筒子 (pin)

- pin_1.png ~ pin_9.png (通常牌)
- pin_5_red.png (赤ドラ)

### 索子 (sou)

- sou_1.png ~ sou_9.png (通常牌)
- sou_5_red.png (赤ドラ)

### 字牌 (honor)

- east.png (東)
- south.png (南)
- west.png (西)
- north.png (北)
- white.png (白)
- green.png (發)
- red.png (中)

## 画像仕様

- 形式: PNG推奨（透明背景対応）
- サイズ: 推奨 64x80px（縦横比 4:5）
- 最適化: WebP形式も対応予定
- ファイルサイズ: 各画像10KB以下推奨

## 使用方法

ImageManagerクラスが自動的に適切な画像ファイルを参照します。
ファイル名は上記の命名規則に従って配置してください。
