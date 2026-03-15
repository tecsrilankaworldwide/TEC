# Admin Panel User Guide

## Accessing the Admin Panel

### Login
1. Go to: https://electronics-store-tw.preview.emergentagent.com/admin/login
2. Enter password: `admin123`
3. Click "Login"

**Important**: This is a simple password-based authentication for demo purposes. For production, implement proper user authentication with hashed passwords and sessions.

---

## Dashboard

After login, you'll see the admin dashboard with:

### Statistics Cards
- **Total Products**: Number of products in your store
- **Total Orders**: All customer orders
- **Total Revenue**: Total revenue from paid/confirmed/fulfilled orders
- **Pending Orders**: Orders awaiting payment or confirmation

### Quick Actions
- **Add New Product**: Direct link to create a new product
- **View Orders**: Jump to order management

### Store Status
- Current store operational status
- Accepted payment methods
- Shipping configuration

---

## Product Management

### View All Products
**Path**: `/admin/products`

Features:
- See all products with images, prices, and stock levels
- Search products by name
- See badges (DEAL, NEW, Out of Stock)
- Edit or delete products with action buttons

### Add New Product
**Path**: `/admin/products/new`

**Step-by-step**:

1. **Basic Information**
   - Product Name: Full product title (e.g., "MacBook Pro 16\" M3 Pro")
   - Slug: URL-friendly version (click "Generate" to auto-create)
   - Description: Detailed product description

2. **Product Images**
   - Add image URLs (use Unsplash, your own hosting, or Cloudinary)
   - Add multiple images for product gallery
   - Click "Add Image URL" to add more
   - Example: `https://images.unsplash.com/photo-xxx`

3. **Organization**
   - Category: Select from existing categories
   - Brand: Select from existing brands

4. **Pricing**
   - Regular Price: Full price (required)
   - Sale Price: Discounted price (optional)
   - Discount %: Percentage off badge (optional)

5. **Inventory**
   - Stock Quantity: Number of items available

6. **Badges**
   - Mark as Deal: Shows "DEAL" badge
   - Mark as New: Shows "NEW" badge

7. Click **"Create Product"**

### Edit Product
**Path**: `/admin/products/edit/{product_id}`

- Click edit button (pencil icon) on any product
- All fields are pre-filled with current values
- Make changes and click "Update Product"

### Delete Product
- Click delete button (trash icon) on any product
- Confirm deletion
- Product will be permanently removed

---

## Order Management

### View All Orders
**Path**: `/admin/orders`

See all customer orders with:
- Order number
- Customer email
- Number of items
- Total amount
- Order date
- Current status
- Payment method (COD/Stripe)

### Update Order Status

Change order status using dropdown:
- **Pending Payment**: Waiting for payment
- **Paid**: Payment received
- **Confirmed**: Order confirmed, ready to process
- **Fulfilled**: Order completed and delivered
- **Cancelled**: Order cancelled

### View Order Details
- Click eye icon to view full order details
- Opens in new tab showing order tracking page

---

## Tips for Managing Your Store

### Adding Products

**For Electronics Products, include these details**:

1. **Name**: Brand + Model + Key Specs
   - ✅ Good: "Samsung Galaxy S24 Ultra 512GB"
   - ❌ Bad: "Phone"

2. **Description**: 
   - Key features
   - What makes it special
   - Who it's for

3. **Images**: 
   - Use high-quality product images
   - First image is the main thumbnail
   - Add 2-4 images minimum for gallery

4. **Pricing Strategy**:
   - Set regular price higher
   - Use sale price for discounts
   - Discount % shows the savings badge
   - Deal badge attracts attention

5. **Stock Management**:
   - Keep stock updated
   - Set to 0 for out of stock
   - "Out of Stock" badge shows automatically

### Managing Orders

**Daily Workflow**:

1. **Morning**: 
   - Check pending orders
   - Update paid orders to "confirmed"

2. **During Day**:
   - Process confirmed orders
   - Prepare items for shipping

3. **After Shipping**:
   - Update to "fulfilled" once delivered
   - Customer can track status

**For COD Orders**:
- Automatically confirmed on creation
- Payment status shows "pending"
- Mark as "fulfilled" after delivery and payment collection

**For Stripe Orders**:
- Show as "pending_payment" initially
- Auto-update to "paid" when customer completes payment
- Then process normally

---

## Product Image Tips

### Where to Get Product Images

1. **Unsplash** (Free, high-quality)
   - Go to unsplash.com
   - Search for product type
   - Copy image URL
   - Example: `https://images.unsplash.com/photo-1234567890?w=800`

2. **Your Own Images**
   - Upload to Cloudinary (configure in backend/.env)
   - Use any image hosting service
   - Use direct image URLs only

3. **Manufacturer Websites**
   - Download official product images
   - Host them and use the URLs

### Image Best Practices
- Use 800px width minimum
- Keep file size under 500KB
- Use JPG for photos
- Square or 16:9 ratio works best

---

## Common Tasks

### Change Admin Password
Edit `/app/frontend/src/pages/AdminLoginPage.js`:
```javascript
if (password === 'YOUR_NEW_PASSWORD') {
```

### Add New Category
Currently manual via database. To add via code:
```bash
# Use MongoDB or seed_data.py script
```

### Add New Brand
Currently manual via database. To add via code:
```bash
# Use MongoDB or seed_data.py script
```

### Update Shipping Cost
Edit `/app/backend/server.py`:
```python
shipping_cost: float = 15.0  # Change this value
```

---

## Troubleshooting

### Can't Login
- Make sure you're using password: `admin123`
- Clear browser cache and try again
- Check browser console for errors

### Products Not Showing
- Verify MongoDB is running
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Ensure product has valid category_id

### Images Not Loading
- Verify image URLs are direct links to images
- Check URL ends with .jpg, .png, etc.
- Test URL in browser first

### Orders Not Appearing
- Check MongoDB connection
- Verify orders were placed successfully
- Check backend logs for errors

---

## Security Notes

**IMPORTANT for Production**:

1. **Change Default Password**
   - Current: `admin123`
   - Use strong, unique password

2. **Implement Proper Auth**
   - Add user database table
   - Hash passwords (bcrypt)
   - Use JWT tokens or sessions

3. **Add Authorization**
   - Verify admin role on backend
   - Protect admin API endpoints
   - Add middleware for auth checks

4. **Environment Variables**
   - Never commit passwords
   - Use .env for sensitive data
   - Rotate credentials regularly

---

## Next Steps

### Enhancements You Can Add:

1. **Categories Management**
   - Add/Edit/Delete categories from admin
   - Upload category images

2. **Brands Management**
   - Manage brands from admin panel
   - Add brand logos

3. **Analytics**
   - Sales charts
   - Top selling products
   - Revenue trends

4. **Inventory Alerts**
   - Low stock notifications
   - Automatic reorder reminders

5. **Customer Management**
   - View customer list
   - Order history per customer
   - Customer analytics

---

## Support

For technical issues:
1. Check browser console (F12)
2. Check backend logs
3. Verify MongoDB connection
4. Test API endpoints directly

**Quick Links**:
- Store: https://electronics-store-tw.preview.emergentagent.com
- Admin: https://electronics-store-tw.preview.emergentagent.com/admin/login
- GitHub: https://github.com/tecsrilankaworldwide/TEC
