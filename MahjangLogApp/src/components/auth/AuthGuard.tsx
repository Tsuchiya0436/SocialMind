import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthContainer } from './AuthContainer';
import { AuthService } from '../../services/authService';
import { useState } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 開発時は認証をスキップ
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }

  // ログイン処理
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      await AuthService.signIn(email, password);
    } catch (error: any) {
      setError(AuthService.getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // サインアップ処理
  const handleSignup = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      await AuthService.signUp(email, password, displayName);
    } catch (error: any) {
      setError(AuthService.getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // 未ログインの場合は認証画面を表示
  if (!currentUser) {
    return (
      <AuthContainer
        onLogin={handleLogin}
        onSignup={handleSignup}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // ログイン済みの場合は子コンポーネントを表示
  return <>{children}</>;
};