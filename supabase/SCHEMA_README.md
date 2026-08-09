# Feenix Repair - Database Schema Documentation

## Overview

This schema was generated from the existing Feenix Repair Next.js + Supabase codebase. The SQL file is intended to be copied manually into a **new/empty Supabase project** SQL Editor and executed in one run.

## Files

- `supabase/feenix_repair_complete_schema.sql` — the complete schema.
- `supabase/SCHEMA_README.md` — this file.

## How to run

1. Open the Supabase project SQL Editor.
2. Copy the full contents of `feenix_repair_complete_schema.sql`.
3. Execute the script.
4. (Optional) Manually replace the empty `{}` config values in `integrations` with your real API credentials.

## Execution order in the SQL

1. PostgreSQL extensions (`uuid-ossp`, `pgcrypto`).
2. Enum types (`user_role`, `product_status`, `payment_status`, etc.).
3. Tables with primary/foreign keys.
4. Indexes.
5. Helper functions and business-logic functions.
6. Triggers (`updated_at`, inventory sync, order lifecycle, messaging).
7. Row Level Security enablement and policies.
8. Storage bucket (`chat-attachments`) and storage policies.
9. Optional auto-profile-on-signup trigger (commented out).
10. Non-sensitive reference/seed data (`email_settings`, `integrations`, `scheduled_tasks`).

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Users (admins, dealers, buyers/sellers). Linked to `auth.users` by `id`. |
| `categories` | Product category taxonomy. |
| `brands` | Product brands, linked to a category. |
| `models` | Product models, linked to a brand. |
| `products` | Core marketplace listings, linked to dealer + taxonomy. |
| `product_images` | Multiple images per product. |
| `enquiries` | Dealer-to-dealer product enquiries. |
| `warehouses` | Inventory warehouse locations. |
| `inventory` | Real-time stock per product/dealer/warehouse. |
| `inventory_ledger` | Immutable stock history. |
| `inventory_reservations` | Order-level stock reservations. |
| `inventory_transfers` | Dealer/warehouse stock transfers. |
| `low_stock_alerts` | Stock alert records. |
| `orders` | Confirmed purchase orders (one product per row in current design). |
| `order_items` | Order line items (used by forecast/reports). |
| `payments` | Razorpay payment records. |
| `invoices` | Generated invoices linked to orders/payments. |
| `payment_audit_logs` | Payment action audit trail. |
| `notifications` | In-app notifications for users. |
| `notification_preferences` | User notification channel/category preferences. |
| `banners` | Homepage CMS banners. |
| `featured_products` | Curated homepage featured products. |
| `settings` | Site-wide CMS settings. |
| `conversations` | Chat conversation containers. |
| `conversation_participants` | Users in each conversation. |
| `messages` | Chat messages (conversation-based, used by `lib/chat/actions.ts`). |
| `message_read_receipts` | Per-user read/delivered receipts. |
| `typing_indicators` | Live typing status. |
| `user_presence` | Online/last-seen presence. |
| `conversation_reports` | Conversation moderation reports. |
| `email_templates` | Resend email HTML templates. |
| `email_settings` | Resend/global email configuration. |
| `email_logs` | Sent email history. |
| `email_queue` | Pending/outbound email queue. |
| `integrations` | Third-party integration config (Resend, Razorpay, etc.). |
| `webhooks` | Outgoing webhook definitions. |
| `webhook_logs` | Webhook delivery attempts. |
| `api_keys` | Admin API keys. |
| `api_key_usage_logs` | API key request logs. |
| `system_jobs` | Background job queue. |
| `scheduled_tasks` | Recurring task schedule. |
| `system_audit_logs` | System audit trail. |
| `activity_logs` | General user/entity activity timeline. |

## Enums

- `user_role` — `ADMIN`, `DEALER`
- `product_status` — `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`
- `enquiry_status` — `PENDING`, `ASSIGNED`, `ACCEPTED`, `REJECTED`, `COMPLETED`
- `order_status` — `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- `payment_status` — `PENDING`, `CREATED`, `AUTHORIZED`, `CAPTURED`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`
- `inventory_movement_type` — `PURCHASE`, `SALE`, `RESERVATION`, `RELEASE`, `TRANSFER`, `ADJUSTMENT`, `RETURN`, `DAMAGE`, `LOST`
- `inventory_transfer_status` — `PENDING`, `APPROVED`, `REJECTED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`
- `inventory_alert_level` — `CRITICAL`, `LOW`, `RECOMMENDED`
- `inventory_reservation_status` — `RESERVED`, `DEDUCTED`, `RELEASED`, `RETURNED`
- `conversation_type` — `direct`, `group`, `support`
- `conversation_context_type` — `enquiry`, `order`, `payment`, `profile`
- `message_type` — `text`, `image`, `pdf`, `invoice`, `quotation`, `order_link`, `payment_link`, `location`

