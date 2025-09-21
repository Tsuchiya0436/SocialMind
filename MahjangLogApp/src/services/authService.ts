import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserProfile } from '../types/index';

export class AuthService {
  // メール/パスワードでサインアップ
  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      // Firebase Authenticationでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // プロフィール更新
      await updateProfile(user, { displayName });

      // Firestoreにユーザープロフィール保存
      await AuthService.saveUserProfile(user, displayName);

      return user;
    } catch (error) {
      console.error('サインアップエラー:', error);
      throw error;
    }
  }

  // メール/パスワードでログイン
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  }

  // ログアウト
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  }

  // Firestoreにユーザープロフィール保存
  static async saveUserProfile(user: User, displayName: string): Promise<void> {
    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
    } catch (error) {
      console.error('ユーザープロフィール保存エラー:', error);
      throw error;
    }
  }

  // Firestoreからユーザープロフィール取得
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('ユーザープロフィール取得エラー:', error);
      throw error;
    }
  }

  // Firebase Authエラーメッセージを日本語に変換
  static getErrorMessage(error: any): string {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/weak-password':
        return 'パスワードが弱すぎます。6文字以上で設定してください';
      case 'auth/invalid-email':
        return '無効なメールアドレスです';
      case 'auth/user-not-found':
        return 'ユーザーが見つかりません';
      case 'auth/wrong-password':
        return 'パスワードが間違っています';
      case 'auth/too-many-requests':
        return 'リクエストが多すぎます。しばらく待ってから再試行してください';
      case 'auth/network-request-failed':
        return 'ネットワークエラーが発生しました';
      default:
        return '認証エラーが発生しました';
    }
  }
}