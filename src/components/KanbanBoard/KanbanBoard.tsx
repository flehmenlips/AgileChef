import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from '../../types/kanban';
import KanbanColumnComponent from './KanbanColumn';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onDragEnd: (result: DropResult) => void;
  onAddColumn: (title: string) => void;
  onMoveColumn: (sourceIndex: number, destinationIndex: number) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  columns, 
  onDragEnd, 
  onAddColumn,
  onMoveColumn 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'COLUMN') {
      if (source.index !== destination.index) {
        onMoveColumn(source.index, destination.index);
      }
      return;
    }

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
      <Droppable droppableId="board" direction="horizontal" type="COLUMN">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.board}
          >
            {columns.map((column, index) => (
              <Draggable
                key={column.id}
                draggableId={column.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={styles.columnWrapper}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className={`${styles.columnDragHandle} ${
                        snapshot.isDragging ? styles.dragging : ''
                      }`}
                    />
                    <KanbanColumnComponent
                      column={column}
                      index={index}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
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
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanBoard; 