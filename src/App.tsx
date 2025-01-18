import React from 'react';
import Board from './components/Board';
import styles from './App.module.css';

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Agile Chef Kanban</h1>
      </header>
      <Board />
    </div>
  );
};

export default App; 