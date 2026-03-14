from fastapi import FastAPI, HTTPException, Request, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.utils
import time
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    CheckoutStatusResponse
)

load_dotenv()

app = FastAPI(title="Electronics Store API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['ecommerce_store']

# Collections
products_collection = db['products']
categories_collection = db['categories']
brands_collection = db['brands']
carts_collection = db['carts']
orders_collection = db['orders']
payments_collection = db['payment_transactions']
users_collection = db['users']

# Cloudinary Config
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', ''),
    api_key=os.getenv('CLOUDINARY_API_KEY', ''),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', ''),
    secure=True
)

# Stripe Config
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY', 'sk_test_emergent')

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id':
                result['id'] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(v) if isinstance(v, (dict, list)) else v for v in value]
            else:
                result[key] = value
        return result
    return doc

# Pydantic Models
class Product(BaseModel):
    name: str
    slug: str
    description: str
    category_id: str
    brand_id: Optional[str] = None
    images: List[str]
    regular_price: float
    sale_price: Optional[float] = None
    discount_percent: Optional[int] = None
    stock: int = 0
    is_deal: bool = False
    is_new: bool = False
    specs: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Category(BaseModel):
    name: str
    slug: str
    parent_id: Optional[str] = None
    image: Optional[str] = None

class Brand(BaseModel):
    name: str
    slug: str
    logo: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    session_id: str
    items: List[CartItem]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    postal_code: Optional[str] = None

class OrderCreate(BaseModel):
    session_id: str
    email: EmailStr
    shipping_address: ShippingAddress
    payment_method: str  # 'stripe' or 'cod'
    shipping_cost: float = 0.0

class CheckoutSession(BaseModel):
    order_id: str
    origin_url: str

# API Routes

@app.get("/")
def read_root():
    return {"message": "Electronics Store API", "status": "running"}

# Categories
@app.get("/api/categories")
async def get_categories():
    categories = await categories_collection.find().to_list(100)
    return serialize_doc(categories)

@app.post("/api/categories")
async def create_category(category: Category):
    result = await categories_collection.insert_one(category.dict())
    return {"id": str(result.inserted_id)}

# Brands
@app.get("/api/brands")
async def get_brands():
    brands = await brands_collection.find().to_list(100)
    return serialize_doc(brands)

