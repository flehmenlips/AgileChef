# AgileChef Kanban System

## Board Structure

### 1. Current Menu Preps (Stocked)
- **Purpose**: Track active menu items that are currently prepped and ready
- **Color Code**: 🟢 Green
- **Fields**:
  - Item Name
  - Quantity Prepped
  - Prep Date
  - Expiry Date
  - Storage Location
  - Par Level

### 2. Prep List/In Progress
- **Purpose**: Active prep tasks and items currently being prepared
- **Color Code**: 🟡 Yellow
- **Fields**:
  - Item Name
  - Target Quantity
  - Assigned To
  - Priority Level
  - Estimated Completion Time
  - Required By Date

### 3. Dormant Recipes
- **Purpose**: Store recipes that aren't currently on the menu but are fully developed
- **Color Code**: ⚪ White
- **Fields**:
  - Recipe Name
  - Last Used Date
  - Season/Event Association
  - Category
  - Prep Time
  - Cost Analysis

### 4. Menu Ideas
- **Purpose**: Capture and develop new menu concepts
- **Color Code**: 🔵 Blue
- **Fields**:
  - Concept Name
  - Inspiration
  - Key Ingredients
  - Development Status
  - Notes
  - Target Season

## Prix Fixe Menu Integration

### Menu Template Structure
```markdown
[Restaurant Name]
Prix Fixe Menu - [Date]

First Course
- [Item Name] ([Prep Items])
  [Description]

Main Course
- [Item Name] ([Prep Items])
  [Description]

Dessert
- [Item Name] ([Prep Items])
  [Description]
```

### Workflow Integration
1. **Menu Creation**
   - Create new menu in template
   - Tag required prep items in descriptions

2. **Automatic Task Generation**
   - System identifies tagged prep items
   - Creates prep cards in "Prep List/In Progress"
   - Links prep items to menu items

3. **Status Tracking**
   - Move completed preps to "Current Menu Preps"
   - Track inventory levels
   - Alert when items need replenishing

## Card Movement Rules

1. **New Prep Tasks**
   - Created from menu template → "Prep List/In Progress"
   - Include all recipe components and sub-preps

2. **Completed Preps**
   - Move from "In Progress" → "Stocked"
   - Update inventory quantities
   - Set expiry tracking

3. **Menu Changes**
   - Unused items → "Dormant Recipes"
   - Archive prep history
   - Maintain cost/usage data

4. **Menu Development**
   - Ideas → Development → Testing → Active Menu
   - Track recipe iterations
   - Store tasting notes

## Automation Features

1. **Prep Scheduling**
   - Auto-calculate prep start times
   - Based on prep duration and service time
   - Account for dependencies

2. **Inventory Integration**
   - Track stock levels
   - Auto-generate prep tasks
   - Alert low inventory

3. **Recipe Scaling**
   - Scale recipes based on prep quantity
   - Maintain ratio integrity
   - Update prep times

4. **Menu Publishing**
   - Generate formatted menus
   - Update digital displays
   - Export for printing

## Labels and Tags

1. **Priority Levels**
   - Urgent (Red)
   - High (Orange)
   - Normal (Yellow)
   - Low (Green)

2. **Dietary Tags**
   - Vegetarian
   - Vegan
   - Gluten-Free
   - Contains Allergens

3. **Prep Types**
   - Mise en Place
   - Protein
   - Sauce
   - Garnish
   - Component

4. **Temperature Zones**
   - Hot Line
   - Cold Line
   - Pastry
   - Garde Manger 