import type { Tile, TileType } from '../types/index.js';

/**
 * プレースホルダー画像生成ユーティリティ
 * 開発時に牌画像がない場合のフォールバック用
 */
export class PlaceholderImageGenerator {
  /**
   * SVGベースのプレースホルダー画像を生成
   */
  public static generatePlaceholderDataUrl(tile: Tile): string {
    const { type, number, isRed } = tile;
    
    // 牌の表示テキストを生成
    const displayText = this.getTileDisplayText(tile);
    
    // 色の設定
    const backgroundColor = isRed ? '#ffebee' : '#ffffff';
    const borderColor = isRed ? '#f44336' : '#333333';
    const textColor = isRed ? '#d32f2f' : '#333333';
    
    // SVGを生成
    const svg = `
      <svg width="64" height="80" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="80" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2" rx="4"/>
        <text x="32" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${textColor}">
          ${displayText}
        </text>
        ${isRed ? '<circle cx="56" cy="8" r="4" fill="#f44336"/>' : ''}
      </svg>
    `;
    
    // Base64エンコード
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * 牌の表示テキストを取得
   */
  private static getTileDisplayText(tile: Tile): string {
    const { type, number } = tile;
    
    if (type === 'honor') {
      const honorNames = ['', '東', '南', '西', '北', '白', '發', '中'];
      return honorNames[number] || `${number}`;
    }
    
    const typeSymbols = {
      man: '萬',
      pin: '筒',
      sou: '索'
    };
    
    return `${number}${typeSymbols[type]}`;
  }

  /**
   * 牌の種類に応じた背景色を取得
   */
  private static getTileBackgroundColor(type: TileType): string {
    switch (type) {
      case 'man': return '#e8f5e8';
      case 'pin': return '#e3f2fd';
      case 'sou': return '#fff3e0';
      case 'honor': return '#f3e5f5';
      default: return '#ffffff';
    }
  }
}