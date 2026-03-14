# plan.md

## Objectives
- Deliver an e-commerce platform like **takas.lk** for **electronics/electrical/tech gadgets** using **React + shadcn/ui**, **FastAPI**, **MongoDB**.
- Prove the **core commerce flow** works end-to-end: browse → search/filter → product details → cart → checkout → payment (Stripe/PayPal/COD) → order created → order tracking.
- Provide a full **admin console**: catalog, inventory, pricing/promotions, orders, users.
- Build in phases: **POC (payments+order state)** → **V1 app (core shopping without auth)** → **feature expansion (auth, admin, promos, wishlist, tracking polish)** → **hardening/testing**.

---

## Implementation Steps

### Phase 1 — Core Flow POC (Isolation)
Focus: de-risk the most failure-prone part (**payments + order state transitions + webhooks**).

**User stories (POC)**
1. As a shopper, I can create an order draft from a cart total so checkout can begin.
2. As a shopper, I can pay via Stripe and receive a confirmed order on success.
3. As a shopper, I can pay via PayPal and receive a confirmed order on success.
4. As a shopper, I can choose Cash on Delivery and receive a confirmed order immediately.
5. As the system, I can reliably update order status from payment webhooks/callbacks.

**Steps**
- Web research: Stripe Payment Intents + webhooks best practices; PayPal Orders API + webhooks; idempotency + signature verification.
- Define minimal order/payment state model: `DRAFT → PENDING_PAYMENT → PAID/CONFIRMED → FULFILLED → CANCELLED/REFUNDED`.
- Create standalone Python scripts:
  - Stripe: create payment intent, simulate success, hit webhook handler (local test), verify status update.
  - PayPal: create order, capture, verify webhook/callback updates.
- Build minimal FastAPI POC endpoints:
  - `POST /poc/orders` create draft
  - `POST /poc/stripe/create-intent`
  - `POST /poc/paypal/create-order` + `POST /poc/paypal/capture`
  - `POST /webhooks/stripe` + `POST /webhooks/paypal` (signature verified)
- Fix until stable: retries, webhook idempotency, duplicate event handling, mismatch totals, cancelled payments.

**Exit criteria**
- Stripe + PayPal sandbox flows update MongoDB order status correctly; COD flow creates confirmed order; webhook verification passes.

---

### Phase 2 — V1 App Development (MVP, core shopping; delay auth)
Focus: working store UX around proven payment core; keep scope tight.

**User stories (V1)**
1. As a shopper, I can browse categories and see product cards with price, discount, and stock status.
2. As a shopper, I can search and filter products (category, brand, price range, availability).
3. As a shopper, I can view a product page with image gallery, specs, and related items.
4. As a shopper, I can add/update/remove items in cart and see totals instantly.
5. As a shopper, I can checkout and place an order using Stripe/PayPal/COD.

**Backend (FastAPI + MongoDB)**
- Data models (MVP): Product, Category, Brand, Inventory, Cart (guest session), Order, Payment.
- Public APIs:
  - Catalog: list/search/filter, product details
  - Cart: CRUD items (guest token)
  - Checkout: create order from cart, initiate payment (Stripe/PayPal/COD)
  - Order tracking (by order number + email/phone for guest)
- Implement pricing fields: regular price, sale price, discount %, deal badge.

**Frontend (React + shadcn/ui)**
- Pages: Home (deals/new), Category listing, Search results, Product detail, Cart, Checkout, Order success, Track order.
- UX states: loading/empty/error; out-of-stock handling; persistent cart via localStorage + guest token.
- Payment UI: Stripe checkout confirmation, PayPal redirect/approve, COD form.

**Testing checkpoint (end of phase)**
- One full E2E pass: browse → add to cart → checkout via each payment method → order shows trackable status.

---

### Phase 3 — Feature Expansion (Auth, Admin, Wishlist, Deals mgmt)
Focus: add “ALL features” while keeping core stable.

**User stories (Expansion)**
1. As a customer, I can register/login and see my order history.
2. As a customer, I can add/remove items to a wishlist and move them to cart.
3. As an admin, I can create/edit products with images, specs, categories, brands, and SEO fields.
4. As an admin, I can manage orders (status updates, cancellations, refunds notes).
5. As an admin, I can create deals (sale price, start/end dates) and feature them on the homepage.

**Auth (delayed until now; confirm with user before implementing)**
- JWT auth with roles: `admin`, `customer`.
- Secure routes; server-side authorization checks.

**Admin dashboard**
- Catalog management: products/categories/brands, bulk import (CSV optional).
- Inventory: stock adjustments, low-stock alerts.
- Orders: timeline, status transitions, payment info, shipping notes.
- Users: list, role management, disable accounts.

**Wishlist**
- Per-user wishlist; for guests optionally localStorage wishlist (nice-to-have).

**Order tracking (full)**
- Status timeline + tracking events; customer view + admin updates.

**Testing checkpoint**
- E2E: authenticated purchase; admin edits product; create deal; wishlist to checkout; order status updates visible to customer.

---

### Phase 4 — Hardening, QA, and Release Readiness

**User stories (QA/Release)**
1. As a shopper, I never get charged twice even if I refresh or retry payment.
2. As a shopper, I can recover my cart after returning to the site.
3. As an admin, I can audit payment events and order state changes.
4. As the business, I can configure shipping fees/regions and see correct totals.
5. As a customer, I can contact support and reference an order number easily.

**Steps**
- Add idempotency keys to checkout + payment creation.
- Add structured logging + admin-visible order/payment event audit.
- Security: input validation, rate limits on auth, webhook secret rotation plan.
- Performance: pagination, indexed queries, image CDN/storage choice.
- Automated tests: API unit tests + a small set of E2E flows.
- Final regression testing across devices.

---

## Next Actions
1. Confirm sandbox credentials availability: **Stripe**, **PayPal**, and COD rules (regions, fees).
2. Decide product image storage: local (POC) vs S3/R2/Cloudinary (recommended for V1+).
3. Approve Phase 1 POC scope (payments + webhooks + order state) before UI work.
4. Provide initial catalog seed preference: minimal demo set (20–50 products) vs full import later.
5. Confirm shipping model for V1: flat rate vs per-region vs weight-based.

---

## Success Criteria
- POC: Stripe + PayPal sandbox payments + webhooks reliably update order status in MongoDB with idempotency.
- V1: Users can browse/search/filter, manage cart, checkout with Stripe/PayPal/COD, and track orders.
- Expansion: Auth + admin + wishlist + deals work without breaking checkout/order integrity.
- QA: No double-charges, consistent order states, acceptable performance for catalog browsing, and clean regression pass.