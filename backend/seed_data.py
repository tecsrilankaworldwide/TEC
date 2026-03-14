import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['ecommerce_store']
    
    # Clear existing data
    await db['categories'].delete_many({})
    await db['brands'].delete_many({})
    await db['products'].delete_many({})
    
    print("Seeding categories...")
    categories = [
        {'name': 'Laptops & Computers', 'slug': 'laptops-computers', 'image': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'},
        {'name': 'Mobile Phones', 'slug': 'mobile-phones', 'image': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'},
        {'name': 'Headphones & Audio', 'slug': 'headphones-audio', 'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'},
        {'name': 'Cameras', 'slug': 'cameras', 'image': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'},
        {'name': 'Smart Watches', 'slug': 'smart-watches', 'image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'},
        {'name': 'TV & Home Entertainment', 'slug': 'tv-home-entertainment', 'image': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'},
    ]
    cat_result = await db['categories'].insert_many(categories)
    cat_ids = {cat['slug']: str(id) for cat, id in zip(categories, cat_result.inserted_ids)}
    
    print("Seeding brands...")
    brands = [
        {'name': 'Apple', 'slug': 'apple', 'logo': None},
        {'name': 'Samsung', 'slug': 'samsung', 'logo': None},
        {'name': 'Sony', 'slug': 'sony', 'logo': None},
        {'name': 'Dell', 'slug': 'dell', 'logo': None},
        {'name': 'HP', 'slug': 'hp', 'logo': None},
        {'name': 'Lenovo', 'slug': 'lenovo', 'logo': None},
        {'name': 'Canon', 'slug': 'canon', 'logo': None},
        {'name': 'Bose', 'slug': 'bose', 'logo': None},
        {'name': 'JBL', 'slug': 'jbl', 'logo': None},
        {'name': 'LG', 'slug': 'lg', 'logo': None},
    ]
    brand_result = await db['brands'].insert_many(brands)
    brand_ids = {brand['slug']: str(id) for brand, id in zip(brands, brand_result.inserted_ids)}
    
    print("Seeding products...")
    products = [
        # Laptops
        {
            'name': 'MacBook Pro 16" M3 Pro',
            'slug': 'macbook-pro-16-m3-pro',
            'description': 'Powerful laptop with M3 Pro chip, 16-inch Liquid Retina XDR display, up to 22 hours battery life.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['apple'],
            'images': ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'],
            'regular_price': 2499.00,
            'sale_price': 2299.00,
            'discount_percent': 8,
            'stock': 15,
            'is_deal': True,
            'is_new': True,
            'specs': {'processor': 'Apple M3 Pro', 'ram': '16GB', 'storage': '512GB SSD', 'display': '16.2" Liquid Retina XDR'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Dell XPS 15 9530',
            'slug': 'dell-xps-15-9530',
            'description': 'Premium laptop with Intel Core i7, stunning OLED display, and excellent build quality.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['dell'],
            'images': ['https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
            'regular_price': 1899.00,
            'sale_price': 1699.00,
            'discount_percent': 11,
            'stock': 20,
            'is_deal': True,
            'is_new': False,
            'specs': {'processor': 'Intel Core i7-13700H', 'ram': '16GB', 'storage': '512GB SSD', 'display': '15.6" OLED 3.5K'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'HP Pavilion 14',
            'slug': 'hp-pavilion-14',
            'description': 'Affordable and reliable laptop perfect for everyday tasks and productivity.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['hp'],
            'images': ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
            'regular_price': 799.00,
            'sale_price': None,
            'discount_percent': None,
            'stock': 35,
            'is_deal': False,
            'is_new': False,
            'specs': {'processor': 'Intel Core i5-1235U', 'ram': '8GB', 'storage': '256GB SSD', 'display': '14" FHD'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Lenovo ThinkPad X1 Carbon Gen 11',
            'slug': 'lenovo-thinkpad-x1-carbon-gen-11',
            'description': 'Ultra-portable business laptop with legendary ThinkPad durability and performance.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['lenovo'],
            'images': ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'],
            'regular_price': 1599.00,
            'sale_price': 1449.00,
            'discount_percent': 9,
            'stock': 12,
            'is_deal': False,
            'is_new': True,
            'specs': {'processor': 'Intel Core i7-1355U', 'ram': '16GB', 'storage': '512GB SSD', 'display': '14" WUXGA'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        # Mobile Phones
        {
            'name': 'iPhone 15 Pro Max',
            'slug': 'iphone-15-pro-max',
            'description': 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
            'category_id': cat_ids['mobile-phones'],
            'brand_id': brand_ids['apple'],
            'images': ['https://images.unsplash.com/photo-1592286927505-2fd04de525a8?w=800', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
            'regular_price': 1199.00,
            'sale_price': 1099.00,
            'discount_percent': 8,
            'stock': 25,
            'is_deal': True,
            'is_new': True,
            'specs': {'display': '6.7" Super Retina XDR', 'camera': '48MP Main + 12MP Ultra Wide', 'storage': '256GB', 'chip': 'A17 Pro'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Samsung Galaxy S24 Ultra',
            'slug': 'samsung-galaxy-s24-ultra',
            'description': 'Premium Android phone with S Pen, 200MP camera, and AI-powered features.',
            'category_id': cat_ids['mobile-phones'],
            'brand_id': brand_ids['samsung'],
            'images': ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
            'regular_price': 1299.00,
            'sale_price': 1199.00,
            'discount_percent': 8,
            'stock': 18,
            'is_deal': True,
            'is_new': True,
            'specs': {'display': '6.8" Dynamic AMOLED 2X', 'camera': '200MP Main + 50MP Telephoto', 'storage': '512GB', 'chip': 'Snapdragon 8 Gen 3'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Samsung Galaxy A54 5G',
            'slug': 'samsung-galaxy-a54-5g',
            'description': 'Mid-range smartphone with excellent camera, long battery life, and 5G connectivity.',
            'category_id': cat_ids['mobile-phones'],
            'brand_id': brand_ids['samsung'],
            'images': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
            'regular_price': 449.00,
            'sale_price': 399.00,
            'discount_percent': 11,
            'stock': 40,
            'is_deal': False,
            'is_new': False,
            'specs': {'display': '6.4" Super AMOLED', 'camera': '50MP Main + 12MP Ultra Wide', 'storage': '128GB', 'chip': 'Exynos 1380'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        # Headphones
        {
            'name': 'Sony WH-1000XM5',
            'slug': 'sony-wh-1000xm5',
            'description': 'Industry-leading noise canceling headphones with exceptional sound quality.',
            'category_id': cat_ids['headphones-audio'],
            'brand_id': brand_ids['sony'],
            'images': ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
            'regular_price': 399.00,
            'sale_price': 349.00,
            'discount_percent': 13,
            'stock': 30,
            'is_deal': True,
            'is_new': False,
            'specs': {'type': 'Over-ear', 'battery': '30 hours', 'connectivity': 'Bluetooth 5.2', 'anc': 'Yes'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Bose QuietComfort Ultra',
            'slug': 'bose-quietcomfort-ultra',
            'description': 'Premium wireless headphones with spatial audio and world-class noise cancellation.',
            'category_id': cat_ids['headphones-audio'],
            'brand_id': brand_ids['bose'],
            'images': ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'],
            'regular_price': 429.00,
            'sale_price': None,
            'discount_percent': None,
            'stock': 22,
            'is_deal': False,
            'is_new': True,
            'specs': {'type': 'Over-ear', 'battery': '24 hours', 'connectivity': 'Bluetooth 5.3', 'anc': 'Yes'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'JBL Tune 510BT',
            'slug': 'jbl-tune-510bt',
            'description': 'Affordable wireless headphones with powerful bass and long battery life.',
            'category_id': cat_ids['headphones-audio'],
            'brand_id': brand_ids['jbl'],
            'images': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
            'regular_price': 49.00,
            'sale_price': 39.00,
            'discount_percent': 20,
            'stock': 50,
            'is_deal': True,
            'is_new': False,
            'specs': {'type': 'On-ear', 'battery': '40 hours', 'connectivity': 'Bluetooth 5.0', 'anc': 'No'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Apple AirPods Pro (2nd Gen)',
            'slug': 'airpods-pro-2nd-gen',
            'description': 'True wireless earbuds with active noise cancellation and spatial audio.',
            'category_id': cat_ids['headphones-audio'],
            'brand_id': brand_ids['apple'],
            'images': ['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800'],
            'regular_price': 249.00,
            'sale_price': 199.00,
            'discount_percent': 20,
            'stock': 35,
            'is_deal': True,
            'is_new': False,
            'specs': {'type': 'In-ear', 'battery': '6 hours (30h with case)', 'connectivity': 'Bluetooth 5.3', 'anc': 'Yes'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        # Cameras
        {
            'name': 'Canon EOS R6 Mark II',
            'slug': 'canon-eos-r6-mark-ii',
            'description': 'Full-frame mirrorless camera with advanced autofocus and high-speed shooting.',
            'category_id': cat_ids['cameras'],
            'brand_id': brand_ids['canon'],
            'images': ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'],
            'regular_price': 2499.00,
            'sale_price': 2299.00,
            'discount_percent': 8,
            'stock': 8,
            'is_deal': False,
            'is_new': True,
            'specs': {'sensor': '24.2MP Full-Frame', 'video': '4K 60fps', 'iso': '100-102400', 'autofocus': 'Dual Pixel CMOS AF II'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Sony A7 IV',
            'slug': 'sony-a7-iv',
            'description': 'Versatile full-frame camera perfect for both photo and video creators.',
            'category_id': cat_ids['cameras'],
            'brand_id': brand_ids['sony'],
            'images': ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
            'regular_price': 2499.00,
            'sale_price': None,
            'discount_percent': None,
            'stock': 12,
            'is_deal': False,
            'is_new': False,
            'specs': {'sensor': '33MP Full-Frame', 'video': '4K 60fps', 'iso': '100-51200', 'autofocus': 'Fast Hybrid AF'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Canon EOS R50',
            'slug': 'canon-eos-r50',
            'description': 'Compact mirrorless camera ideal for beginners and content creators.',
            'category_id': cat_ids['cameras'],
            'brand_id': brand_ids['canon'],
            'images': ['https://images.unsplash.com/photo-1606933248373-80ea8af0dc6c?w=800'],
            'regular_price': 679.00,
            'sale_price': 599.00,
            'discount_percent': 12,
            'stock': 18,
            'is_deal': True,
            'is_new': False,
            'specs': {'sensor': '24.2MP APS-C', 'video': '4K 30fps', 'iso': '100-32000', 'autofocus': 'Dual Pixel CMOS AF'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        # Smart Watches
        {
            'name': 'Apple Watch Series 9',
            'slug': 'apple-watch-series-9',
            'description': 'Advanced smartwatch with health tracking, always-on display, and seamless iOS integration.',
            'category_id': cat_ids['smart-watches'],
            'brand_id': brand_ids['apple'],
            'images': ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800'],
            'regular_price': 429.00,
            'sale_price': 379.00,
            'discount_percent': 12,
            'stock': 28,
            'is_deal': True,
            'is_new': True,
            'specs': {'display': '1.9" Always-On Retina', 'battery': '18 hours', 'sensors': 'Heart rate, ECG, SpO2', 'water_resistant': '50m'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Samsung Galaxy Watch 6',
            'slug': 'samsung-galaxy-watch-6',
            'description': 'Feature-rich smartwatch with comprehensive health tracking and Android compatibility.',
            'category_id': cat_ids['smart-watches'],
            'brand_id': brand_ids['samsung'],
            'images': ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
            'regular_price': 299.00,
            'sale_price': 249.00,
            'discount_percent': 17,
            'stock': 32,
            'is_deal': True,
            'is_new': False,
            'specs': {'display': '1.5" Super AMOLED', 'battery': '40 hours', 'sensors': 'Heart rate, ECG, SpO2', 'water_resistant': '5ATM'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        # TVs
        {
            'name': 'Samsung 65" QLED 4K Smart TV',
            'slug': 'samsung-65-qled-4k-smart-tv',
            'description': 'Stunning QLED display with Quantum HDR and smart features.',
            'category_id': cat_ids['tv-home-entertainment'],
            'brand_id': brand_ids['samsung'],
            'images': ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800'],
            'regular_price': 1299.00,
            'sale_price': 1099.00,
            'discount_percent': 15,
            'stock': 10,
            'is_deal': True,
            'is_new': False,
            'specs': {'display': '65" QLED 4K', 'hdr': 'Quantum HDR', 'refresh_rate': '120Hz', 'smart_tv': 'Tizen OS'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'LG 55" OLED 4K Smart TV',
            'slug': 'lg-55-oled-4k-smart-tv',
            'description': 'Premium OLED TV with perfect blacks and incredible color accuracy.',
            'category_id': cat_ids['tv-home-entertainment'],
            'brand_id': brand_ids['lg'],
            'images': ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800'],
            'regular_price': 1799.00,
            'sale_price': 1599.00,
            'discount_percent': 11,
            'stock': 8,
            'is_deal': True,
            'is_new': True,
            'specs': {'display': '55" OLED 4K', 'hdr': 'Dolby Vision IQ', 'refresh_rate': '120Hz', 'smart_tv': 'webOS'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Sony 43" 4K Smart TV',
            'slug': 'sony-43-4k-smart-tv',
            'description': 'Compact 4K TV with great picture quality and smart features.',
            'category_id': cat_ids['tv-home-entertainment'],
            'brand_id': brand_ids['sony'],
            'images': ['https://images.unsplash.com/photo-1601944177325-f8867652837f?w=800'],
            'regular_price': 599.00,
            'sale_price': None,
            'discount_percent': None,
            'stock': 15,
            'is_deal': False,
            'is_new': False,
            'specs': {'display': '43" LED 4K', 'hdr': 'HDR10', 'refresh_rate': '60Hz', 'smart_tv': 'Google TV'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        # Additional products to reach 30
        {
            'name': 'Dell UltraSharp 27" 4K Monitor',
            'slug': 'dell-ultrasharp-27-4k-monitor',
            'description': 'Professional 4K monitor with excellent color accuracy and USB-C connectivity.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['dell'],
            'images': ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'],
            'regular_price': 549.00,
            'sale_price': 479.00,
            'discount_percent': 13,
            'stock': 20,
            'is_deal': False,
            'is_new': False,
            'specs': {'display': '27" IPS 4K', 'resolution': '3840x2160', 'refresh_rate': '60Hz', 'ports': 'USB-C, HDMI, DisplayPort'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Logitech MX Master 3S',
            'slug': 'logitech-mx-master-3s',
            'description': 'Premium wireless mouse with ergonomic design and customizable buttons.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['lenovo'],
            'images': ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=800'],
            'regular_price': 99.00,
            'sale_price': 79.00,
            'discount_percent': 20,
            'stock': 45,
            'is_deal': True,
            'is_new': False,
            'specs': {'type': 'Wireless', 'dpi': '8000', 'battery': '70 days', 'connectivity': 'Bluetooth, USB'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Samsung T7 Portable SSD 1TB',
            'slug': 'samsung-t7-portable-ssd-1tb',
            'description': 'Fast and compact external SSD for on-the-go storage.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['samsung'],
            'images': ['https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800'],
            'regular_price': 139.00,
            'sale_price': 119.00,
            'discount_percent': 14,
            'stock': 30,
            'is_deal': False,
            'is_new': False,
            'specs': {'capacity': '1TB', 'speed': 'Up to 1050 MB/s', 'interface': 'USB 3.2 Gen 2', 'size': 'Compact'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'JBL Flip 6 Portable Speaker',
            'slug': 'jbl-flip-6-portable-speaker',
            'description': 'Waterproof Bluetooth speaker with powerful sound and long battery life.',
            'category_id': cat_ids['headphones-audio'],
            'brand_id': brand_ids['jbl'],
            'images': ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
            'regular_price': 129.00,
            'sale_price': 99.00,
            'discount_percent': 23,
            'stock': 38,
            'is_deal': True,
            'is_new': False,
            'specs': {'type': 'Portable', 'battery': '12 hours', 'waterproof': 'IP67', 'connectivity': 'Bluetooth 5.1'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Sony WF-1000XM5 Earbuds',
            'slug': 'sony-wf-1000xm5-earbuds',
            'description': 'Premium true wireless earbuds with industry-leading noise cancellation.',
            'category_id': cat_ids['headphones-audio'],
            'brand_id': brand_ids['sony'],
            'images': ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
            'regular_price': 299.00,
            'sale_price': 269.00,
            'discount_percent': 10,
            'stock': 25,
            'is_deal': False,
            'is_new': True,
            'specs': {'type': 'In-ear', 'battery': '8 hours (24h with case)', 'connectivity': 'Bluetooth 5.3', 'anc': 'Yes'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'iPad Pro 12.9" M2',
            'slug': 'ipad-pro-12-9-m2',
            'description': 'Powerful tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support.',
            'category_id': cat_ids['mobile-phones'],
            'brand_id': brand_ids['apple'],
            'images': ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800'],
            'regular_price': 1099.00,
            'sale_price': 999.00,
            'discount_percent': 9,
            'stock': 14,
            'is_deal': False,
            'is_new': False,
            'specs': {'display': '12.9" Liquid Retina XDR', 'chip': 'Apple M2', 'storage': '256GB', 'camera': '12MP + 10MP Ultra Wide'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Samsung Galaxy Tab S9',
            'slug': 'samsung-galaxy-tab-s9',
            'description': 'Premium Android tablet with S Pen and stunning AMOLED display.',
            'category_id': cat_ids['mobile-phones'],
            'brand_id': brand_ids['samsung'],
            'images': ['https://images.unsplash.com/photo-1585789575802-193b2cc1374f?w=800'],
            'regular_price': 799.00,
            'sale_price': 699.00,
            'discount_percent': 13,
            'stock': 18,
            'is_deal': True,
            'is_new': True,
            'specs': {'display': '11" Dynamic AMOLED 2X', 'chip': 'Snapdragon 8 Gen 2', 'storage': '128GB', 'includes': 'S Pen'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Canon EF 50mm f/1.8 STM Lens',
            'slug': 'canon-ef-50mm-f1-8-stm-lens',
            'description': 'Affordable prime lens with excellent image quality and beautiful bokeh.',
            'category_id': cat_ids['cameras'],
            'brand_id': brand_ids['canon'],
            'images': ['https://images.unsplash.com/photo-1606933248373-80ea8af0dc6c?w=800'],
            'regular_price': 125.00,
            'sale_price': 99.00,
            'discount_percent': 21,
            'stock': 40,
            'is_deal': True,
            'is_new': False,
            'specs': {'focal_length': '50mm', 'aperture': 'f/1.8', 'mount': 'Canon EF', 'autofocus': 'STM'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'GoPro HERO12 Black',
            'slug': 'gopro-hero12-black',
            'description': 'Ultimate action camera with 5.3K video, HyperSmooth stabilization, and waterproof design.',
            'category_id': cat_ids['cameras'],
            'brand_id': brand_ids['sony'],
            'images': ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
            'regular_price': 399.00,
            'sale_price': 349.00,
            'discount_percent': 13,
            'stock': 22,
            'is_deal': False,
            'is_new': True,
            'specs': {'video': '5.3K 60fps', 'photo': '27MP', 'waterproof': '10m', 'stabilization': 'HyperSmooth 6.0'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
        {
            'name': 'Samsung 32" Odyssey G7 Gaming Monitor',
            'slug': 'samsung-32-odyssey-g7-gaming-monitor',
            'description': 'High-performance gaming monitor with 240Hz refresh rate and 1ms response time.',
            'category_id': cat_ids['laptops-computers'],
            'brand_id': brand_ids['samsung'],
            'images': ['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800'],
            'regular_price': 699.00,
            'sale_price': 599.00,
            'discount_percent': 14,
            'stock': 12,
            'is_deal': True,
            'is_new': False,
            'specs': {'display': '32" VA QHD', 'resolution': '2560x1440', 'refresh_rate': '240Hz', 'response_time': '1ms'},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        },
    ]
    
    await db['products'].insert_many(products)
    
    print(f"\n✅ Database seeded successfully!")
    print(f"   - {len(categories)} categories")
    print(f"   - {len(brands)} brands")
    print(f"   - {len(products)} products")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
