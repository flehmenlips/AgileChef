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

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const { addCard } = useBoardStore();

  const handleAddCard = (cardData: any) => {
    addCard(column.id, cardData.title, cardData.description);
    setIsAddingCard(false);
  };

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
              >
                + Add Card
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn; 