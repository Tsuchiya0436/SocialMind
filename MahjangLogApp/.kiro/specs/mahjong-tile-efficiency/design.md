# 設計書

## 概要

麻雀の牌効率学習アプリケーションは、Webベースのシングルページアプリケーション（SPA）として実装する。ユーザーが手牌を登録し、各牌の受け入れ枚数を計算・表示することで、牌効率の学習を支援する。

## アーキテクチャ

### システム構成

```
Frontend (React/TypeScript)
├── UI Components (レスポンシブデザイン)
├── State Management (Context API)
├── Mahjong Logic Engine
├── Firebase SDK
└── PWA Support

Firebase Backend
├── Firestore Database
├── Authentication
└── Hosting

Static Assets
└── Images (牌画像)
```

Firebase をバックエンドとして使用し、フロントエンドはReact + TypeScriptで構築する。リアルタイムデータ同期、ユーザー認証、ホスティングまでFirebaseで一元管理し、スマートフォンとデスクトップの両方に対応したレスポンシブデザインを採用する。

### 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **状態管理**: React Context API + useReducer
- **スタイリング**: Tailwind CSS v3（レスポンシブデザイン対応、Vite互換性確保）
- **バックエンド**: Firebase
  - **データベース**: Firestore（NoSQL）
  - **認証**: Firebase Authentication
  - **ホスティング**: Firebase Hosting
- **静的アセット**: プロジェクト内imagesフォルダ（牌画像）
- **ビルドツール**: Vite
- **テスト**: Jest + React Testing Library
- **PWA対応**: Service Worker + Web App Manifest（オフライン対応）

## コンポーネントとインターフェース

### 主要コンポーネント

#### 1. App Component

- アプリケーションのルートコンポーネント
- 全体の状態管理とルーティング
- レスポンシブレイアウトの制御

#### 2. TileSelector Component

- 麻雀牌の画像表示と選択機能（タッチ対応）
- 手牌の表示と編集機能
- スマホ向けのスワイプ操作対応

#### 3. HandAnalyzer Component

- 手牌の牌効率分析表示
- 受け入れ牌と枚数の表示
- モバイル向けの縦スクロール対応

#### 4. SessionManager Component

- 学習セッションの保存と読み込み
- タイトル設定とメモ機能
- モバイルキーボード対応

#### 5. HistoryViewer Component

- 過去の学習セッション一覧
- セッション詳細表示
- リスト表示の最適化

#### 6. ResponsiveLayout Component

- デバイス別レイアウト制御
- ブレークポイント管理

### コンポーネント階層

```
App
├── TileSelector
│   ├── TileGrid
│   ├── HandDisplay
│   └── ActionButtons
├── HandAnalyzer
│   ├── SelectedTileDisplay
│   ├── AcceptanceTileList
│   └── MemoInput
├── SessionManager
│   ├── TitleInput
│   └── SaveButton
└── HistoryViewer
    ├── SessionList
    └── SessionDetail
```

## データモデル

### 牌の表現

```typescript
// 牌の種類
type TileType = 'man' | 'pin' | 'sou' | 'honor';

// 牌の定義
interface Tile {
  id: string;          // 一意識別子
  type: TileType;      // 牌の種類
  number: number;      // 数字（字牌の場合は特別な値）
  isRed: boolean;      // 赤ドラかどうか
  imageUrl: string;    // 牌画像のURL
}

// ドラ情報
interface DoraInfo {
  doraTiles: Tile[];   // ドラ表示牌（最大4枚）
}

// 手牌の表現
interface Hand {
  tiles: Tile[];       // 14枚の牌
  doraInfo: DoraInfo;  // ドラ情報
  timestamp: Date;     // 作成日時
}
```

### 分析結果

```typescript
// 受け入れ牌の情報
interface AcceptanceTile {
  tile: Tile;          // 受け入れ牌
  count: number;       // 残り枚数
}

// 分析結果
interface AnalysisResult {
  selectedTile: Tile;           // 選択した牌
  acceptanceTiles: AcceptanceTile[]; // 受け入れ牌一覧
  totalCount: number;           // 総受け入れ枚数
  memo?: string;               // ユーザーメモ
  timestamp: Date;             // 分析日時
}
```

### 学習セッション

```typescript
// ユーザープロフィール
interface UserProfile {
  id: string;                  // ユーザーID
  email: string;               // メールアドレス
  displayName?: string;        // 表示名
  createdAt: Date;            // アカウント作成日時
}

// 学習セッション
interface LearningSession {
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
interface Comment {
  id: string;                  // コメントID
  sessionId: string;           // 対象セッションID
  userId: string;              // 投稿者ID
  userDisplayName: string;     // 投稿者表示名
  content: string;             // コメント内容
  createdAt: Date;            // 投稿日時
}

// Firestoreコレクション構造
interface FirestoreCollections {
  users: UserProfile;          // /users/{userId}
  sessions: LearningSession;   // /sessions/{sessionId}
  comments: Comment;           // /comments/{commentId}
}
```

