# TW TECH STORE — plan.md

## Objectives
- Ensure **all customer/admin-facing prices** display in **LKR** using `Rs.` consistently (no `$` anywhere in UI).
- Replace insecure client-side admin “password check” with **server-side hashed password + JWT**.
- Centralize currency formatting to prevent regressions.
- Validate end-to-end flows with comprehensive tests; document any blocked items.

## Implementation Steps

### Phase 1 — Core Flow Verification (POC / Integration checks)
User stories:
1. As an admin, I can log in and receive a token that lets me access protected admin APIs.
2. As a non-authenticated user, I’m blocked from `/api/admin/*` endpoints.
3. As a shopper, I always see `Rs.` for prices on product cards and product details.
4. As a shopper, I see `Rs.` in cart/checkout totals and line items.
5. As a store owner, I can confirm currency display and admin auth via quick smoke tests.

Steps:
- Verify backend admin auth endpoints:
  - `POST /api/admin/login` with correct password returns JWT.
  - `/api/admin/*` returns **401/403** without token; returns data with token.
- Verify key UI screens show `Rs.`:
  - Products list, product detail, cart, checkout, order success, order tracking, admin dashboard.

### Phase 2 — V1 App Hardening (Currency + Admin Auth)
User stories:
1. As a shopper, I can browse products and never see `$` anywhere.
2. As a shopper, I can adjust filters and see the price range in `Rs.`.
3. As an admin, I can log in without exposing the password in client code.
4. As an admin, I can access orders/invoices/GRN/GTN/credit notes/gatepass only when logged in.
5. As an admin, I can log out and be immediately blocked from admin pages.

Steps:
- Currency Fix (completed):
  - Replace hardcoded `$` displays across frontend pages/components with `Rs.`.
  - Confirm on: PLP slider, PDP price/strike-through, cart lines, checkout summary, invoices/print pages, admin panels.
- Admin Security (completed):
  - Backend: add JWT auth + bcrypt hashing; add `/api/admin/login`.
  - Protect all `/api/admin/*` routes with JWT dependency.
  - Frontend: update admin login to call backend, store JWT, and enforce route protection via token validation.

### Phase 3 — Maintainability Improvements (Currency Utility)
User stories:
1. As a developer, I can format any price using one helper to avoid inconsistent UI.
2. As a developer, I can format negative prices (credit notes) consistently.
3. As a QA tester, I can verify one place controls currency symbol.
4. As a maintainer, I can update currency once without hunting through files.
5. As an admin, I see consistent currency formatting across dashboards and documents.

Steps:
- Create `src/utils/currency.js` (completed):
  - `CURRENCY_SYMBOL = 'Rs.'`, `CURRENCY_CODE = 'LKR'`, `formatPrice()`, `formatNegativePrice()`.
- (Optional follow-up) Refactor UI to use `formatPrice()` everywhere for consistent spacing/format.

### Phase 4 — Comprehensive Testing & Regression Checks
User stories:
1. As a shopper, I can complete cart → checkout flows without currency regressions.
2. As a shopper, order success/tracking pages show totals in `Rs.`.
3. As an admin, I can view dashboard and management pages only when authenticated.
4. As a security reviewer, I see no hardcoded admin password checks in frontend.
5. As a team, we can trust changes via repeatable tests.

Steps:
- Run automated backend tests for auth + admin protection.
- Run UI smoke tests (playwright/screenshots) for:
  - Product list/detail
  - Cart/checkout
  - Admin login/dashboard + logout
- Record results and verify no `$` remains.

## Next Actions
- Cloudinary Image Upload (blocked):
  - Provide Cloudinary env vars in backend `.env`:
    - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - Then implement admin-side image upload flow using existing `/api/cloudinary/signature` endpoint.
- Optional security hardening:
  - Move `ADMIN_PASSWORD_HASH` to env (`ADMIN_PASSWORD_HASH`) to avoid regenerating on boot.
  - Add token refresh / shorter expiry if needed.
- Optional currency formatting improvement:
  - Refactor price rendering to use `formatPrice()` uniformly.

## Success Criteria
- No `$` appears anywhere in the UI; all monetary values use `Rs.`.
- `POST /api/admin/login` returns JWT on correct password and 401 on wrong password.
- All `/api/admin/*` endpoints require `Authorization: Bearer <token>`.
- Admin pages redirect to `/admin/login` when unauthenticated; logout clears access.
- Test suite + UI smoke tests pass (current status: **100%** backend/frontend per latest run).
- Cloudinary integration is either implemented with provided credentials or explicitly tracked as blocked.