// 牌の種類
export type TileType = 'man' | 'pin' | 'sou' | 'honor';

// 牌の定義
export interface Tile {
  id: string;
  type: TileType;
  number: number;
  isRed: boolean;
  imageUrl: string;
}

// ドラ情報
export interface DoraInfo {
  doraTiles: Tile[];   // ドラ表示牌（最大4枚）
}

// 鳴きの種類
export type MeldType = 'pon' | 'chi' | 'kan';

// 鳴きの方向（誰から鳴いたか）
export type MeldDirection = 'kamicha' | 'toimen' | 'shimocha';

// 槓の種類
export type KanType = 'daiminkan' | 'ankan';

// 鳴きの定義
export interface Meld {
  id: string;
  type: MeldType;
  tiles: Tile[];           // 鳴きに使用した牌
  direction?: MeldDirection; // 鳴きの方向（チー、ポン、大明槓の場合）
  kanType?: KanType;       // 槓の種類（カンの場合）
  timestamp: Date;
}

// 手牌の表現（鳴き対応版）
export interface Hand {
  tiles: Tile[];       // 手牌（14枚から鳴き分を引いた枚数）
  melds: Meld[];       // 鳴き
  doraInfo: DoraInfo;  // ドラ情報
  timestamp: Date;     // 作成日時
}

// 受け入れ牌の情報
export interface AcceptanceTile {
  tile: Tile;          // 受け入れ牌
  count: number;       // 残り枚数
}

// 分析結果
export interface AnalysisResult {
  selectedTile: Tile;           // 選択した牌
  acceptanceTiles: AcceptanceTile[]; // 受け入れ牌一覧
  totalCount: number;           // 総受け入れ枚数
  memo?: string;               // ユーザーメモ
  timestamp: Date;             // 分析日時
}

// ユーザープロフィール
export interface UserProfile {
  uid: string;                 // ユーザーID (Firebase Auth用)
  email: string;               // メールアドレス
  displayName: string;         // 表示名
  createdAt: Date;            // アカウント作成日時
  updatedAt: Date;            // 更新日時
}

// 学習セッション
export interface LearningSession {
  id: string;                   // セッションID（Firestore Document ID）
  userId: string;              // ユーザーID（必須）
  userDisplayName: string;     // 作成者表示名
  title: string;               // タイトル
  hand: Hand;                  // 手牌
  analyses: AnalysisResult[];  // 分析結果一覧
  isPublic: boolean;           // 公開設定（true: Public, false: Private）
  createdAt: Date;            // 作成日時
  updatedAt: Date;            // 更新日時
}

// コメント
export interface Comment {
  id: string;                  // コメントID
  sessionId: string;           // 対象セッションID
  userId: string;              // 投稿者ID
  userDisplayName: string;     // 投稿者表示名
  content: string;             // コメント内容
  createdAt: Date;            // 投稿日時
}