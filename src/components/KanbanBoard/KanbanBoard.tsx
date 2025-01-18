import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { KanbanColumn as Column } from '../../types/kanban';
import KanbanColumn from './KanbanColumn';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  columns: Column[];
  onDragEnd: (result: DropResult) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, onDragEnd }) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onDragEnd(result);
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
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard; 