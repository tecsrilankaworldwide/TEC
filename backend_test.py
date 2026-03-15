import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any

class ECommerceAPITester:
    def __init__(self, base_url="https://electronics-store-tw.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_id = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_order_id = None
        self.created_order_number = None
        self.admin_token = None

    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        return passed

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Dict[str, Any] = None, headers: Dict[str, str] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        req_headers = {'Content-Type': 'application/json'}
        if headers:
            req_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers)

            success = response.status_code == expected_status
            
            if success:
                try:
                    result = response.json()
                except:
                    result = {}
                return self.log_test(name, True), result
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:100]}"
                return self.log_test(name, False, error_msg), {}

        except Exception as e:
            return self.log_test(name, False, str(e)), {}

    def test_server_health(self):
        """Test server is running"""
        success, _ = self.run_test("Server Health Check", "GET", "/", 200)
        return success

    def test_categories_api(self):
        """Test categories endpoints"""
        success, data = self.run_test("Get Categories", "GET", "/api/categories", 200)
        if success and isinstance(data, list):
            self.log_test("Categories Response Format", True)
            return True
        else:
            self.log_test("Categories Response Format", False, "Should return list")
            return False

    def test_brands_api(self):
        """Test brands endpoints"""
        success, data = self.run_test("Get Brands", "GET", "/api/brands", 200)
        if success and isinstance(data, list):
            self.log_test("Brands Response Format", True)
            return True
        else:
            self.log_test("Brands Response Format", False, "Should return list")
            return False

    def test_products_api(self):
        """Test products endpoints"""
        # Get all products
        success, data = self.run_test("Get All Products", "GET", "/api/products", 200)
        if not success:
            return False
        
        if not isinstance(data, dict) or 'products' not in data:
            self.log_test("Products Response Format", False, "Should return dict with 'products' key")
            return False
        
        products = data.get('products', [])
        if len(products) == 0:
            self.log_test("Products Data", False, "No products found")
            return False
        
        self.log_test("Products Response Format", True)
        
        # Test product search
        success, _ = self.run_test("Search Products", "GET", "/api/products?search=phone", 200)
        if not success:
            return False
        
        # Test product filtering  
        success, _ = self.run_test("Filter Products by Deal", "GET", "/api/products?is_deal=true", 200)
        if not success:
            return False
        
        # Test get single product
        product_id = products[0].get('id') if products else None
        if product_id:
            success, _ = self.run_test("Get Single Product", "GET", f"/api/products/{product_id}", 200)
            return success
        else:
            self.log_test("Get Single Product", False, "No product ID found")
            return False

    def test_cart_api(self):
        """Test cart functionality"""
        # Get empty cart
        success, cart_data = self.run_test("Get Empty Cart", "GET", f"/api/cart/{self.session_id}", 200)
        if not success:
            return False
        
        # Get products to add to cart
        success, products_data = self.run_test("Get Products for Cart Test", "GET", "/api/products?limit=1", 200)
        if not success or not products_data.get('products'):
            self.log_test("Cart Test Setup", False, "No products available for testing")
            return False
        
        product_id = products_data['products'][0]['id']
        
        # Add item to cart
        cart_item = {
            "product_id": product_id,
            "quantity": 2
        }
        success, _ = self.run_test("Add Item to Cart", "POST", f"/api/cart/{self.session_id}/items", 200, cart_item)
        if not success:
            return False
        
        # Get cart with items
        success, cart_data = self.run_test("Get Cart with Items", "GET", f"/api/cart/{self.session_id}", 200)
        if success:
            if len(cart_data.get('items', [])) > 0:
                self.log_test("Cart Items Added", True)
            else:
                self.log_test("Cart Items Added", False, "No items in cart after adding")
                return False
        
        # Update cart item quantity
        success, _ = self.run_test("Update Cart Item", "PUT", f"/api/cart/{self.session_id}/items/{product_id}?quantity=3", 200)
        if not success:
            return False
        
        # Remove item from cart
        success, _ = self.run_test("Remove Cart Item", "DELETE", f"/api/cart/{self.session_id}/items/{product_id}", 200)
        if not success:
            return False
        
        # Add item back for order testing
        success, _ = self.run_test("Re-add Item for Order Test", "POST", f"/api/cart/{self.session_id}/items", 200, cart_item)
        return success

    def test_order_creation(self):
        """Test order creation (COD)"""
        order_data = {
            "session_id": self.session_id,
            "email": "test@example.com",
            "shipping_address": {
                "full_name": "Test User",
                "phone": "+94771234567",
                "address_line1": "123 Test Street",
                "address_line2": "",
                "city": "Colombo",
                "postal_code": "00100"
            },
            "payment_method": "cod",
            "shipping_cost": 15.0
        }
        
        success, order_response = self.run_test("Create COD Order", "POST", "/api/orders", 200, order_data)
        if success:
            self.created_order_id = order_response.get('id')
            self.created_order_number = order_response.get('order_number')
            if self.created_order_id and self.created_order_number:
                self.log_test("Order Created with ID and Number", True)
            else:
                self.log_test("Order Created with ID and Number", False, "Missing order ID or number")
                return False
        
        return success

    def test_order_tracking(self):
        """Test order tracking"""
        if not self.created_order_number:
            self.log_test("Order Tracking Test", False, "No order created to track")
            return False
        
        # Track by order number
        success, _ = self.run_test("Track Order by Number", "GET", f"/api/orders/track/{self.created_order_number}", 200)
        if not success:
            return False
        
        # Track with email verification
        success, _ = self.run_test("Track Order with Email", "GET", f"/api/orders/track/{self.created_order_number}?email=test@example.com", 200)
        return success

    def test_order_retrieval(self):
        """Test order retrieval by ID"""
        if not self.created_order_id:
            self.log_test("Order Retrieval Test", False, "No order created to retrieve")
            return False
        
        success, order_data = self.run_test("Get Order by ID", "GET", f"/api/orders/{self.created_order_id}", 200)
        if success:
            if order_data.get('status') == 'confirmed':
                self.log_test("COD Order Status Correct", True)
            else:
                self.log_test("COD Order Status Correct", False, f"Expected 'confirmed', got '{order_data.get('status')}'")
        
        return success

    def test_stripe_checkout_creation(self):
        """Test Stripe checkout session creation"""
        if not self.created_order_id:
            self.log_test("Stripe Checkout Test", False, "No order created for checkout")
            return False
        
        checkout_data = {
            "order_id": self.created_order_id,
            "origin_url": "https://electronics-store-tw.preview.emergentagent.com"
        }
        
        success, response = self.run_test("Create Stripe Checkout Session", "POST", "/api/payments/checkout", 200, checkout_data)
        if success and 'url' in response:
            self.log_test("Stripe Checkout URL Generated", True)
        else:
            self.log_test("Stripe Checkout URL Generated", False, "No URL in response")
        
        return success

    def test_admin_login(self):
        """Test admin authentication"""
        # Test correct password
        login_data = {"password": "admin123"}
        success, response = self.run_test("Admin Login - Correct Password", "POST", "/api/admin/login", 200, login_data)
        if success:
            if 'access_token' in response:
                self.admin_token = response['access_token']
                self.log_test("Admin Token Received", True)
            else:
                self.log_test("Admin Token Received", False, "No access_token in response")
                return False
        else:
            return False
        
        # Test wrong password
        wrong_login_data = {"password": "wrongpassword"}
        success, _ = self.run_test("Admin Login - Wrong Password", "POST", "/api/admin/login", 401, wrong_login_data)
        return success

    def test_admin_protected_endpoints(self):
        """Test admin protected endpoints require JWT"""
        if not self.admin_token:
            self.log_test("Admin Protected Endpoints Test", False, "No admin token available")
            return False
        
        # Test accessing protected endpoint without token
        success, _ = self.run_test("Admin Stats - No Token", "GET", "/api/admin/stats", 401)
        if not success:
            return False
        
        # Test accessing protected endpoint with valid token
        auth_headers = {"Authorization": f"Bearer {self.admin_token}"}
        success, response = self.run_test("Admin Stats - Valid Token", "GET", "/api/admin/stats", 200, headers=auth_headers)
        if success:
            if 'totalProducts' in response and 'totalOrders' in response and 'totalRevenue' in response:
                self.log_test("Admin Stats Response Format", True)
            else:
                self.log_test("Admin Stats Response Format", False, "Missing expected fields")
                return False
        
        # Test admin orders endpoint
        success, orders_response = self.run_test("Admin Orders - Valid Token", "GET", "/api/admin/orders", 200, headers=auth_headers)
        if success and isinstance(orders_response, list):
            self.log_test("Admin Orders Response Format", True)
        else:
            self.log_test("Admin Orders Response Format", False, "Should return list")
            return False
        
        return True

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print(f"🚀 Starting E-commerce API Tests")
        print(f"Backend URL: {self.base_url}")
        print(f"Session ID: {self.session_id}")
        print("=" * 60)
        
        test_results = []
        
        # Core API tests
        test_results.append(self.test_server_health())
        test_results.append(self.test_categories_api())
        test_results.append(self.test_brands_api())
        test_results.append(self.test_products_api())
        
        # Shopping cart tests
        test_results.append(self.test_cart_api())
        
        # Order management tests
        test_results.append(self.test_order_creation())
        test_results.append(self.test_order_tracking())
        test_results.append(self.test_order_retrieval())
        
        # Payment tests
        test_results.append(self.test_stripe_checkout_creation())
        
        # Admin authentication tests
        test_results.append(self.test_admin_login())
        test_results.append(self.test_admin_protected_endpoints())
        
        print("=" * 60)
        print(f"📊 Test Summary:")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ECommerceAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"💥 Test suite failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())