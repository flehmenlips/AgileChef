import React, { useState } from 'react';
import { KanbanCard, Ingredient } from '../../../types/kanban';
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
  const [status, setStatus] = useState(card.status || 'dormant');
  const [newIngredient, setNewIngredient] = useState<{ quantity: number; unit: Ingredient['unit']; name: string }>({
    quantity: 0,
    unit: 'g',
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
      setNewIngredient({ quantity: 0, unit: 'g', name: '' });
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
            />
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as KanbanCard['status'])}
              className={styles.select}
            >
              <option value="fully-stocked">Fully Stocked</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="in-progress">In Progress</option>
              <option value="dormant">Dormant</option>
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
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as Ingredient['unit'] })}
                className={styles.unitSelect}
              >
                <option value="g">grams</option>
                <option value="oz">ounces</option>
                <option value="cup">cups</option>
                <option value="tbsp">tablespoons</option>
                <option value="tsp">teaspoons</option>
                <option value="lb">pounds</option>
                <option value="kg">kilograms</option>
                <option value="ml">milliliters</option>
                <option value="l">liters</option>
                <option value="piece">pieces</option>
                <option value="pinch">pinches</option>
              </select>
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className={styles.ingredientNameInput}
                placeholder="Ingredient name"
              />
              <button
                type="button"
                onClick={addIngredient}
                className={styles.addButton}
              >
                Add
              </button>
            </div>
            <div className={styles.ingredientList}>
              {ingredients.map((ing) => (
                <div key={ing.id} className={styles.ingredientItem}>
                  <span>{ing.quantity} {ing.unit} {ing.name}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing.id)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Instructions</label>
            <div className={styles.instructionInput}>
              <textarea
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                className={styles.textarea}
                placeholder="Add an instruction step"
              />
              <button
                type="button"
                onClick={addInstruction}
                className={styles.addButton}
              >
                Add Step
              </button>
            </div>
            <div className={styles.instructionList}>
              {instructions.map((instruction, index) => (
                <div key={index} className={styles.instructionItem}>
                  <span className={styles.stepNumber}>{index + 1}.</span>
                  <span className={styles.instructionText}>{instruction}</span>
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitButton}>
              Save Recipe
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeCardModal; 