import React from 'react';
import { DragDropContext, Droppable, DropResult, DroppableProvided } from 'react-beautiful-dnd';
import { useBoardStore, BoardState } from '../../store/boardStore';
import { KanbanColumn } from './KanbanColumn';
import { KanbanColumn as KanbanColumnType } from '../../types/kanban';
import styles from './KanbanBoard.module.css';

const KanbanBoard: React.FC = () => {
  const columns = useBoardStore((state: BoardState) => state.columns);
  const isLoading = useBoardStore((state: BoardState) => state.isLoading);
  const moveColumn = useBoardStore((state: BoardState) => state.moveColumn);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (result.type === 'COLUMN') {
      if (source.index !== destination.index) {
        await moveColumn(source.index, destination.index);
      }
      return;
    }
    // ... rest of the drag handling code ...
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="board" type="COLUMN" direction="horizontal">
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={styles.board}
            style={{ opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s' }}
          >
            {columns.map((column: KanbanColumnType, index: number) => (
              <KanbanColumn
                key={column.id}
                column={column}
                index={index}
                disabled={isLoading}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanBoard; 