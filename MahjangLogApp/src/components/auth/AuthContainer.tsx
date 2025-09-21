import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

type AuthMode = 'login' | 'signup';

interface AuthContainerProps {
  onLogin: (email: string, password: string) => void;
  onSignup: (email: string, password: string, displayName: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const AuthContainer = ({ onLogin, onSignup, isLoading, error }: AuthContainerProps) => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {mode === 'login' ? (
          <LoginForm
            onSubmit={onLogin}
            onSwitchToSignup={() => setMode('signup')}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <SignupForm
            onSubmit={onSignup}
            onSwitchToLogin={() => setMode('login')}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};