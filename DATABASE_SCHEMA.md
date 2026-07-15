# Feenix Repair Database Schema Documentation

## Overview
This document describes the complete PostgreSQL database schema for the Feenix Repair B2B Dealer-to-Dealer Marketplace.

## Database ENUMS

### user_role
- `ADMIN` - Platform administrator with full access
- `DEALER` - Business user who can buy and sell products

### product_status
- `ACTIVE` - Product is available for sale
- `INACTIVE` - Product is not available
- `OUT_OF_STOCK` - Product is temporarily unavailable

### enquiry_status
- `PENDING` - Enquiry submitted, awaiting response
- `ASSIGNED` - Enquiry assigned to a dealer/admin
- `ACCEPTED` - Enquiry accepted by seller
- `REJECTED` - Enquiry rejected by seller
- `COMPLETED` - Enquiry transaction completed

### order_status
- `PENDING` - Order placed, awaiting confirmation
- `CONFIRMED` - Order confirmed by seller
- `PROCESSING` - Order being processed
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

### payment_status
- `PENDING` - Payment awaiting processing
- `PAID` - Payment completed successfully
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

## Table Relationships (ER Diagram)

### Product Hierarchy
```
categories (1) ────────< (N) brands (1) ────────< (N) models (1) ────────< (N) products
     │                        │                        │                        │
     │                        │                        │                        │
     └────────────────────────┴────────────────────────┴────────────────────────┘
                                        (N)
                                        │
                                        │
                                        v
                                 product_images (N)
```

### User & Product Relationships
```
profiles (1) ────────< (N) products (1) ────────< (N) product_images
     │                        │
     │                        │
     │                        v
     │                  inventory (1)
     │
     │
     ├───────────────────────< (N) enquiries (as buyer)
     │
     ├───────────────────────< (N) enquiries (as seller)
     │
     ├───────────────────────< (N) orders (as buyer)
     │
     ├───────────────────────< (N) orders (as seller)
     │
     ├───────────────────────< (N) messages (as sender)
     │
     ├───────────────────────< (N) messages (as receiver)
     │
     └───────────────────────< (N) notifications
```

### Transaction Flow
```
profiles (buyer) ────────> enquiries ────────> profiles (seller)
     │                           │
     │                           │
     v                           v
orders ────────> payments
```

## Table Descriptions

### 1. profiles
**Purpose**: Stores all user information including admins and dealers.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `role` (user_role) - User role (ADMIN/DEALER)
- `email` (VARCHAR, UNIQUE) - User email address
- `business_name` - Company name for dealers
- `gst_number` - GST identification number
- `is_active` - Account status flag

**Indexes**:
- `idx_profiles_role` - For filtering by role
- `idx_profiles_email` - For email lookups
- `idx_profiles_is_active` - For active user filtering
- `idx_profiles_city`, `idx_profiles_state` - For geographic filtering

**Relationships**:
- One-to-many with products (as dealer)
- One-to-many with enquiries (as buyer and seller)
- One-to-many with orders (as buyer and seller)
- One-to-many with messages (as sender and receiver)
- One-to-many with notifications

**Why**: Centralized user management with role-based access control. Supports both admin and dealer profiles with business information.

---

### 2. categories
**Purpose**: Product categorization for organizing the marketplace.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `name` (VARCHAR, UNIQUE) - Category name
- `slug` (VARCHAR, UNIQUE) - URL-friendly identifier
- `status` (product_status) - Category availability

**Indexes**:
- `idx_categories_slug` - For slug-based routing
- `idx_categories_status` - For filtering active categories

**Relationships**:
- One-to-many with brands

**Why**: Hierarchical organization of products. Categories are the top-level classification in the product hierarchy.

---

### 3. brands
**Purpose**: Brand information linked to categories.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `category_id` (UUID, FK) - Parent category
- `name` (VARCHAR) - Brand name
- `slug` (VARCHAR) - URL-friendly identifier
- `logo` - Brand logo URL

