"""
Seed script to add 'Used Quality Phones & Electronics' category and sample used products
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL')

async def seed_used_products():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['ecommerce_store']
    categories = db['categories']
    brands = db['brands']
    products = db['products']

    # Check if category already exists
    existing = await categories.find_one({'slug': 'used-quality-phones-electronics'})
    if existing:
        print("Used category already exists, skipping category creation...")
        cat_id = str(existing['_id'])
    else:
        # Create the new category
        cat_result = await categories.insert_one({
            'name': 'Used Quality Phones & Electronics',
            'slug': 'used-quality-phones-electronics',
            'image': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
            'created_at': datetime.now(timezone.utc)
        })
        cat_id = str(cat_result.inserted_id)
        print(f"Created category: Used Quality Phones & Electronics (ID: {cat_id})")

    # Get brand IDs
    apple = await brands.find_one({'slug': 'apple'})
    samsung = await brands.find_one({'slug': 'samsung'})
    sony = await brands.find_one({'slug': 'sony'})
    
    apple_id = str(apple['_id']) if apple else None
    samsung_id = str(samsung['_id']) if samsung else None
    sony_id = str(sony['_id']) if sony else None

    # Check if used products already exist
    existing_used = await products.count_documents({'condition': {'$regex': '^used'}})
    if existing_used > 0:
        print(f"Found {existing_used} used products already. Skipping seed.")
        client.close()
        return

    used_products = [
        {
            'name': 'Used iPhone 14 Pro Max - 256GB',
            'slug': 'used-iphone-14-pro-max-256gb',
            'description': 'Excellent condition iPhone 14 Pro Max with 256GB storage. Minor scratches on the back glass, screen is flawless. Battery health at 92%. Comes with original box and charger.',
            'category_id': cat_id,
            'brand_id': apple_id,
            'images': [
                'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800',
                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'
            ],
            'regular_price': 899.00,
            'sale_price': 749.00,
            'discount_percent': 17,
            'stock': 3,
            'is_deal': True,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'storage': '256GB',
                'color': 'Deep Purple',
                'battery_health': '92%',
                'condition_details': 'Minor back scratches, screen perfect',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'name': 'Used iPhone 13 - 128GB',
            'slug': 'used-iphone-13-128gb',
            'description': 'Well-maintained iPhone 13 in excellent condition. 128GB storage, no scratches on screen or body. Battery health 89%. Includes charger cable.',
            'category_id': cat_id,
            'brand_id': apple_id,
            'images': [
                'https://images.unsplash.com/photo-1632633173522-47456de71b68?w=800',
                'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800'
            ],
            'regular_price': 599.00,
            'sale_price': 499.00,
            'discount_percent': 17,
            'stock': 5,
            'is_deal': True,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'storage': '128GB',
                'color': 'Midnight',
                'battery_health': '89%',
                'condition_details': 'No visible scratches, like new',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'name': 'Used Samsung Galaxy S23 Ultra - 256GB',
            'slug': 'used-samsung-galaxy-s23-ultra',
            'description': 'Samsung Galaxy S23 Ultra in excellent condition. 256GB, S Pen included. Tiny scratch on corner, screen is immaculate. Battery excellent.',
            'category_id': cat_id,
            'brand_id': samsung_id,
            'images': [
                'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
                'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800'
            ],
            'regular_price': 999.00,
            'sale_price': 799.00,
            'discount_percent': 20,
            'stock': 2,
            'is_deal': True,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'storage': '256GB',
                'color': 'Phantom Black',
                'battery_health': '95%',
                'condition_details': 'Tiny corner scratch, screen perfect',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'name': 'Used Samsung Galaxy S22 - 128GB',
            'slug': 'used-samsung-galaxy-s22-128gb',
            'description': 'Samsung Galaxy S22 in good condition. 128GB storage. Light wear on edges, screen has no damage. Fully functional.',
            'category_id': cat_id,
            'brand_id': samsung_id,
            'images': [
                'https://images.unsplash.com/photo-1644501635772-0348e90e1cad?w=800',
                'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=800'
            ],
            'regular_price': 549.00,
            'sale_price': 429.00,
            'discount_percent': 22,
            'stock': 4,
            'is_deal': False,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'storage': '128GB',
                'color': 'Green',
                'battery_health': '87%',
                'condition_details': 'Light edge wear, screen perfect',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'name': 'Used MacBook Air M2 - 256GB',
            'slug': 'used-macbook-air-m2-256gb',
            'description': 'Apple MacBook Air M2 chip in excellent condition. 8GB RAM, 256GB SSD. Battery cycle count only 87. Comes with original charger and box.',
            'category_id': cat_id,
            'brand_id': apple_id,
            'images': [
                'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
            ],
            'regular_price': 1099.00,
            'sale_price': 899.00,
            'discount_percent': 18,
            'stock': 2,
            'is_deal': True,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'processor': 'Apple M2',
                'ram': '8GB',
                'storage': '256GB SSD',
                'battery_cycles': '87',
                'condition_details': 'Pristine condition, minimal use',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'name': 'Used iPad Pro 11" M1 - 128GB WiFi',
            'slug': 'used-ipad-pro-11-m1-128gb',
            'description': 'iPad Pro 11 inch with M1 chip, 128GB WiFi model. Screen is perfect, minor scratch on aluminum back. Apple Pencil compatible.',
            'category_id': cat_id,
            'brand_id': apple_id,
            'images': [
                'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
                'https://images.unsplash.com/photo-1561154464-82e9aab73a56?w=800'
            ],
            'regular_price': 699.00,
            'sale_price': 549.00,
            'discount_percent': 21,
            'stock': 3,
            'is_deal': False,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'processor': 'Apple M1',
                'storage': '128GB',
                'display': '11" Liquid Retina',
                'connectivity': 'WiFi',
                'condition_details': 'Screen perfect, minor back scratch',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'name': 'Used Sony WH-1000XM5 Headphones',
            'slug': 'used-sony-wh-1000xm5',
            'description': 'Sony WH-1000XM5 wireless noise-cancelling headphones. Excellent condition, all features working perfectly. Includes carry case and cable.',
            'category_id': cat_id,
            'brand_id': sony_id,
            'images': [
                'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
                'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'
            ],
            'regular_price': 349.00,
            'sale_price': 249.00,
            'discount_percent': 29,
            'stock': 6,
            'is_deal': True,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'type': 'Over-ear Wireless',
                'noise_cancelling': 'Yes - Industry Leading',
                'battery_life': '28 hours',
                'condition_details': 'Like new, no visible wear',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            'name': 'Used Samsung Galaxy Tab S8 - 128GB',
            'slug': 'used-samsung-galaxy-tab-s8-128gb',
            'description': 'Samsung Galaxy Tab S8 tablet in excellent condition. 128GB, WiFi. Screen and body in great shape. S Pen included.',
            'category_id': cat_id,
            'brand_id': samsung_id,
            'images': [
                'https://images.unsplash.com/photo-1632882765546-1ee75f53becb?w=800',
                'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800'
            ],
            'regular_price': 599.00,
            'sale_price': 449.00,
            'discount_percent': 25,
            'stock': 3,
            'is_deal': False,
            'is_new': False,
            'condition': 'used-excellent',
            'specs': {
                'storage': '128GB',
                'display': '11" LTPS TFT',
                'connectivity': 'WiFi',
                'condition_details': 'Great shape overall, S Pen included',
                'warranty': '30-day GSN guarantee'
            },
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
    ]

    result = await products.insert_many(used_products)
    print(f"Inserted {len(result.inserted_ids)} used products successfully!")
    
    # Print summary
    total = await products.count_documents({})
    used_count = await products.count_documents({'condition': {'$regex': '^used'}})
    print(f"\nTotal products in store: {total}")
    print(f"Used products: {used_count}")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(seed_used_products())
