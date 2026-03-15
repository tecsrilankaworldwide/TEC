import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { FileText, Search, Eye, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminHeaders } from './AdminLayout';

const AdminInvoicesPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/orders`, {
        headers: getAdminHeaders()
      });
      const data = await response.json();
      // Only show paid/confirmed/fulfilled orders for invoicing
      const invoiceableOrders = data.filter(order => 
        ['paid', 'confirmed', 'fulfilled'].includes(order.status)
      );
      setOrders(invoiceableOrders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (orderId) => {
    window.open(`/admin/invoices/print/${orderId}`, '_blank');
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    toast.success(`Invoice ${orderNumber} download started`);
    window.print();
  };

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and print customer invoices</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold">{order.order_number}</h3>
                    <Badge className="capitalize">{order.status}</Badge>
                    <Badge variant="outline">Rs. {order.total?.toFixed(2)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>Customer: {order.customer_email}</p>
                      <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p>Items: {order.items?.length || 0}</p>
                      <p>Payment: {order.payment_method === 'cod' ? 'COD' : 'Stripe'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewInvoice(order.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvoicesPage;