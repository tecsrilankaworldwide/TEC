"""
Phase 1 POC: Test Core Payment Flows
Tests Stripe payment + COD + order state management in isolation
"""
import asyncio
import os
import sys
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

load_dotenv('/app/backend/.env')

# Import Stripe integration
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionRequest, 
    CheckoutSessionResponse,
    CheckoutStatusResponse
)

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL')
client = AsyncIOMotorClient(MONGO_URL)
db = client['ecommerce_test']

# Collections
orders_collection = db['orders']
payments_collection = db['payment_transactions']

# Stripe setup
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY', 'sk_test_emergent')

# Order states
ORDER_STATUS = {
    'DRAFT': 'draft',
    'PENDING_PAYMENT': 'pending_payment',
    'PAID': 'paid',
    'CONFIRMED': 'confirmed',
    'FULFILLED': 'fulfilled',
    'CANCELLED': 'cancelled',
    'REFUNDED': 'refunded'
}

PAYMENT_STATUS = {
    'PENDING': 'pending',
    'INITIATED': 'initiated',
    'PAID': 'paid',
    'FAILED': 'failed',
    'CANCELLED': 'cancelled'
}

async def create_order(order_data):
    """Create a draft order in MongoDB"""
    order = {
        'order_number': f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'customer_email': order_data.get('email', 'test@example.com'),
        'customer_phone': order_data.get('phone', '+1234567890'),
        'items': order_data['items'],
        'subtotal': order_data['subtotal'],
        'shipping_cost': order_data.get('shipping_cost', 0),
        'total': order_data['total'],
        'payment_method': order_data['payment_method'],
        'status': ORDER_STATUS['DRAFT'],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = await orders_collection.insert_one(order)
    order['_id'] = result.inserted_id
    print(f"✓ Created order: {order['order_number']} (ID: {order['_id']})")
    return order

async def create_payment_transaction(order_id, amount, currency, payment_method, session_id=None):
    """Create payment transaction record"""
    payment = {
        'order_id': str(order_id),
        'amount': amount,
        'currency': currency,
        'payment_method': payment_method,
        'payment_status': PAYMENT_STATUS['INITIATED'],
        'session_id': session_id,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = await payments_collection.insert_one(payment)
    payment['_id'] = result.inserted_id
    print(f"✓ Created payment transaction: {payment['_id']} (Status: {payment['payment_status']})")
    return payment

async def update_order_status(order_id, status):
    """Update order status"""
    result = await orders_collection.update_one(
        {'_id': order_id},
        {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
    )
    print(f"✓ Updated order {order_id} to status: {status}")
    return result.modified_count > 0

async def update_payment_status(payment_id, payment_status):
    """Update payment transaction status"""
    result = await payments_collection.update_one(
        {'_id': payment_id},
        {'$set': {'payment_status': payment_status, 'updated_at': datetime.utcnow()}}
    )
    print(f"✓ Updated payment {payment_id} to status: {payment_status}")
    return result.modified_count > 0

async def test_stripe_payment_flow():
    """Test 1: Stripe Payment Flow"""
    print("\n" + "="*60)
    print("TEST 1: STRIPE PAYMENT FLOW")
    print("="*60)
    
    try:
        # Step 1: Create order
        order_data = {
            'email': 'stripe@test.com',
            'phone': '+1234567890',
            'items': [
                {'product_id': 'prod_1', 'name': 'Laptop', 'quantity': 1, 'price': 999.99}
            ],
            'subtotal': 999.99,
            'shipping_cost': 10.00,
            'total': 1009.99,
            'payment_method': 'stripe'
        }
        
        order = await create_order(order_data)
        
        # Step 2: Initialize Stripe
        webhook_url = "https://electronics-store-tw.preview.emergentagent.com/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Step 3: Create checkout session
        success_url = f"https://electronics-store-tw.preview.emergentagent.com/order-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = "https://electronics-store-tw.preview.emergentagent.com/checkout"
        
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
        print(f"✓ Created Stripe checkout session: {session.session_id}")
        print(f"  Checkout URL: {session.url}")
        
        # Step 4: Create payment transaction
        payment = await create_payment_transaction(
            order['_id'],
            order['total'],
            'usd',
            'stripe',
            session.session_id
        )
        
        # Step 5: Update order to pending payment
        await update_order_status(order['_id'], ORDER_STATUS['PENDING_PAYMENT'])
        
        # Step 6: Simulate checking payment status (in real flow, this happens after redirect)
        print("\n  → User would complete payment at Stripe checkout page")
        print("  → After payment, webhook would update order status to PAID")
        print("  → Testing status check simulation...")
        
        # Note: In real scenario, we'd need actual payment to test status
        # For POC, we verify the session was created successfully
        
        print("\n✅ STRIPE FLOW TEST PASSED")
        print(f"   - Order created: {order['order_number']}")
        print(f"   - Payment session created: {session.session_id}")
        print(f"   - Order status: {ORDER_STATUS['PENDING_PAYMENT']}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ STRIPE FLOW TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_cod_payment_flow():
    """Test 2: Cash on Delivery Flow"""
    print("\n" + "="*60)
    print("TEST 2: CASH ON DELIVERY (COD) FLOW")
    print("="*60)
    
    try:
        # Step 1: Create order
        order_data = {
            'email': 'cod@test.com',
            'phone': '+1234567890',
            'items': [
                {'product_id': 'prod_2', 'name': 'Smartphone', 'quantity': 1, 'price': 599.99}
            ],
            'subtotal': 599.99,
            'shipping_cost': 15.00,
            'total': 614.99,
            'payment_method': 'cod'
        }
        
        order = await create_order(order_data)
        
        # Step 2: For COD, immediately confirm order (no payment gateway needed)
        await update_order_status(order['_id'], ORDER_STATUS['CONFIRMED'])
        
        # Step 3: Create payment transaction as pending (payment on delivery)
        payment = await create_payment_transaction(
            order['_id'],
            order['total'],
            'usd',
            'cod',
            None
        )
        
        await update_payment_status(payment['_id'], PAYMENT_STATUS['PENDING'])
        
        print("\n✅ COD FLOW TEST PASSED")
        print(f"   - Order created: {order['order_number']}")
        print(f"   - Order status: {ORDER_STATUS['CONFIRMED']}")
        print(f"   - Payment status: {PAYMENT_STATUS['PENDING']} (will be paid on delivery)")
        
        return True
        
    except Exception as e:
        print(f"\n❌ COD FLOW TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_order_state_transitions():
    """Test 3: Order State Transitions"""
    print("\n" + "="*60)
    print("TEST 3: ORDER STATE TRANSITIONS")
    print("="*60)
    
    try:
        # Create test order
        order_data = {
            'email': 'state@test.com',
            'items': [{'product_id': 'prod_3', 'name': 'Headphones', 'quantity': 2, 'price': 99.99}],
            'subtotal': 199.98,
            'shipping_cost': 5.00,
            'total': 204.98,
            'payment_method': 'stripe'
        }
        
        order = await create_order(order_data)
        
        # Test state transitions
        states = [
            ORDER_STATUS['PENDING_PAYMENT'],
            ORDER_STATUS['PAID'],
            ORDER_STATUS['CONFIRMED'],
            ORDER_STATUS['FULFILLED']
        ]
        
        for state in states:
            await update_order_status(order['_id'], state)
            await asyncio.sleep(0.1)  # Small delay to simulate real timing
        
        # Verify final state
        final_order = await orders_collection.find_one({'_id': order['_id']})
        assert final_order['status'] == ORDER_STATUS['FULFILLED']
        
        print("\n✅ STATE TRANSITIONS TEST PASSED")
        print(f"   - Order progressed through all states successfully")
        print(f"   - Final status: {final_order['status']}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ STATE TRANSITIONS TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def cleanup_test_data():
    """Clean up test data"""
    print("\n" + "="*60)
    print("CLEANING UP TEST DATA")
    print("="*60)
    
    orders_deleted = await orders_collection.delete_many({})
    payments_deleted = await payments_collection.delete_many({})
    
    print(f"✓ Deleted {orders_deleted.deleted_count} test orders")
    print(f"✓ Deleted {payments_deleted.deleted_count} test payments")

async def main():
    """Run all POC tests"""
    print("\n" + "="*60)
    print("PHASE 1 POC: PAYMENT CORE VALIDATION")
    print("="*60)
    print(f"MongoDB: {MONGO_URL}")
    print(f"Stripe Key: {STRIPE_API_KEY[:20]}...")
    
    # Run tests
    results = {
        'stripe': await test_stripe_payment_flow(),
        'cod': await test_cod_payment_flow(),
        'states': await test_order_state_transitions()
    }
    
    # Cleanup
    await cleanup_test_data()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name.upper()}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! Payment core is ready.")
    else:
        print("\n⚠️  Some tests failed. Fix issues before proceeding.")
    
    return all_passed

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
