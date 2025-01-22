import React, { useEffect } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
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

const AppContent: React.FC = () => {
  const { isSignedIn, isLoaded, session } = useAuth();
  const navigate = useNavigate();

  console.log('useAuth output:', { isSignedIn, isLoaded, session });

  useEffect(() => {
    if (session) {
      console.log('Token:', session.idToken); // or session.accessToken
    }
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('useAuth output:', { isSignedIn, isLoaded, session });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSignedIn, isLoaded, session]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/sign-in/*" 
        element={
          isSignedIn ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage>
              <SignIn 
                routing="path" 
                path="/sign-in" 
                afterSignInUrl="/"
                signUpUrl="/sign-up"
              />
            </AuthPage>
          )
        } 
      />
      <Route 
        path="/sign-up/*" 
        element={
          isSignedIn ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage>
              <SignUp 
                routing="path" 
                path="/sign-up"
                afterSignUpUrl="/"
                signInUrl="/sign-in"
              />
            </AuthPage>
          )
        } 
      />
      <Route
        path="/"
        element={
          !isLoaded ? (
            <div>Loading...</div>
          ) : !isSignedIn ? (
            <Navigate to="/sign-in" replace />
          ) : (
            <KanbanBoardPage />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const KanbanBoardPage: React.FC = () => {
  const { columns, moveCard, addColumn, moveColumn } = useBoardStore();

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

  return (
    <Layout>
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
    </Layout>
  );
};

const TokenLogger = () => {
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      console.log('Token:', session.idToken); // or session.accessToken
    }
  }, [session]);

  return null;
};

const App: React.FC = () => {
  return (
    <ClerkProvider 
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ClerkProvider>
  );
};

export default App; 