## 麻雀ロジックエンジン

### 牌効率計算アルゴリズム

#### 1. 牌の定義と初期化

```typescript
class MahjongEngine {
  private allTiles: Tile[];     // 全136枚の牌（赤ドラ含む）
  private tileDatabase: Map<string, Tile>; // 牌の検索用
  
  constructor() {
    this.initializeTiles();
  }
  
  private initializeTiles(): void {
    // 萬子（1-9）×4枚（5mは3枚通常+1枚赤ドラ）
    // 筒子（1-9）×4枚（5pは3枚通常+1枚赤ドラ）
    // 索子（1-9）×4枚（5sは3枚通常+1枚赤ドラ）
    // 字牌（東南西北白發中）×4枚
    // 合計136枚（赤ドラ3枚含む）
  }
  
  getDoraValue(tile: Tile, doraInfo: DoraInfo): number {
    // 通常ドラの計算
    let doraCount = 0;
    
    // ドラ表示牌から実際のドラを計算
    for (const doraTile of doraInfo.doraTiles) {
      const actualDora = this.getNextTile(doraTile);
      if (this.isSameTile(tile, actualDora)) {
        doraCount++;
      }
    }
    
    // 赤ドラの計算
    if (tile.isRed) {
      doraCount++;
    }
    
    return doraCount;
  }
}
```

#### 2. 受け入れ計算

```typescript
interface ShapeAnalysis {
  isComplete: boolean;    // 完成形かどうか
  waitingTiles: Tile[];  // 待ち牌
  shapeType: string;     // 形の種類（順子、刻子など）
}

class EfficiencyCalculator {
  calculateAcceptance(hand: Tile[], discardTile: Tile): AcceptanceTile[] {
    // 1. 指定した牌を手牌から除去
    const remainingHand = this.removeTile(hand, discardTile);
    
    // 2. 13枚の手牌を分析
    const shapes = this.analyzeShapes(remainingHand);
    
    // 3. テンパイになる牌を計算
    const waitingTiles = this.calculateWaitingTiles(shapes);
    
    // 4. 各待ち牌の残り枚数を計算
    return this.calculateRemainingCounts(waitingTiles, hand);
  }
  
  private analyzeShapes(tiles: Tile[]): ShapeAnalysis[] {
    // 面子（順子・刻子）と雀頭の組み合わせを分析
    // 複数の解釈がある場合は全パターンを考慮
  }
  
  private calculateWaitingTiles(shapes: ShapeAnalysis[]): Tile[] {
    // 各形からテンパイになる牌を抽出
    // 重複を除去して返す
  }
}
```

#### 3. 牌の画像管理

```typescript
class TileImageManager {
  private imageCache: Map<string, string> = new Map();
  
  getTileImageUrl(tile: Tile): string {
    const key = `${tile.type}_${tile.number}`;
    return this.imageCache.get(key) || this.generateImageUrl(tile);
  }
  
  private generateImageUrl(tile: Tile): string {
    // 牌の種類と数字から画像URLを生成
    return `/images/tiles/${tile.type}/${tile.number}.png`;
  }
  
  preloadImages(): Promise<void> {
    // 全ての牌画像を事前読み込み
  }
}
```

## エラーハンドリング

### エラーの種類

1. **入力エラー**
   - 不正な牌の選択
   - 手牌の枚数不足/過多

2. **計算エラー**
   - 牌効率計算の失敗
   - 不正な手牌構成

3. **保存エラー**
   - LocalStorage容量不足
   - データの破損

### エラーハンドリング戦略

```typescript
class ErrorHandler {
  handleError(error: Error, context: string): void {
    console.error(`Error in ${context}:`, error);
    
    // ユーザーフレンドリーなメッセージを表示
    this.showUserMessage(this.getErrorMessage(error));
    
    // 必要に応じて状態をリセット
    if (this.isCriticalError(error)) {
      this.resetApplicationState();
    }
  }
  
  private getErrorMessage(error: Error): string {
    // エラーの種類に応じた日本語メッセージを返す
  }
}
```

## テスト戦略

### テストの種類

1. **単体テスト**
   - 麻雀ロジックエンジンの各関数
   - データモデルの検証
   - ユーティリティ関数

2. **統合テスト**
   - コンポーネント間の連携
   - 状態管理の動作
   - LocalStorageとの連携

3. **E2Eテスト**
   - ユーザーシナリオの実行
   - 画面遷移の確認

### テスト実装例

```typescript
describe('MahjongEngine', () => {
  let engine: MahjongEngine;
  
  beforeEach(() => {
    engine = new MahjongEngine();
  });
  
  test('should calculate correct acceptance tiles', () => {
    const hand = createTestHand([
      '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
      '1p', '1p', '1p', '2p', '3p'
    ]);
    
    const result = engine.calculateAcceptance(hand, getTile('9m'));
    
    expect(result).toHaveLength(2);
    expect(result[0].tile.number).toBe(1);
    expect(result[0].tile.type).toBe('p');
    expect(result[0].count).toBe(1);
  });
});
```