**Indexes**:
- `idx_brands_category_id` - For category filtering
- `idx_brands_slug` - For slug-based routing
- `idx_brands_status` - For filtering active brands

**Relationships**:
- Many-to-one with categories
- One-to-many with models

**Why**: Second level in product hierarchy. Brands belong to categories and have multiple models.

---

### 4. models
**Purpose**: Product model information linked to brands.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `brand_id` (UUID, FK) - Parent brand
- `name` (VARCHAR) - Model name
- `slug` (VARCHAR) - URL-friendly identifier
- `status` (product_status) - Model availability

**Indexes**:
- `idx_models_brand_id` - For brand filtering
- `idx_models_slug` - For slug-based routing
- `idx_models_status` - For filtering active models

**Relationships**:
- Many-to-one with brands
- One-to-many with products

**Why**: Third level in product hierarchy. Models belong to brands and are the specific product variants.

---

### 5. products
**Purpose**: Core product listings in the marketplace.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `dealer_id` (UUID, FK) - Selling dealer
- `category_id` (UUID, FK) - Product category
- `brand_id` (UUID, FK) - Product brand
- `model_id` (UUID, FK) - Product model
- `title` (VARCHAR) - Product title
- `slug` (VARCHAR) - URL-friendly identifier
- `price` (DECIMAL) - Unit price
- `bulk_price` (DECIMAL) - Bulk pricing
- `stock` (INTEGER) - Available quantity
- `minimum_order` (INTEGER) - Minimum order quantity
- `status` (product_status) - Product availability
- `featured` (BOOLEAN) - Featured product flag

**Indexes**:
- `idx_products_dealer_id` - For dealer's product listings
- `idx_products_category_id` - For category filtering
- `idx_products_brand_id` - For brand filtering
- `idx_products_model_id` - For model filtering
- `idx_products_slug` - For slug-based routing
- `idx_products_status` - For filtering active products
- `idx_products_featured` - For featured products
- `idx_products_price` - For price-based sorting

**Relationships**:
- Many-to-one with profiles (dealer)
- Many-to-one with categories
- Many-to-one with brands
- Many-to-one with models
- One-to-many with product_images
- One-to-one with inventory
- One-to-many with enquiries
- One-to-many with orders
- One-to-many with featured_products

**Why**: Central entity in the marketplace. Links dealers with product taxonomy and contains all product details including pricing and inventory.

---

### 6. product_images
**Purpose**: Multiple images per product.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `product_id` (UUID, FK) - Parent product
- `image_url` (TEXT) - Image URL
- `display_order` (INTEGER) - Display sequence

**Indexes**:
- `idx_product_images_product_id` - For product image retrieval
- `idx_product_images_display_order` - For ordered display

**Relationships**:
- Many-to-one with products

**Why**: Supports multiple images per product with ordered display for better product presentation.

---

### 7. enquiries
**Purpose**: Dealer-to-dealer product enquiries.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `buyer_id` (UUID, FK) - Enquiring dealer
- `seller_id` (UUID, FK) - Selling dealer
- `product_id` (UUID, FK) - Enquired product
- `quantity` (INTEGER) - Requested quantity
- `remarks` (TEXT) - Additional notes
- `status` (enquiry_status) - Enquiry status
- `assigned_by` (UUID, FK) - Admin who assigned (nullable)

**Indexes**:
- `idx_enquiries_buyer_id` - For buyer's enquiries
- `idx_enquiries_seller_id` - For seller's enquiries
- `idx_enquiries_product_id` - For product enquiries
- `idx_enquiries_status` - For status filtering
- `idx_enquiries_assigned_by` - For admin assignment tracking

**Relationships**:
- Many-to-one with profiles (buyer)
- Many-to-one with profiles (seller)
- Many-to-one with products
- Many-to-one with profiles (assigned_by)

**Why**: Enables pre-order communication between dealers. Supports admin assignment for enquiry management.

---

