import React, { useEffect } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements, Navigate } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import Layout from './components/Layout/Layout';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import { useBoardStore } from './store/boardStore';
import styles from './App.module.css';
import authStyles from './styles/auth.module.css';

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

const AuthPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={authStyles.authContainer}>
      <div className={authStyles.authWrapper}>
        {children}
      </div>
    </div>
  );
};

const LoadingFallback = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.loadingSpinner} />
    <p>Loading...</p>
  </div>
);

const AppContent: React.FC = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const setToken = useBoardStore((state) => state.setToken);

  // Set up auth token
  useEffect(() => {
    const setupAuth = async () => {
      if (!isLoaded) return;
      
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            localStorage.setItem('clerk-token', token);
            setToken(token);
          } else {
            localStorage.removeItem('clerk-token');
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
          localStorage.removeItem('clerk-token');
          setToken(null);
        }
      } else {
        localStorage.removeItem('clerk-token');
        setToken(null);
      }
    };
    
    setupAuth();
  }, [isSignedIn, isLoaded, setToken, getToken]);

  if (!isLoaded) {
    return <LoadingFallback />;
  }

  return (
    <Layout>
      {isSignedIn ? <KanbanBoardPage /> : <Navigate to="/sign-in" replace />}
    </Layout>
  );
};

const KanbanBoardPage: React.FC = () => {
  const { columns, moveCard, addColumn, moveColumn, isLoading, error } = useBoardStore();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    moveCard(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Recipe Development Board</h2>
        <p className={styles.pageDescription}>
          Track and manage your recipe development process
        </p>
      </div>
      <KanbanBoard
        columns={columns}
        onDragEnd={handleDragEnd}
        onAddColumn={addColumn}
        onMoveColumn={moveColumn}
      />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="sign-in/*" element={<AuthPage><SignIn routing="path" path="/sign-in" afterSignInUrl="/" signUpUrl="/sign-up" /></AuthPage>} />
      <Route path="sign-up/*" element={<AuthPage><SignUp routing="path" path="/sign-up" afterSignUpUrl="/" signInUrl="/sign-in" /></AuthPage>} />
      <Route index element={<AppContent />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <RouterProvider router={router} fallback={<LoadingFallback />} />
    </ClerkProvider>
  );
};

export default App; 