import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanCard as CardType } from '../../../types/kanban';
import styles from './KanbanCard.module.css';

interface KanbanCardProps {
  card: CardType;
  index: number;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, index }) => {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${styles.card} ${snapshot.isDragging ? styles.dragging : ''} ${styles[`priority-${card.priority}`] || ''}`}
          style={provided.draggableProps.style}
        >
          <h3 className={styles.title}>{card.title}</h3>
          {card.description && (
            <p className={styles.description}>{card.description}</p>
          )}
          <div className={styles.metadata}>
            {card.labels && card.labels.length > 0 && (
              <div className={styles.labels}>
                {card.labels.map((label) => (
                  <span key={label} className={styles.label}>
                    {label}
                  </span>
                ))}
              </div>
            )}
            {card.priority && (
              <span className={`${styles.priority} ${styles[`priority-${card.priority}`]}`}>
                {card.priority}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard; 