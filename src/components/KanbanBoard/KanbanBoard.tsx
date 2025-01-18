import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn as Column } from '../../types/kanban';
import KanbanColumn from './KanbanColumn';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  columns: Column[];
  onDragEnd: (result: DropResult) => void;
  onAddColumn: (title: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, onDragEnd, onAddColumn }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onDragEnd(result);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      onAddColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColumn();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewColumnTitle('');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={styles.board}>
        {columns.map((column, index) => (
          <div key={column.id} className={styles.columnWrapper}>
            <KanbanColumn
              column={column}
              index={index}
            />
          </div>
        ))}
        <div className={styles.columnWrapper}>
          {isAdding ? (
            <div className={styles.newColumn}>
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter column title..."
                autoFocus
                className={styles.columnInput}
              />
              <div className={styles.buttonGroup}>
                <button onClick={handleAddColumn} className={styles.addButton}>
                  Add Column
                </button>
                <button onClick={() => setIsAdding(false)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className={styles.addColumnButton}>
              + Add Column
            </button>
          )}
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard; 