## Key relationships

- `profiles` is the central identity table. All user-facing tables reference `profiles` or `auth.users`.
- `products` → `profiles` (dealer), `categories`, `brands`, `models`.
- `orders` → `profiles` (buyer, seller), `products`.
- `order_items` → `orders`, `products`.
- `payments` / `invoices` → `orders`, `profiles`.
- `inventory` and ledger/reservations/transfers → `products`, `profiles`, `warehouses`.
- `enquiries` → `products`, `profiles` (buyer, seller, assigned_by).
- Chat tables (`conversations`, `messages`, etc.) revolve around `conversation_participants` joining `conversations` and `profiles`.
- Email, integrations, jobs, audit, and storage buckets are admin-only.

## Roles & authorization

- The database only defines `ADMIN` and `DEALER` in the `user_role` enum. This matches `types/index.ts` and `middleware.ts`.
- `super_admin`, `admin`, `moderator`, `support` permission granularity exists in `lib/auth/admin-permissions.ts` but is not enforced at the database level.
- "Customer" is not a separate database role; buyers are represented by `buyer_id` / `customer_id` foreign keys in `orders` and `payments`.
- RLS policies restrict data so dealers only access their own inventory/orders/products, admins can manage everything, and chat/messages are scoped to conversation participants.

## RLS policies

A dedicated policy set is provided for every table:
- Public catalog tables (`categories`, `brands`, `models`, `banners`, `featured_products`, `settings`) are readable by public/anonymous users when active.
- `products` and `product_images` are public for active listings; dealers may manage their own; admins have full access.
- `orders`, `enquiries`, `payments`, `invoices` are visible to the buyer, seller, and admin.
- All inventory tables are visible to the owning dealer and fully accessible to admins.
- Chat is scoped to conversation participants.
- Email, integrations, webhooks, API keys, jobs, and audit tables are admin-only.

## Storage

- One storage bucket is created: `chat-attachments`.
- Storage policies restrict downloads to conversation participants and allow authenticated uploads.

## Optional profile-on-signup trigger

The SQL includes a commented-out `handle_new_user()` trigger on `auth.users`. It is **disabled by default** because the current application expects profile rows to be created by the caller (see `scripts/setup-demo-users.ts` and `app/auth/actions.ts`). If you want automatic profile creation on every new auth user, uncomment the final block in the SQL.

## Manual configuration after running

1. **Integrations**: update `public.integrations.config` JSON with real API keys (Razorpay key IDs, Resend API key, etc.). No secrets are stored in the SQL file.
2. **Auth users**: create dealer/admin accounts in Supabase Auth, then insert matching rows into `profiles` (or enable the commented auto-profile trigger).
3. **Storage**: enable the `chat-attachments` bucket public/private setting as required by your application.
4. **Realtime**: the SQL does not add tables to the `supabase_realtime` publication. If you use realtime, run the following manually or add it before seed data:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.messages, public.conversations, public.notifications;
   ```

## Assumptions

- The schema is for a **new/empty database**.
- `messages` is the conversation-based table used by `lib/chat/actions.ts`, not the older one-to-one `sender_id/receiver_id` table shown in `types/index.ts`.
- `order_items` is referenced only minimally in `lib/forecast/actions.ts` and `lib/reports/actions.ts`; a conventional order-line schema is provided.
- All monetary columns use `DECIMAL(12, 2)`.
- `user_role` contains only `ADMIN` and `DEALER` because that is the only enum the current application relies on at the database layer.

## Uncertainties

- `order_items` exact columns are not fully defined by the existing code; the schema uses a conventional design that should satisfy `select("*")`.
- No table currently stores `customer` as a distinct role; it is represented relationally through `buyer_id`/`customer_id`.
- The `types/index.ts` `Database` type is slightly out of sync with the real runtime schema (e.g., `messages`); the SQL follows the actual queries in the source code.
- Product and banner images are stored as URLs (`image_url`, `image` columns), not Supabase Storage objects, except for chat attachments.

## Totals

- **TOTAL TABLES:** 43
- **TOTAL ENUMS:** 12
- **TOTAL FUNCTIONS:** 17
- **TOTAL TRIGGERS:** 28
- **TOTAL INDEXES:** 116
- **TOTAL RLS POLICIES:** 84
- **TOTAL STORAGE BUCKETS:** 1
