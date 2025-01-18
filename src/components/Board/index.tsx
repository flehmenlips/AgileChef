import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useBoardStore, Column, Card } from '../../store/boardStore';
import styles from './Board.module.css';

const Board: React.FC = () => {
  const { columns, moveCard } = useBoardStore();

  const onDragEnd = (result: DropResult) => {
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {columns.map((column: Column) => (
          <div key={column.id} className={styles.column}>
            <h2 className={styles.columnTitle}>{column.title}</h2>
            <Droppable droppableId={column.id}>
              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${styles.columnContent} ${
                    snapshot.isDraggingOver ? styles.draggingOver : ''
                  }`}
                >
                  {column.cards.map((card: Card, index: number) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${styles.card} ${
                            snapshot.isDragging ? styles.dragging : ''
                          }`}
                        >
                          <h3>{card.title}</h3>
                          {card.description && <p>{card.description}</p>}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Board; 