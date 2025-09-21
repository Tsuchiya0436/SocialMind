import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/authService';
import type { UserProfile } from '../types/index';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // 開発時は認証を無効化

  // サインアップ
  const signUp = async (email: string, password: string, displayName: string) => {
    await AuthService.signUp(email, password, displayName);
  };

  // ログイン
  const signIn = async (email: string, password: string) => {
    await AuthService.signIn(email, password);
  };

  // ログアウト
  const signOut = async () => {
    await AuthService.signOut();
    setUserProfile(null);
  };

  // ユーザープロフィール読み込み
  const loadUserProfile = async (user: User) => {
    try {
      const profile = await AuthService.getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('ユーザープロフィール読み込みエラー:', error);
    }
  };

  // 認証状態の監視（開発時は無効化）
  useEffect(() => {
    // 開発時はFirebase認証をスキップ
    if (import.meta.env.DEV) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};