import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanCard as CardType } from '../../../types/kanban';
import { useBoardStore } from '../../../store/boardStore';
import CardForm from './CardForm';
import styles from './KanbanCard.module.css';

interface KanbanCardProps {
  card: CardType;
  index: number;
  columnId: string;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, index, columnId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateCard, deleteCard } = useBoardStore();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = (updates: Partial<CardType>) => {
    updateCard(columnId, card.id, updates);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(columnId, card.id);
    }
  };

  if (isEditing) {
    return (
      <div className={styles.card}>
        <CardForm
          card={card}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

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
          <div className={styles.cardActions}>
            <button
              onClick={handleEdit}
              className={styles.actionButton}
              title="Edit card"
            >
              ✎
            </button>
            <button
              onClick={handleDelete}
              className={`${styles.actionButton} ${styles.deleteButton}`}
              title="Delete card"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard; 