## Firebase設計

### Firestore データ構造

```typescript
// コレクション: sessions
{
  "sessions": {
    "{sessionId}": {
      "userId": "string | null",      // 匿名利用時はnull
      "title": "string",
      "hand": {
        "tiles": [...],
        "doraInfo": {...},
        "timestamp": "Timestamp"
      },
      "analyses": [...],
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp"
    }
  }
}
```

### セキュリティルール

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザープロフィール
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 学習セッション
    match /sessions/{sessionId} {
      // 作成者は常に読み書き可能
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // 公開セッションは全ログインユーザーが読み取り可能
      allow read: if request.auth != null && 
        resource.data.isPublic == true;
      
      // 新規作成時の検証
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // コメント
    match /comments/{commentId} {
      // 全ログインユーザーがコメント読み取り可能
      allow read: if request.auth != null;
      
      // コメント投稿者のみ削除可能
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // 新規コメント作成時の検証
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId &&
        // 対象セッションが公開されているかチェック
        exists(/databases/$(database)/documents/sessions/$(request.resource.data.sessionId)) &&
        get(/databases/$(database)/documents/sessions/$(request.resource.data.sessionId)).data.isPublic == true;
    }
  }
}
```

### Firebase機能活用

1. **リアルタイム同期**: デバイス間でのセッション同期
2. **オフライン対応**: Firestoreの自動キャッシュ機能
3. **認証**: メール/パスワード認証、Google認証
4. **セキュリティ**: Firestoreルールによる適切なアクセス制御
5. **ホスティング**: PWAの高速配信（静的画像含む）

### 認証フロー

```typescript
// 認証サービス
class AuthService {
  async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // ユーザープロフィールを作成
    const userProfile: UserProfile = {
      id: user.uid,
      email: user.email!,
      displayName,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  }
  
  async signIn(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userDoc.data() as UserProfile;
  }
}

// コメントサービス
class CommentService {
  async addComment(sessionId: string, content: string, user: UserProfile): Promise<string> {
    const comment: Omit<Comment, 'id'> = {
      sessionId,
      userId: user.id,
      userDisplayName: user.displayName || user.email,
      content,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'comments'), comment);
    return docRef.id;
  }
  
  async getComments(sessionId: string): Promise<Comment[]> {
    const q = query(
      collection(db, 'comments'),
      where('sessionId', '==', sessionId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
  }
  
  async deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'comments', commentId));
  }
}
```

## レスポンシブデザイン仕様

### ブレークポイント

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px以上

### モバイル最適化

- **タッチ操作**: 最小タップ領域44px×44px
- **牌サイズ**: 画面幅に応じて動的調整
- **レイアウト**: 縦スクロール中心の設計
- **キーボード**: 仮想キーボード表示時のレイアウト調整

## パフォーマンス考慮事項

### 最適化戦略

1. **画像の最適化**
   - 牌画像の事前読み込み
   - 画像サイズの最適化（モバイル向け軽量化）
   - WebP形式の使用
   - レスポンシブ画像（srcset対応）

2. **計算の最適化**
   - 牌効率計算結果のキャッシュ
   - 不要な再計算の回避
   - Web Workerでの重い計算処理

3. **メモリ管理**
   - 不要なデータの適切な破棄
   - LocalStorageの容量管理
   - モバイルデバイスのメモリ制限考慮

4. **モバイル最適化**
   - 遅延読み込み（Lazy Loading）
   - タッチイベントの最適化
   - バッテリー消費の最小化

### Firebase実装例

```typescript
// Firebase設定
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // 設定値
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 牌画像管理（静的ファイル）
class TileImageManager {
  getTileImageUrl(tile: Tile): string {
    const fileName = tile.isRed ? `${tile.type}_${tile.number}_red` : `${tile.type}_${tile.number}`;
    return `/images/tiles/${fileName}.png`;
  }
}

// セッション管理サービス
class SessionService {
  async saveSession(session: LearningSession): Promise<string> {
    const docRef = await addDoc(collection(db, 'sessions'), {
      ...session,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
  
  async loadSessions(userId?: string): Promise<LearningSession[]> {
    const q = userId 
      ? query(collection(db, 'sessions'), where('userId', '==', userId))
      : query(collection(db, 'sessions'), where('userId', '==', null));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LearningSession));
  }
}

// パフォーマンス最適化
class PerformanceOptimizer {
  private calculationCache = new Map<string, AcceptanceTile[]>();
  
  getCachedResult(hand: Tile[], discardTile: Tile): AcceptanceTile[] | null {
    const key = this.generateCacheKey(hand, discardTile);
    return this.calculationCache.get(key) || null;
  }
  
  setCachedResult(hand: Tile[], discardTile: Tile, result: AcceptanceTile[]): void {
    const key = this.generateCacheKey(hand, discardTile);
    this.calculationCache.set(key, result);
    
    // キャッシュサイズの制限
    if (this.calculationCache.size > 1000) {
      this.clearOldCache();
    }
  }
}
```