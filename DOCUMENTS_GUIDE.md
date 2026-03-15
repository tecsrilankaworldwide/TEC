# TW TECH STORE - Complete E-Commerce Platform

## 🎯 Store Branding
**Name:** TW TECH STORE  
**Tagline:** ELECTRONICS STORE  
**Contact:** support@twtech.lk | +94 11 234 5678  
**Location:** Colombo, Sri Lanka

---

## 🌟 Complete Features

### Customer-Facing Store
✅ **Product Catalog** - 29 electronics products across 6 categories  
✅ **Shopping Cart** - Session-based with real-time updates  
✅ **Checkout** - Stripe + Cash on Delivery options  
✅ **Order Tracking** - Track by order number  
✅ **Search & Filters** - By category, brand, price range  
✅ **Deals & Discounts** - Flash deals and new arrivals  
✅ **Mobile Responsive** - Works perfectly on all devices  

### Admin Management Portal
✅ **Dashboard** - Statistics, revenue, pending orders  
✅ **Product Management** - Full CRUD operations  
✅ **Order Management** - View, update status, manage orders  
✅ **Document Management:**
   - **Invoices** - Professional invoices for paid orders
   - **GRN (Goods Received Note)** - Track inventory from suppliers
   - **GTN (Goods Transfer Note)** - Inter-location transfers
   - **Credit Notes** - Returns, refunds, price adjustments
   - **Gatepass** - Authorize goods movement in/out

---

## 📋 Document Templates

### 1. INVOICE
**Purpose:** Customer billing for completed orders  
**Features:**
- Professional TW TECH branding
- Customer & billing information
- Itemized product list with quantities
- Subtotal, shipping, and total calculations
- Payment method (Stripe/COD)
- Print-friendly format
- Auto-generated invoice numbers (ORD-YYYYMMDDHHMMSS)

**Access:** Admin → Invoices → Select Order → View/Print

---

### 2. GRN (Goods Received Note)
**Purpose:** Document goods received from suppliers  
**Features:**
- Supplier information tracking
- Purchase order number reference
- Received date logging
- Itemized list with quantities and unit prices
- Total value calculation
- Quality control notes

**Workflow:**
1. Supplier delivers goods
2. Create GRN documenting received items
3. Verify quantities and condition
4. Update inventory accordingly
5. File for accounting records

**Access:** Admin → GRN → New GRN

---

### 3. GTN (Goods Transfer Note)
**Purpose:** Track inventory transfers between locations  
**Features:**
- From/To location tracking
- Transfer date and personnel
- Item list with quantities
- Item condition tracking
- Status tracking (Pending/In Transit/Delivered)
- Transfer authorization

**Workflow:**
1. Initiate transfer request
2. Create GTN with item details
3. Mark as "In Transit" when shipped
4. Update to "Delivered" on receipt
5. Receiving location confirms items

**Access:** Admin → GTN → New GTN

---

### 4. CREDIT NOTE
**Purpose:** Issue credits for returns, refunds, or adjustments  
**Features:**
- Link to original invoice
- Customer information
- Credit reason selection (Return/Damaged/Defective/Price Adjustment)
- Negative amount display (-$XX.XX)
- Status tracking (Draft/Pending/Approved/Processed)
- Notes and terms

**Use Cases:**
- Product returns
- Damaged goods received
- Defective products
- Price corrections
- Post-sale discounts
- Refund processing

**Workflow:**
1. Customer requests return/refund
2. Create credit note from order
3. Approve credit amount
4. Process refund or account credit
5. Update inventory

**Access:** Admin → Credit Notes → New Credit Note

---

### 5. GATEPASS
**Purpose:** Authorize and track goods entering/leaving premises  
**Features:**
- Person & vehicle identification
- Movement type (Outgoing/Incoming/Temporary)
- Purpose documentation
- Validity period (Issue date → Valid until)
- Item list with serial numbers
- Condition tracking
- Status (Pending/Approved/Returned)
- Security authorization

**Use Cases:**
- Customer deliveries (Outgoing)
- Supplier deliveries (Incoming)
- Equipment loans (Temporary - must return)
- Repairs out for service
- Security checkpoint verification

**Workflow:**
1. Request gatepass for movement
2. List all items leaving/entering
3. Get approval
4. Security checks at gate
5. Mark as returned (if temporary)

**Access:** Admin → Gatepass → New Gatepass

---

## 🔐 Admin Access
**URL:** https://electronics-store-tw.preview.emergentagent.com/admin/login  
**Password:** admin123

---

## 📊 Document Numbers Format

