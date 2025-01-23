import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { KanbanCard as CardType, RecipeStatus } from '../../../types/kanban';
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

  const handleUpdate = async (updates: Partial<CardType>) => {
    try {
      await updateCard(columnId, card.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update card:', error);
      alert('Failed to update recipe. Please try again.');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteCard(columnId, card.id);
      } catch (error) {
        console.error('Failed to delete card:', error);
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };

  const getStatusColor = (status: RecipeStatus) => {
    switch (status) {
      case RecipeStatus.FULLY_STOCKED:
        return styles.statusFullyStocked;
      case RecipeStatus.LOW_STOCK:
        return styles.statusLowStock;
      case RecipeStatus.OUT_OF_STOCK:
        return styles.statusOutOfStock;
      case RecipeStatus.DORMANT:
      default:
        return styles.statusDormant;
    }
  };

  const ingredients = card.ingredients || [];
  const instructions = card.instructions || [];
  const status = card.status || RecipeStatus.DORMANT;

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
                <span className={styles.status}>{status}</span>
                {card.labels && card.labels.length > 0 && (
                  <div className={styles.labels}>
                    {card.labels.map((label) => (
                      <span key={label} className={styles.label}>
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleDelete}
                  className={styles.deleteButton}
                  aria-label="Delete recipe"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
      {isEditing && (
        <RecipeCardModal
          card={card}
          onSubmit={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default KanbanCard; 