### 8. orders
**Purpose**: Confirmed purchase orders between dealers.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `order_number` (VARCHAR, UNIQUE) - Human-readable order ID
- `buyer_id` (UUID, FK) - Buying dealer
- `seller_id` (UUID, FK) - Selling dealer
- `product_id` (UUID, FK) - Ordered product
- `quantity` (INTEGER) - Ordered quantity
- `price` (DECIMAL) - Unit price at time of order
- `subtotal` (DECIMAL) - Order subtotal
- `tax` (DECIMAL) - Tax amount
- `total` (DECIMAL) - Order total
- `status` (order_status) - Order status
- `payment_status` (payment_status) - Payment status

**Indexes**:
- `idx_orders_order_number` - For order lookup
- `idx_orders_buyer_id` - For buyer's orders
- `idx_orders_seller_id` - For seller's orders
- `idx_orders_product_id` - For product orders
- `idx_orders_status` - For status filtering
- `idx_orders_payment_status` - For payment filtering
- `idx_orders_created_at` - For chronological ordering

**Relationships**:
- Many-to-one with profiles (buyer)
- Many-to-one with profiles (seller)
- Many-to-one with products
- One-to-many with payments

**Why**: Core transaction entity. Tracks confirmed orders with pricing snapshot at time of purchase and order lifecycle.

---

### 9. payments
**Purpose**: Payment processing records via Razorpay.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `order_id` (UUID, FK) - Associated order
- `razorpay_order_id` (VARCHAR) - Razorpay order ID
- `razorpay_payment_id` (VARCHAR) - Razorpay payment ID
- `amount` (DECIMAL) - Payment amount
- `status` (payment_status) - Payment status
- `payment_method` (VARCHAR) - Payment method used
- `paid_at` (TIMESTAMPTZ) - Payment timestamp

**Indexes**:
- `idx_payments_order_id` - For order payments
- `idx_payments_razorpay_order_id` - For Razorpay integration
- `idx_payments_razorpay_payment_id` - For Razorpay reconciliation
- `idx_payments_status` - For status filtering

**Relationships**:
- Many-to-one with orders

**Why**: Tracks payment processing with Razorpay integration. Supports payment reconciliation and status tracking.

---

### 10. inventory
**Purpose**: Real-time inventory tracking per product.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `product_id` (UUID, FK, UNIQUE) - Associated product
- `available_stock` (INTEGER) - Available for sale
- `reserved_stock` (INTEGER) - Reserved for orders
- `low_stock_limit` (INTEGER) - Low stock threshold
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- `idx_inventory_product_id` - For product inventory
- `idx_inventory_product_id_unique` - Ensures one inventory record per product

**Relationships**:
- One-to-one with products

**Why**: Separates inventory management from product details. Enables real-time stock tracking with reserved stock for pending orders.

---

### 11. messages
**Purpose**: In-app messaging between dealers.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `sender_id` (UUID, FK) - Message sender
- `receiver_id` (UUID, FK) - Message receiver
- `message` (TEXT) - Message content
- `message_type` (VARCHAR) - Message type (TEXT, IMAGE, etc.)
- `is_read` (BOOLEAN) - Read status
- `created_at` (TIMESTAMPTZ) - Sent timestamp

**Indexes**:
- `idx_messages_sender_id` - For sent messages
- `idx_messages_receiver_id` - For received messages
- `idx_messages_is_read` - For unread filtering
- `idx_messages_created_at` - For chronological ordering

**Relationships**:
- Many-to-one with profiles (sender)
- Many-to-one with profiles (receiver)

**Why**: Enables direct communication between dealers for order negotiations and support.

---

### 12. notifications
**Purpose**: User notifications for system events.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID, FK) - Notification recipient
- `title` (VARCHAR) - Notification title
- `message` (TEXT) - Notification message
- `type` (VARCHAR) - Notification type (ORDER, ENQUIRY, PAYMENT, SYSTEM)
- `is_read` (BOOLEAN) - Read status
- `created_at` (TIMESTAMPTZ) - Created timestamp

