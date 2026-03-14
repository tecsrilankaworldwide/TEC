import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import CartSummary from '../components/CartSummary';
import CheckoutPaymentSelector from '../components/CheckoutPaymentSelector';
import { toast } from 'sonner';

const CheckoutPage = ({ sessionId, onCartUpdate }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingCost, setShippingCost] = useState(15.0); // Default courier charge

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/cart/${sessionId}`);
      const data = await response.json();
      if (!data.items || data.items.length === 0) {
        navigate('/cart');
        return;
      }
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.product.sale_price || item.product.regular_price;
      return sum + price * item.quantity;
    }, 0);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.email || !formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      // Create order
      const orderResponse = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          email: formData.email,
          shipping_address: {
            full_name: formData.fullName,
            phone: formData.phone,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city: formData.city,
            postal_code: formData.postalCode,
          },
          payment_method: paymentMethod,
          shipping_cost: shippingCost,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const checkoutResponse = await fetch(`${backendUrl}/api/payments/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            origin_url: window.location.origin,
          }),
        });

        if (!checkoutResponse.ok) {
          throw new Error('Failed to create checkout session');
        }

        const checkoutData = await checkoutResponse.json();

        // Redirect to Stripe
        window.location.href = checkoutData.url;
      } else {
        // COD - redirect to success page
        if (onCartUpdate) onCartUpdate();
        navigate(`/order-success?order_id=${order.id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const total = subtotal + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <CheckoutPaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
        </div>

        <div>
          <CartSummary
            subtotal={subtotal}
            shipping={shippingCost}
            total={total}
            onCheckout={handlePlaceOrder}
            checkoutLabel={processing ? 'Processing...' : 'Place Order'}
          />

          {/* Order Items Summary */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Order Items ({cartItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="tabular-nums">
                      $
                      {
                        ((item.product.sale_price || item.product.regular_price) * item.quantity).toFixed(
                          2
                        )
                      }
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
