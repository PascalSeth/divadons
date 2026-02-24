# Collection-Category-Product API Documentation

This document outlines the updated API endpoints for managing the Collection-Category-Product relationship.

## Endpoints

### Collections

#### GET /api/collections
Fetch all collections with pagination.
- **Params:** `page` (default: 1), `pageSize` (default: 10)
- **Response:** Collections with linked categories and product count

```json
{
  "data": [
    {
      "id": "summer-2025",
      "name": "Summer Collection 2025",
      "subtitle": "Beat the heat",
      "categories": [
        {
          "sortOrder": 1,
          "category": {
            "id": "ankara",
            "name": "Ankara",
            "image": "ankara.jpg"
          }
        }
      ],
      "products": [
        { "productId": "uuid1" },
        { "productId": "uuid2" }
      ]
    }
  ],
  "meta": { "total": 15, "page": 1, "pageSize": 10 }
}
```

#### POST /api/collections
Create a new collection (Admin only).
- **Body:**
```json
{
  "id": "summer-2025",
  "name": "Summer Collection 2025",
  "subtitle": "Beat the heat",
  "description": "Summer essentials",
  "color": "#FF6B6B",
  "gradient": "from-yellow-400 to-red-500",
  "image": "summer.jpg"
}
```

#### GET /api/collections/[id]
Fetch a specific collection with all categories and products.
- **Response:** Collection with detailed categories and products

```json
{
  "data": {
    "id": "summer-2025",
    "name": "Summer Collection 2025",
    "categories": [
      {
        "sortOrder": 1,
        "category": {
          "id": "ankara",
          "name": "Ankara",
          "subtitle": "Wax print fabric",
          "color": "#FF6B6B",
          "image": "ankara.jpg",
          "imageUrl": "https://..."
        }
      }
    ],
    "products": [
      {
        "sortOrder": 1,
        "product": {
          "id": "uuid1",
          "name": "Red Summer Ankara Dress",
          "price": "45.00",
          "featured": true
        }
      }
    ]
  }
}
```

#### PUT /api/collections/[id]
Update a collection (Admin only).
- **Body:** Same as POST (all fields optional)

#### DELETE /api/collections/[id]
Delete a collection (Admin only).

---

### Collection Categories

#### GET /api/collections/[id]/categories
Get all categories in a collection.
- **Response:**
```json
{
  "data": [
    {
      "sortOrder": 1,
      "category": {
        "id": "ankara",
        "name": "Ankara",
        "subtitle": "Wax print fabric",
        "color": "#FF6B6B",
        "image": "ankara.jpg",
        "imageUrl": "https://..."
      }
    }
  ]
}
```

#### POST /api/collections/[id]/categories
Add a category to a collection (Admin only).
- **Body:**
```json
{
  "categoryId": "ankara",
  "sortOrder": 1
}
```

#### PUT /api/collections/[id]/categories/[categoryId]
Update category sort order in collection (Admin only).
- **Body:**
```json
{
  "sortOrder": 2
}
```

#### DELETE /api/collections/[id]/categories/[categoryId]
Remove a category from a collection (Admin only).

#### GET /api/collections/[id]/categories/[categoryId]/products
Get all products from a category in a collection.
- **Params:** `page`, `pageSize`
- **Response:**
```json
{
  "data": [
    {
      "id": "uuid1",
      "name": "Red Summer Ankara Dress",
      "price": "45.00",
      "color": "Red",
      "featured": true,
      "images": ["https://..."]
    }
  ],
  "meta": { "total": 12, "page": 1, "pageSize": 10 }
}
```

---

### Collection Products

#### POST /api/collections/[id]/products
Add a specific product to a collection (Admin only).
- **Body:**
```json
{
  "productId": "uuid1",
  "sortOrder": 1
}
```

#### DELETE /api/collections/[id]/products/[productId]
Remove a product from a collection (Admin only).

---

## Usage Examples

### Example 1: Create a collection with categories

```bash
# Create collection
POST /api/collections
{
  "id": "summer-2025",
  "name": "Summer Collection 2025"
}

# Add ankara category
POST /api/collections/summer-2025/categories
{
  "categoryId": "ankara",
  "sortOrder": 1
}

# Add kente category
POST /api/collections/summer-2025/categories
{
  "categoryId": "kente",
  "sortOrder": 2
}

# Get all products from ankara category
GET /api/collections/summer-2025/categories/ankara/products?page=1&pageSize=20
```

### Example 2: Hand-pick products for collection

```bash
# Add specific product
POST /api/collections/luxury/products
{
  "productId": "uuid1",
  "sortOrder": 1
}

# Add another specific product
POST /api/collections/luxury/products
{
  "productId": "uuid2",
  "sortOrder": 2
}
```

### Example 3: Get collection with all details

```bash
GET /api/collections/summer-2025

# Returns collection with:
# - All linked categories (with images & metadata)
# - All hand-picked products (direct links)
# - All products from linked categories (via separate query)
```

---

## Data Flow

```
Collection (summer-2025)
├── Categories (via CollectionCategory)
│   ├── Ankara (sortOrder: 1)
│   │   └── GET /api/collections/summer-2025/categories/ankara/products
│   │       └── Returns all products with categoryId = ankara
│   └── Kente (sortOrder: 2)
│
└── Direct Products (via CollectionProduct)
    ├── uuid1 (specific hand-picked item, sortOrder: 1)
    └── uuid2 (specific hand-picked item, sortOrder: 2)
```

---

## Response Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - Deleted (DELETE)
- `400` - Invalid request
- `404` - Not found
- `409` - Duplicate (e.g., category already in collection)
- `500` - Server error

---

## Error Responses

```json
{
  "success": false,
  "error": "Collection not found",
  "statusCode": 404,
  "details": null
}
```
