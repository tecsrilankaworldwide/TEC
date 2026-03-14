import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import OrderStatusStepper from '../components/OrderStatusStepper';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

const OrderTrackingPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();

    if (!orderNumber) {
      toast.error('Please enter an order number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const url = `${backendUrl}/api/orders/track/${orderNumber}${email ? `?email=${encodeURIComponent(email)}` : ''}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        toast.error('Order not found');
        setOrder(null);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order number to see the status</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number *</Label>
              <Input
                id="orderNumber"
                placeholder="ORD-20260314123456"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email verification adds extra security
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && order && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold tabular-nums">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-medium capitalize">{order.payment_status}</span>
              </div>
            </CardContent>
          </Card>

          <OrderStatusStepper status={order.status} />

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {order.shipping_address?.full_name}
                <br />
                {order.shipping_address?.address_line1}
                <br />
                {order.shipping_address?.address_line2 && (
                  <>
                    {order.shipping_address.address_line2}
                    <br />
                  </>
                )}
                {order.shipping_address?.city} {order.shipping_address?.postal_code}
                <br />
                {order.shipping_address?.phone}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.image || 'https://via.placeholder.com/100'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                    </div>
                    <div className="font-medium tabular-nums">${item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {searched && !order && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Order not found. Please check your order number and try again.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderTrackingPage;
