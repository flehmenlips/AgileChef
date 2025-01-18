import React, { useState, useEffect } from 'react';
import { Card } from '../../../store/boardStore';
import styles from './KanbanCard.module.css';

interface CardFormProps {
  card?: Card;
  onSubmit: (cardData: Partial<Card>) => void;
  onCancel: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ card, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [labels, setLabels] = useState<string[]>(card?.labels || []);
  const [newLabel, setNewLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      priority: priority as 'low' | 'medium' | 'high',
      labels: labels.length > 0 ? labels : undefined,
    });
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
        placeholder="Card title"
        className={styles.input}
        autoFocus
        onKeyDown={handleKeyPress}
      />
      
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description..."
        className={styles.textarea}
        onKeyDown={handleKeyPress}
      />

      <div className={styles.formSection}>
        <label className={styles.label}>Priority:</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className={styles.select}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className={styles.formSection}>
        <label className={styles.label}>Labels:</label>
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
          >
            Add
          </button>
        </div>
        <div className={styles.labels}>
          {labels.map((label) => (
            <span key={label} className={styles.label}>
              {label}
              <button
                type="button"
                onClick={() => removeLabel(label)}
                className={styles.removeLabel}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.submitButton}>
          {card ? 'Update' : 'Add'} Card
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
};

export default CardForm; 