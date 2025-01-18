import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanColumn as ColumnType } from '../../../types/kanban';
import KanbanCard from '../KanbanCard';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  column: ColumnType;
  index: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <h2 className={styles.title}>{column.title}</h2>
        {column.limit && (
          <span className={styles.limit}>
            {column.cards.length}/{column.limit}
          </span>
        )}
      </div>
      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${styles.cardList} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
          >
            {column.cards.map((card, cardIndex) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={cardIndex}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn; 