| Document | Format | Example |
|----------|--------|---------|
| Invoice | ORD-YYYYMMDDHHMMSS | ORD-20260314153045 |
| GRN | GRN-YYYYMMDDHHMMSS | GRN-20260314153045 |
| GTN | GTN-YYYYMMDDHHMMSS | GTN-20260314153045 |
| Credit Note | CN-YYYYMMDDHHMMSS | CN-20260314153045 |
| Gatepass | GP-YYYYMMDDHHMMSS | GP-20260314153045 |

---

## 🎨 Design Features

### Branding
- **Logo:** CPU chip icon in gradient (Primary → Accent)
- **Typography:** 
  - Headings: Space Grotesk (Bold, Tracking-tight)
  - Body: Inter (Clean, Modern)
- **Colors:**
  - Primary: Ocean Teal
  - Accent: Complementary gradient
  - Deals: Red-Orange (#FF5722)
  - Success: Green (#2E7D32)

### Professional Documents
- Clean, corporate design
- Print-optimized layouts
- Color-coded elements
- QR codes ready (future enhancement)
- Barcode support (future enhancement)
- Digital signature fields (future enhancement)

---

## 🚀 Quick Start Guides

### Create Invoice
1. Go to Admin → Orders
2. Find paid/confirmed order
3. Go to Admin → Invoices
4. Click order → View
5. Print or download PDF

### Process Return (Credit Note)
1. Admin → Credit Notes → New
2. Select order (optional - loads data)
3. Enter customer details
4. Select reason (Return/Damaged/etc.)
5. Add items being credited
6. Set status to Approved
7. Create Credit Note
8. Print for records

### Receive Goods (GRN)
1. Admin → GRN → New GRN
2. Enter supplier information
3. Enter PO number (if applicable)
4. Add received items with quantities
5. Note unit prices
6. Add inspection notes
7. Create GRN
8. Update inventory in Products

### Transfer Stock (GTN)
1. Admin → GTN → New GTN
2. Enter From → To locations
3. List items to transfer
4. Set transfer date
5. Assign transferred by/received by
6. Create GTN
7. Print and attach to shipment
8. Update status when delivered

### Issue Gatepass
1. Admin → Gatepass → New Gatepass
2. Enter person & vehicle details
3. Select movement type
4. List all items
5. Set validity period
6. Add security notes
7. Create and print
8. Security verifies at gate

---

## 📱 Mobile Access
All features are mobile-responsive:
- Storefront shopping
- Admin dashboard (tablet recommended)
- Document viewing
- Quick status updates

---

## 🔧 Technical Details

### Backend Endpoints
```
# Documents
GET    /api/admin/invoices (from orders)
GET    /api/admin/grn
POST   /api/admin/grn
GET    /api/admin/gtn
POST   /api/admin/gtn
GET    /api/admin/credit-notes
POST   /api/admin/credit-notes
GET    /api/admin/gatepass
POST   /api/admin/gatepass
```

### Database Collections
- `orders` - Customer orders
- `grn` - Goods received notes
- `gtn` - Goods transfer notes
- `credit_notes` - Credit notes
- `gatepass` - Gatepass records

---

## 📈 Future Enhancements

### Documents
- [ ] PDF generation (server-side)
- [ ] Email invoices to customers
- [ ] Bulk print multiple documents
- [ ] Document templates customization
- [ ] Digital signatures
- [ ] Barcode/QR code generation
- [ ] Document versioning

### Features
- [ ] Multi-currency support
- [ ] Tax calculations (VAT/GST)
- [ ] Discount codes
- [ ] Customer accounts
- [ ] Loyalty points
- [ ] Product reviews
- [ ] Analytics dashboard
- [ ] Stock alerts
- [ ] Purchase orders
- [ ] Supplier management

---

## 💾 Backup & Security

### Important Data
- Orders (customer & payment info)
- GRN (supplier & inventory data)
- GTN (transfer records)
- Credit Notes (refund records)
- Gatepass (security logs)

### Recommendations
1. Regular MongoDB backups
2. Export documents to PDF archive
3. Secure admin password
4. Enable HTTPS in production
5. Implement audit logs
6. Role-based access control

---

## 📞 Support

**Technical Issues:**
- Check browser console (F12)
- Verify MongoDB connection
- Check backend logs
- Test API endpoints

**Business Questions:**
- Contact: support@twtech.lk
- Phone: +94 11 234 5678

---

## 🎉 Summary

TW TECH STORE is now a complete, professional e-commerce platform with:

✅ Customer Store - Full shopping experience  
✅ Admin Portal - Complete management  
✅ Invoices - Professional billing  
✅ GRN - Supplier goods tracking  
✅ GTN - Inter-location transfers  
✅ Credit Notes - Returns & refunds  
✅ Gatepass - Security authorization  

**All documents are professionally designed, print-ready, and integrated with your inventory and order management system!**

GitHub: https://github.com/tecsrilankaworldwide/TEC  
Live: https://electronics-store-tw.preview.emergentagent.com
