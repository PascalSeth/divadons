# Collection Management - Admin Frontend Implementation

## Overview

This implementation adds the Collection-Category-Product relationship management to the admin panel. Admins can now:

1. Create and manage collections
2. Link categories to collections
3. Add hand-picked products to collections
4. Manage both relationships with sort ordering

## File Structure

```
app/admin/(pages)/collections/
├── page.tsx                 # Main collections list
└── [id]/
    └── page.tsx            # Collection detail & management
```

## Pages

### 1. Collections List (`/admin/collections`)

**Features:**
- View all collections in a table
- Create new collections
- Edit collection details (name, subtitle, description, color, gradient, image)
- Delete collections
- **NEW:** "Manage" button to open detail page

**UI Elements:**
- Dialog for creating/editing collections
- Image upload support
- Pagination support

### 2. Collection Detail (`/admin/collections/[id]`)

**Features:**

#### Categories Management
- View all linked categories in a table
- Add categories to collection
- Remove categories from collection
- Categories are sorted by `sortOrder`
- Can link multiple categories

#### Products Management
- View hand-picked products in a table
- Add specific products to collection
- Remove products from collection
- Products are sorted by `sortOrder`
- Can add same product to multiple collections

**UI Elements:**
- Two main sections: "Linked Categories" and "Hand-Picked Products"
- Dialog modals for adding categories/products
- Dropdown selects showing only available items (not already linked)
- Remove buttons with confirmation
- Back navigation button

## Data Flow

### Adding a Category to Collection

```
1. User clicks "Add Category" in detail page
2. Dialog opens with dropdown of available categories
3. Select a category and click "Add"
4. POST /api/collections/[id]/categories
5. Collection reloads with new category
```

### Adding a Product to Collection

```
1. User clicks "Add Product" in detail page
2. Dialog opens with dropdown of available products
3. Select a product and click "Add"
4. POST /api/collections/[id]/products
5. Collection reloads with new product
```

### Removing Items

```
1. Click "Remove" button in either table
2. Confirmation dialog appears
3. DELETE request sent
4. Collection reloads
```

## Component Behavior

### Type Definitions

```typescript
type Category = {
  id: string;
  name: string;
  image?: string | null;
};

type Product = {
  id: string;
  name: string;
  price: string;
  images: string[];
  featured: boolean;
};

type CollectionCategory = {
  sortOrder: number;
  category: Category;
};

type CollectionProduct = {
  sortOrder: number;
  product: Product;
};

type Collection = {
  id: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  gradient?: string | null;
  image?: string | null;
  categories: CollectionCategory[];
  products: CollectionProduct[];
};
```

### State Management

Each page manages its own state:
- `collection`: Current collection data
- `loading`: Loading state for initial load
- `error`: Error messages
- `categoryDialog`: Dialog open/close state
- `productDialog`: Dialog open/close state
- `selectedCategory`: Currently selected category in dropdown
- `selectedProduct`: Currently selected product in dropdown
- `allCategories`: Available categories (loaded when dialog opens)
- `allProducts`: Available products (loaded when dialog opens)

### Key Functions

```typescript
// Load collection with categories and products
loadCollection(): Promise<void>

// Load all categories (filtered to exclude already linked)
loadCategories(): Promise<void>

// Load all products (filtered to exclude already linked)
loadProducts(): Promise<void>

// Add category to collection
handleAddCategory(): Promise<void>

// Add product to collection
handleAddProduct(): Promise<void>

// Remove category from collection
handleRemoveCategory(categoryId: string): Promise<void>

// Remove product from collection
handleRemoveProduct(productId: string): Promise<void>
```

## API Integration

### Endpoints Used

**Collections List Page:**
- `GET /api/collections?page=1&pageSize=50`
- `POST /api/collections`
- `PUT /api/collections/[id]`
- `DELETE /api/collections/[id]`
- `POST /api/upload` (image upload)

**Collection Detail Page:**
- `GET /api/collections/[id]`
- `GET /api/categories?page=1&pageSize=100`
- `GET /api/products?page=1&pageSize=100`
- `POST /api/collections/[id]/categories`
- `DELETE /api/collections/[id]/categories/[categoryId]`
- `POST /api/collections/[id]/products`
- `DELETE /api/collections/[id]/products/[productId]`

## Usage Guide

### Creating a Collection with Categories

1. Go to `/admin/collections`
2. Click "+ Add Collection"
3. Fill in Collection ID (slug), Name, Subtitle, Description, Color, Gradient, Image
4. Click "Save"
5. Click "Manage" on the new collection
6. In the "Linked Categories" section, click "+ Add Category"
7. Select categories from dropdown
8. Click "Add" for each category
9. Categories now appear in the table with sort order

### Hand-Picking Products for Collection

1. Open collection detail page (`/admin/collections/[id]`)
2. Go to "Hand-Picked Products" section
3. Click "+ Add Product"
4. Select product from dropdown
5. Click "Add"
6. Product appears in table with sort order

### Remove Category from Collection

1. In "Linked Categories" section, find the category
2. Click "Remove" button
3. Confirm deletion
4. Category is removed

### Remove Product from Collection

1. In "Hand-Picked Products" section, find the product
2. Click "Remove" button
3. Confirm deletion
4. Product is removed

## Styling

Uses existing admin UI components:
- `Button` with variants (outline, destructive)
- `Table` with TableHeader, TableBody, TableCell, TableRow
- `Dialog` with DialogContent, DialogHeader, DialogTitle, DialogTrigger
- `Input` for text fields
- Tailwind CSS for styling

## Error Handling

- All async operations wrapped in try-catch
- Errors displayed at top of page
- User confirmations for destructive actions
- Loading states on buttons and dialogs
- Proper error messages from API

## Future Enhancements

Could add:
- Bulk operations (select multiple and remove)
- Drag-and-drop to reorder categories/products
- Search/filter in dropdowns
- Category/product preview images
- Sort order editing (increase/decrease buttons)
- Export collection data
- Duplicate collection
