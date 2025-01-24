import React, { useState } from 'react';
import { KanbanCard } from '../../../types/kanban';
import styles from './CardForm.module.css';

interface CardFormProps {
  card?: KanbanCard;
  onSubmit: (cardData: Partial<KanbanCard>) => void;
  onCancel: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ card, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [labels, setLabels] = useState<string[]>(card?.labels || []);
  const [newLabel, setNewLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (card) {
      // Edit mode - include all fields
      onSubmit({
        title,
        description,
        labels: labels.length > 0 ? labels : undefined,
      });
    } else {
      // Create mode - only include title
      onSubmit({ title });
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.cardForm}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Recipe title"
        className={styles.input}
        autoFocus
        onKeyDown={handleKeyPress}
        required
      />

      {card && (
        <>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className={styles.textarea}
            onKeyDown={handleKeyPress}
          />

          <div className={styles.formSection}>
            <label className={styles.label}>Labels</label>
            <div className={styles.labelInput}>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add a label"
                className={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLabel();
                  }
                }}
              />
              <button
                type="button"
                onClick={addLabel}
                className={styles.addLabelButton}
                disabled={!newLabel.trim()}
              >
                Add
              </button>
            </div>
            {labels.length > 0 && (
              <div className={styles.labels}>
                {labels.map((label) => (
                  <span key={label} className={styles.label}>
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      className={styles.removeLabel}
                      aria-label={`Remove ${label} label`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.submitButton}>
          {card ? 'Update' : 'Add'} Recipe
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CardForm; 