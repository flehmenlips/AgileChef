# AgileChef Kanban System - Technical Specification

## Database Schema

### Board
```prisma
model Board {
  id          String   @id @default(cuid())
  name        String
  type        BoardType
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lists       List[]
  menuId      String?
  menu        Menu?    @relation(fields: [menuId], references: [id])
}

enum BoardType {
  CURRENT_MENU_PREPS
  PREP_LIST
  DORMANT_RECIPES
  MENU_IDEAS
}
```

### List
```prisma
model List {
  id        String   @id @default(cuid())
  name      String
  position  Int
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id])
  cards     Card[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Card
```prisma
model Card {
  id          String     @id @default(cuid())
  title       String
  description String?
  position    Int
  listId      String
  list        List       @relation(fields: [listId], references: [id])
  labels      Label[]
  dueDate     DateTime?
  quantity    Decimal?
  unit        String?
  prepTime    Int?       // in minutes
  assignedTo  String?
  priority    Priority?
  status      CardStatus
  recipeId    String?
  recipe      Recipe?    @relation(fields: [recipeId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum Priority {
  URGENT
  HIGH
  NORMAL
  LOW
}

enum CardStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}
```

### Recipe
```prisma
model Recipe {
  id           String   @id @default(cuid())
  name         String
  description  String?
  instructions String[]
  ingredients  RecipeIngredient[]
  prepTime     Int      // in minutes
  cookTime     Int      // in minutes
  yield        Int
  unit         String
  category     String
  tags         Tag[]
  cards        Card[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Menu
```prisma
model Menu {
  id          String   @id @default(cuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime?
  type        MenuType
  sections    MenuSection[]
  boards      Board[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum MenuType {
  PRIX_FIXE
  A_LA_CARTE
  TASTING
  SPECIAL
}
```

## API Endpoints

### Boards
```typescript
// GET /api/boards
// GET /api/boards/:id
// POST /api/boards
// PUT /api/boards/:id
// DELETE /api/boards/:id
```

### Lists
```typescript
// GET /api/boards/:boardId/lists
// POST /api/lists
// PUT /api/lists/:id
// DELETE /api/lists/:id
// PUT /api/lists/:id/position
```

### Cards
```typescript
// GET /api/lists/:listId/cards
// POST /api/cards
// PUT /api/cards/:id
// DELETE /api/cards/:id
// PUT /api/cards/:id/position
// PUT /api/cards/:id/list
```

### Menus
```typescript
// GET /api/menus
// POST /api/menus
// PUT /api/menus/:id
// DELETE /api/menus/:id
// POST /api/menus/:id/generate-prep-cards
```

## Frontend Components

### Board Components
```typescript
// components/boards/
- BoardList.tsx        // List of all boards
- BoardView.tsx        // Single board view
- BoardHeader.tsx      // Board title and actions
- CreateBoard.tsx      // New board form
```

### List Components
```typescript
// components/lists/
- ListView.tsx         // Single list view
- CreateList.tsx       // New list form
- ListHeader.tsx       // List title and actions
```

### Card Components
```typescript
// components/cards/
- CardView.tsx         // Card preview in list
- CardDetail.tsx       // Full card details modal
- CreateCard.tsx       // New card form
- CardLabels.tsx       // Label management
```

### Menu Components
```typescript
// components/menus/
- MenuTemplate.tsx     // Prix fixe menu template
- MenuBuilder.tsx      // Menu creation interface
- MenuPreview.tsx      // Formatted menu view
```

## State Management

### Zustand Store Structure
```typescript
interface KanbanStore {
  boards: Board[]
  currentBoard: Board | null
  lists: List[]
  cards: Card[]
  
  // Board actions
  fetchBoards: () => Promise<void>
  createBoard: (board: BoardCreate) => Promise<void>
  updateBoard: (id: string, data: BoardUpdate) => Promise<void>
  
  // List actions
  fetchLists: (boardId: string) => Promise<void>
  createList: (list: ListCreate) => Promise<void>
  updateList: (id: string, data: ListUpdate) => Promise<void>
  reorderList: (id: string, position: number) => Promise<void>
  
  // Card actions
  fetchCards: (listId: string) => Promise<void>
  createCard: (card: CardCreate) => Promise<void>
  updateCard: (id: string, data: CardUpdate) => Promise<void>
  moveCard: (id: string, listId: string, position: number) => Promise<void>
}
```

## Drag and Drop Implementation

```typescript
// Using react-beautiful-dnd for drag and drop
interface DragResult {
  destination: {
    droppableId: string
    index: number
  }
  source: {
    droppableId: string
    index: number
  }
  draggableId: string
  type: 'CARD' | 'LIST'
}

const onDragEnd = (result: DragResult) => {
  const { destination, source, draggableId, type } = result
  
  if (!destination) return
  
  if (type === 'LIST') {
    handleListReorder(draggableId, destination.index)
  } else {
    handleCardMove(draggableId, destination.droppableId, destination.index)
  }
}
```

## Automation Features

### Recipe Scaling
```typescript
interface ScalingResult {
  ingredients: {
    id: string
    quantity: number
    unit: string
  }[]
  prepTime: number
  yield: number
}

const scaleRecipe = (
  recipe: Recipe,
  factor: number
): ScalingResult => {
  // Implementation
}
```

### Prep Task Generation
```typescript
interface PrepTask {
  title: string
  quantity: number
  unit: string
  dueDate: Date
  priority: Priority
}

const generatePrepTasks = (
  menu: Menu
): PrepTask[] => {
  // Implementation
}
``` 