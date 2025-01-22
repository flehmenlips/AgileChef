import React, { useState } from 'react';
import { KanbanCard, Ingredient, RecipeStatus, Unit } from '../../../types/kanban';
import styles from './RecipeCardModal.module.css';

interface RecipeCardModalProps {
  card: KanbanCard;
  onSubmit: (cardData: Partial<KanbanCard>) => void;
  onClose: () => void;
}

const RecipeCardModal: React.FC<RecipeCardModalProps> = ({ card, onSubmit, onClose }) => {
  const [title, setTitle] = useState(card.title);
  const [ingredients, setIngredients] = useState<Ingredient[]>(card.ingredients || []);
  const [instructions, setInstructions] = useState<string[]>(card.instructions || []);
  const [status, setStatus] = useState<RecipeStatus>(card.status || RecipeStatus.DORMANT);
  const [newIngredient, setNewIngredient] = useState<{ quantity: number; unit: Unit; name: string }>({
    quantity: 0,
    unit: Unit.G,
    name: '',
  });
  const [newInstruction, setNewInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      ingredients,
      instructions,
      status,
    });
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity > 0) {
      setIngredients([...ingredients, { ...newIngredient, id: crypto.randomUUID() }]);
      setNewIngredient({ quantity: 0, unit: Unit.G, name: '' });
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, newInstruction.trim()]);
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.header}>
            <h2>Edit Recipe</h2>
            <button type="button" onClick={onClose} className={styles.closeButton}>×</button>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Recipe title"
              required
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RecipeStatus)}
              className={styles.select}
            >
              <option value={RecipeStatus.DORMANT}>Dormant</option>
              <option value={RecipeStatus.ACTIVE}>Active</option>
              <option value={RecipeStatus.COMPLETED}>Completed</option>
            </select>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Ingredients</label>
            <div className={styles.ingredientInput}>
              <input
                type="number"
                value={newIngredient.quantity || ''}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) })}
                className={styles.quantityInput}
                placeholder="Quantity"
                min="0"
                step="0.1"
              />
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as Unit })}
                className={styles.unitSelect}
              >
                {Object.values(Unit).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className={styles.nameInput}
                placeholder="Ingredient name"
              />
              <button
                type="button"
                onClick={addIngredient}
                className={styles.addButton}
                disabled={!newIngredient.name || newIngredient.quantity <= 0}
              >
                Add
              </button>
            </div>
            <ul className={styles.ingredientList}>
              {ingredients.map((ingredient) => (
                <li key={ingredient.id} className={styles.ingredientItem}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient.id)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Instructions</label>
            <div className={styles.instructionInput}>
              <input
                type="text"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                className={styles.input}
                placeholder="Add a step..."
              />
              <button
                type="button"
                onClick={addInstruction}
                className={styles.addButton}
                disabled={!newInstruction.trim()}
              >
                Add
              </button>
            </div>
            <ol className={styles.instructionList}>
              {instructions.map((instruction, index) => (
                <li key={index} className={styles.instructionItem}>
                  {instruction}
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitButton}>Save Changes</button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeCardModal; 