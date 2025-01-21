import React from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import Layout from './components/Layout/Layout';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import { useBoardStore } from './store/boardStore';
import styles from './App.module.css';

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up" element={<SignUp routing="path" path="/sign-up" />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <KanbanBoardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
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
      <AppContent />
    </ClerkProvider>
  );
};

export default App; 