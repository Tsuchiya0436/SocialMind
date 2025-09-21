import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
  const { currentUser, userProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              🀄 麻雀効率計算アプリ
            </h1>
          </div>

          {/* ユーザー情報とログアウト */}
          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">
                    {userProfile?.displayName || currentUser.displayName || 'ユーザー'}
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({currentUser.email})
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'ログアウト中...' : 'ログアウト'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};