**Indexes**:
- `idx_notifications_user_id` - For user notifications
- `idx_notifications_is_read` - For unread filtering
- `idx_notifications_type` - For type filtering
- `idx_notifications_created_at` - For chronological ordering

**Relationships**:
- Many-to-one with profiles

**Why**: Keeps users informed about important events like new orders, enquiries, and payment updates.

---

### 13. banners
**Purpose**: Homepage promotional banners.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `title` (VARCHAR) - Banner title
- `image` (TEXT) - Banner image URL
- `link` (TEXT) - Destination link
- `display_order` (INTEGER) - Display sequence
- `status` (product_status) - Banner visibility

**Indexes**:
- `idx_banners_display_order` - For ordered display
- `idx_banners_status` - For filtering active banners

**Relationships**: None

**Why**: Manages promotional content on the homepage with ordered display and status control.

---

### 14. featured_products
**Purpose**: Featured product listings on homepage.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `product_id` (UUID, FK, UNIQUE) - Featured product
- `display_order` (INTEGER) - Display sequence

**Indexes**:
- `idx_featured_products_product_id` - For product lookup
- `idx_featured_products_display_order` - For ordered display
- `idx_featured_products_product_id_unique` - Ensures one entry per product

**Relationships**:
- Many-to-one with products

**Why**: Manages homepage featured products with custom ordering without modifying the products table.

---

### 15. settings
**Purpose**: Global application settings.

**Key Fields**:
- `id` (UUID, PK) - Unique identifier
- `site_name` (VARCHAR) - Website name
- `email` (VARCHAR) - Contact email
- `phone` (VARCHAR) - Contact phone
- `phone` (VARCHAR) - Contact phone
- `address` (TEXT) - Business address
- `whatsapp` (VARCHAR) - WhatsApp number
- `logo` (TEXT) - Site logo URL
- `favicon` (TEXT) - Site favicon URL

**Relationships**: None

**Why**: Centralized configuration for site-wide settings like contact information and branding.

---

## Database Design Principles

### 1. UUID Primary Keys
All tables use UUID primary keys for:
- Distributed system compatibility
- Security (non-guessable IDs)
- No ID collision issues
- Better for API endpoints

### 2. TIMESTAMPTZ for Timestamps
All timestamps use `timestamptz` for:
- Timezone awareness
- Consistent time handling across regions
- Proper UTC storage

### 3. DECIMAL for Money
All monetary values use `DECIMAL(12, 2)` for:
- Precision in financial calculations
- Avoid floating-point rounding errors
- Support for large amounts (up to 999,999,999.99)

### 4. Cascade Deletes
Foreign keys use `ON DELETE CASCADE` where appropriate for:
- Automatic cleanup of related records
- Data consistency
- Simplified application logic

### 5. Indexes
Strategic indexes on:
- Foreign keys for join performance
- Frequently filtered columns (status, role)
- Search columns (email, slug)
- Date columns for chronological queries

### 6. ENUM Types
PostgreSQL ENUMs for:
- Type safety at database level
- Performance over string comparisons
- Clear documentation of allowed values
- Prevent invalid data entry

### 7. Row Level Security (RLS)
RLS enabled on all tables for:
- Fine-grained access control
- Security at database level
- Multi-tenant isolation
- TODO: Policies to be implemented in Phase 2

### 8. Automatic Timestamps
Triggers for `updated_at` on:
- profiles
- categories
- products
- inventory

### 9. Normalization
Third normal form for:
- No data duplication
- Single source of truth
- Easier maintenance
- Reduced update anomalies

### 10. Scalability
Design considerations:
- Separate inventory table for high-frequency updates
- Featured products table to avoid modifying products
- Product images as separate table for flexibility
- Indexes for common query patterns

## Migration File
Location: `supabase/migrations/20240715000001_initial_schema.sql`

To apply this migration:
```bash
supabase db push
```

## TypeScript Types
Location: `types/index.ts`

All database tables have corresponding TypeScript interfaces with proper typing for:
- Row types (database records)
- Insert types (for creating records)
- Update types (for updating records)
- ENUM types for type-safe status values
