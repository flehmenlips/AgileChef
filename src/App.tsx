import React from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
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
  return (
    <Routes>
      <Route 
        path="/sign-in" 
        element={
          <AuthPage>
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
          </AuthPage>
        } 
      />
      <Route 
        path="/sign-up" 
        element={
          <AuthPage>
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
          </AuthPage>
        } 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <KanbanBoardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  console.log('ProtectedRoute state:', { isSignedIn, isLoaded });

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
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

const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ClerkProvider>
  );
};

export default App; 