import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanColumn as ColumnType } from '../../../types/kanban';
import { useBoardStore } from '../../../store/boardStore';
import KanbanCard from '../KanbanCard';
import CardForm from '../KanbanCard/CardForm';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  column: ColumnType;
  index: number;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, index }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [editedLimit, setEditedLimit] = useState(column.limit?.toString() || '');
  const { addCard, updateColumn, deleteColumn } = useBoardStore();

  const handleAddCard = (cardData: any) => {
    if (column.limit && column.cards.length >= column.limit) {
      alert('Column has reached its card limit');
      return;
    }
    addCard(column.id, cardData.title);
    setIsAddingCard(false);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTitle.trim()) {
      try {
        await updateColumn(column.id, { title: editedTitle.trim() });
        setIsEditingTitle(false);
      } catch (error) {
        console.error('Failed to update column title:', error);
        alert('Failed to update column title. Please try again.');
      }
    }
  };

  const handleLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const limit = editedLimit ? parseInt(editedLimit, 10) : undefined;
      await updateColumn(column.id, { limit });
      setIsEditingLimit(false);
    } catch (error) {
      console.error('Failed to update column limit:', error);
      alert('Failed to update column limit. Please try again.');
    }
  };

  const handleDeleteColumn = async () => {
    if (window.confirm('Are you sure you want to delete this column and all its cards?')) {
      try {
        await deleteColumn(column.id);
      } catch (error) {
        console.error('Failed to delete column:', error);
        alert('Failed to delete column. Please try again.');
      }
    }
  };

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className={styles.titleForm}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
              className={styles.titleInput}
            />
          </form>
        ) : (
          <div className={styles.titleWrapper}>
            <h2 className={styles.title} onClick={() => setIsEditingTitle(true)}>
              {column.title}
            </h2>
            <button
              onClick={handleDeleteColumn}
              className={styles.deleteButton}
              title="Delete column"
            >
              ×
            </button>
          </div>
        )}
        {isEditingLimit ? (
          <form onSubmit={handleLimitSubmit} className={styles.limitForm}>
            <input
              type="number"
              value={editedLimit}
              onChange={(e) => setEditedLimit(e.target.value)}
              onBlur={handleLimitSubmit}
              min="0"
              placeholder="No limit"
              className={styles.limitInput}
              autoFocus
            />
          </form>
        ) : (
          <span 
            className={styles.limit} 
            onClick={() => setIsEditingLimit(true)}
            title="Click to edit limit"
          >
            {column.cards.length}{column.limit ? `/${column.limit}` : ''}
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
                columnId={column.id}
              />
            ))}
            {provided.placeholder}
            {isAddingCard ? (
              <div className={styles.newCard}>
                <CardForm
                  onSubmit={handleAddCard}
                  onCancel={() => setIsAddingCard(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className={styles.addCardButton}
                disabled={column.limit ? column.cards.length >= column.limit : false}
              >
                Add Recipe
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn; 