import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanCard as CardType } from '../../../types/kanban';
import { useBoardStore } from '../../../store/boardStore';
import RecipeCardModal from './RecipeCardModal';
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
    const updatedCard = {
      ...updates,
      ingredients: updates.ingredients || [],
      instructions: updates.instructions || [],
      status: updates.status || 'dormant',
    };
    updateCard(columnId, card.id, updatedCard);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteCard(columnId, card.id);
    }
  };

  const getStatusColor = (status: CardType['status']) => {
    switch (status) {
      case 'fully-stocked':
        return styles.statusFullyStocked;
      case 'low-stock':
        return styles.statusLowStock;
      case 'out-of-stock':
        return styles.statusOutOfStock;
      case 'in-progress':
        return styles.statusInProgress;
      case 'dormant':
        return styles.statusDormant;
      default:
        return '';
    }
  };

  const ingredients = card.ingredients || [];
  const instructions = card.instructions || [];
  const status = card.status || 'dormant';

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.card} ${snapshot.isDragging ? styles.dragging : ''} ${getStatusColor(status)}`}
            style={provided.draggableProps.style}
            onClick={handleEdit}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleEdit();
              }
            }}
          >
            <div className={styles.cardContent}>
              <h3 className={styles.title}>{card.title}</h3>
              <div className={styles.recipePreview}>
                {ingredients.length > 0 && (
                  <div className={styles.ingredients}>
                    <strong>Ingredients:</strong> {ingredients.length}
                  </div>
                )}
                {instructions.length > 0 && (
                  <div className={styles.steps}>
                    <strong>Steps:</strong> {instructions.length}
                  </div>
                )}
              </div>
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
                <span className={`${styles.status} ${getStatusColor(status)}`}>
                  {status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <div 
              className={styles.cardActions}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleDelete}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Delete recipe"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </Draggable>
      {isEditing && (
        <RecipeCardModal
          card={{
            ...card,
            ingredients,
            instructions,
            status,
          }}
          onSubmit={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default KanbanCard; 