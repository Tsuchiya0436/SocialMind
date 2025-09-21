import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { Header } from './components/layout/Header';
import { ImageManagerTest } from './components/ImageManagerTest';
import { TileGridTest } from './components/tiles/TileGridTest';

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🀄 麻雀効率計算アプリ
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                牌選択UIコンポーネントが実装されました！
              </p>
            </div>
            
            {/* 牌選択グリッドのテスト */}
            <TileGridTest />
            
            {/* 画像管理システムのテスト */}
            <div className="mt-8">
              <ImageManagerTest />
            </div>
          </main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}

export default App