# Products
@app.get("/api/products")
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    is_deal: Optional[bool] = None,
    is_new: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 20
):
    query = {}
    
    if category:
        query['category_id'] = category
    if brand:
        query['brand_id'] = brand
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    if is_deal is not None:
        query['is_deal'] = is_deal
    if is_new is not None:
        query['is_new'] = is_new
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price:
            price_query['$gte'] = min_price
        if max_price:
            price_query['$lte'] = max_price
        query['regular_price'] = price_query
    
    total = await products_collection.count_documents(query)
    products = await products_collection.find(query).skip(skip).limit(limit).to_list(limit)
    
    return {
        'products': serialize_doc(products),
        'total': total,
        'skip': skip,
        'limit': limit
    }

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    try:
        product = await products_collection.find_one({'_id': ObjectId(product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return serialize_doc(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/products")
async def create_product(product: Product):
    product_dict = product.dict()
    result = await products_collection.insert_one(product_dict)
    return {"id": str(result.inserted_id)}

# Cart
@app.get("/api/cart/{session_id}")
async def get_cart(session_id: str):
    cart = await carts_collection.find_one({'session_id': session_id})
    if not cart:
        return {'session_id': session_id, 'items': []}
    
    # Enrich with product details
    enriched_items = []
    for item in cart.get('items', []):
        product = await products_collection.find_one({'_id': ObjectId(item['product_id'])})
        if product:
            enriched_items.append({
                'product_id': item['product_id'],
                'quantity': item['quantity'],
                'product': serialize_doc(product)
            })
    
    return {
        'session_id': session_id,
        'items': enriched_items
    }

@app.post("/api/cart/{session_id}/items")
async def add_to_cart(session_id: str, item: CartItem):
    cart = await carts_collection.find_one({'session_id': session_id})
    
    if cart:
        # Update existing cart
        items = cart.get('items', [])
        existing_item = next((i for i in items if i['product_id'] == item.product_id), None)
        
        if existing_item:
            existing_item['quantity'] += item.quantity
        else:
            items.append(item.dict())
        
        await carts_collection.update_one(
            {'session_id': session_id},
            {'$set': {'items': items, 'updated_at': datetime.utcnow()}}
        )
    else:
        # Create new cart
        await carts_collection.insert_one({
            'session_id': session_id,
            'items': [item.dict()],
            'updated_at': datetime.utcnow()
        })
    
    return {'message': 'Item added to cart'}

@app.put("/api/cart/{session_id}/items/{product_id}")
async def update_cart_item(session_id: str, product_id: str, quantity: int):
    if quantity <= 0:
        # Remove item
        await carts_collection.update_one(
            {'session_id': session_id},
            {'$pull': {'items': {'product_id': product_id}}, '$set': {'updated_at': datetime.utcnow()}}
        )
    else:
        # Update quantity
        await carts_collection.update_one(
            {'session_id': session_id, 'items.product_id': product_id},
            {'$set': {'items.$.quantity': quantity, 'updated_at': datetime.utcnow()}}
        )
    
    return {'message': 'Cart updated'}

@app.delete("/api/cart/{session_id}/items/{product_id}")
async def remove_from_cart(session_id: str, product_id: str):
    await carts_collection.update_one(
        {'session_id': session_id},
        {'$pull': {'items': {'product_id': product_id}}, '$set': {'updated_at': datetime.utcnow()}}
    )
    return {'message': 'Item removed from cart'}

@app.delete("/api/cart/{session_id}")
async def clear_cart(session_id: str):
    await carts_collection.delete_one({'session_id': session_id})
    return {'message': 'Cart cleared'}

# Orders
@app.post("/api/orders")
async def create_order(order_data: OrderCreate):
    # Get cart
    cart = await carts_collection.find_one({'session_id': order_data.session_id})
    if not cart or not cart.get('items'):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate totals
    subtotal = 0
    order_items = []
    
    for item in cart['items']:
        product = await products_collection.find_one({'_id': ObjectId(item['product_id'])})
        if not product:
            continue
        
        price = product.get('sale_price') or product.get('regular_price')
        item_total = price * item['quantity']
        subtotal += item_total
        
        order_items.append({
            'product_id': str(product['_id']),
            'name': product['name'],
            'quantity': item['quantity'],
            'price': price,
            'total': item_total,
            'image': product['images'][0] if product.get('images') else None
        })
    
    total = subtotal + order_data.shipping_cost
    
    # Create order
    order = {
        'order_number': f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}" ,
        'customer_email': order_data.email,
        'shipping_address': order_data.shipping_address.dict(),
        'items': order_items,
        'subtotal': subtotal,
        'shipping_cost': order_data.shipping_cost,
        'total': total,
        'payment_method': order_data.payment_method,
        'status': 'confirmed' if order_data.payment_method == 'cod' else 'pending_payment',
        'payment_status': 'pending',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = await orders_collection.insert_one(order)
    order['_id'] = result.inserted_id
    
    # Clear cart
    await carts_collection.delete_one({'session_id': order_data.session_id})
    
    return serialize_doc(order)

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    try:
        order = await orders_collection.find_one({'_id': ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return serialize_doc(order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/orders/track/{order_number}")
async def track_order(order_number: str, email: Optional[str] = None):
    query = {'order_number': order_number}
    if email:
        query['customer_email'] = email
    
    order = await orders_collection.find_one(query)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return serialize_doc(order)

# Stripe Payment
@app.post("/api/payments/checkout")
async def create_checkout_session(checkout_data: CheckoutSession):
    # Get order
    try:
        order = await orders_collection.find_one({'_id': ObjectId(checkout_data.order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Initialize Stripe
        webhook_url = f"{checkout_data.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Create checkout session
        success_url = f"{checkout_data.origin_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{checkout_data.origin_url}/checkout"
        
        checkout_request = CheckoutSessionRequest(
            amount=float(order['total']),
            currency='usd',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'order_id': str(order['_id']),
                'order_number': order['order_number']
            }
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction
        await payments_collection.insert_one({
            'order_id': str(order['_id']),
            'session_id': session.session_id,
            'amount': order['total'],
            'currency': 'usd',
            'payment_method': 'stripe',
            'payment_status': 'initiated',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        })
        
        return {'url': session.url, 'session_id': session.session_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    try:
        # Initialize Stripe
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        
        # Get checkout status
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment transaction
        payment = await payments_collection.find_one({'session_id': session_id})
        if payment:
            new_payment_status = 'paid' if status.payment_status == 'paid' else 'pending'
            
            # Update payment only if status changed
            if payment.get('payment_status') != new_payment_status:
                await payments_collection.update_one(
                    {'session_id': session_id},
                    {'$set': {'payment_status': new_payment_status, 'updated_at': datetime.utcnow()}}
                )
                
                # Update order status
                order_id = payment.get('order_id')
                if order_id and new_payment_status == 'paid':
                    await orders_collection.update_one(
                        {'_id': ObjectId(order_id)},
                        {'$set': {'status': 'paid', 'payment_status': 'paid', 'updated_at': datetime.utcnow()}}
                    )
        
        return {
            'status': status.status,
            'payment_status': status.payment_status,
            'amount_total': status.amount_total,
            'currency': status.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get('Stripe-Signature', '')
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update payment and order status
        if webhook_response.event_type == 'checkout.session.completed':
            payment = await payments_collection.find_one({'session_id': webhook_response.session_id})
            if payment:
                await payments_collection.update_one(
                    {'session_id': webhook_response.session_id},
                    {'$set': {'payment_status': 'paid', 'updated_at': datetime.utcnow()}}
                )
                
                order_id = payment.get('order_id')
                if order_id:
                    await orders_collection.update_one(
                        {'_id': ObjectId(order_id)},
                        {'$set': {'status': 'paid', 'payment_status': 'paid', 'updated_at': datetime.utcnow()}}
                    )
        
        return {'status': 'success'}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Cloudinary signature
@app.get("/api/cloudinary/signature")
async def generate_cloudinary_signature(
    resource_type: str = Query('image', regex="^(image|video)$"),
    folder: str = 'products'
):
    timestamp = int(time.time())
    params = {
        'timestamp': timestamp,
        'folder': folder,
        'resource_type': resource_type
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.getenv('CLOUDINARY_API_SECRET', '')
    )
    
    return {
        'signature': signature,
        'timestamp': timestamp,
        'cloud_name': os.getenv('CLOUDINARY_CLOUD_NAME', ''),
        'api_key': os.getenv('CLOUDINARY_API_KEY', ''),
        'folder': folder,
        'resource_type': resource_type
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
