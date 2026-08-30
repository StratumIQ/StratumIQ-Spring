# Parts module status

Last updated: 30 Aug 2026

Product decisions already locked:

- Crushing / screening aftermarket catalog (not elevator-specific).
- Quote inquiry via existing support tickets. **No cart, checkout, or payments.**
- Reuse existing auth, upload, dashboard UI, and master-data tables.

---

## Done

### Database

- `V12`–`V18`: `parts`, images, documents, categories, brands, manufacturers, units of measure.
- `V19`: category `parent_id`, `part_attributes`, unique SKU/slug indexes, drop leftover string columns, seed aftermarket categories and units.

### Backend

- Listing model: price, stock, OEM/aftermarket type, dimensions, warranty, status, featured, flexible attributes, multiple images.
- **Catalog** (authenticated): `GET /api/parts`, `GET /api/parts/{id}`, related, `POST /api/parts/{id}/inquiries`.
- **Dealer** (DEALER only): CRUD + images on `/api/dealer/parts`. Owner is JWT `userId`. Other dealers get **403**.
- **Admin**: `/api/admin/parts` for any listing; create requires a dealer user id.
- Master data admin/read APIs for categories, brands, manufacturers, UoM.
- Upload folder `parts` on existing `/api/upload`.
- Search/filter/sort/pagination on catalog and admin lists.

### Frontend

- API client: `frontend/src/lib/api/parts.ts`
- Shared pieces: `PartCard`, `PartGallery`, `PartImageManager`
- Image upload helper supports `folder=parts`
- User catalog, product detail, and quote-inquiry flows.
- Dealer listing management: list, create, edit, and archive.
- Admin listing management and editable master-data management for categories, brands, manufacturers, and units.
- CSV import/export for dealer and admin listings. Imports validate master-data names before creation and default to draft status.

---

## Pending (this continuation)

| Item | Status |
|---|---|
| User catalog page | Complete |
| Product detail + inquiry form | Complete |
| Dealer My listings / add / edit | Complete |
| Admin listings + master-data UI + sidebar | Complete |
| Parts CSS (cards, gallery, form) | Complete |
| Backend ownership tests | Complete |
| Lint / Maven compile | Complete |

**Out of scope for this module**

- Cart, orders, payments, wishlist, reviews, fake “popular” sort.

---

## How to try it (after this work lands)

1. Run Flyway so `V19` applies (it has been verified against the local development database).
2. **Admin**: create a `DEALER` user, seed/create categories if needed, create a listing with images.
3. **Dealer**: Dashboard → Parts → My listings → add a part.
4. **User**: Dashboard → Parts → search/filter → open a part → Request quote (creates a support ticket).
