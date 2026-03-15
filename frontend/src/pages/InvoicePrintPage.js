import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_4402d63f-6a71-413d-a87b-55ea0ac46c4e/artifacts/5xvvepmr_image.png';

const InvoicePrintPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-8">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="border-b-4 border-primary p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={LOGO_URL}
                  alt="GSN Enterprises Logo"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <div className="font-heading text-3xl font-bold tracking-tight">
                    <span className="text-primary">GSN</span>
                    <span className="text-gray-800"> Enterprises</span>
                  </div>
                  <div className="text-xs tracking-[0.2em] text-gray-500 font-medium">
                    Nothing but the BEST
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-4 space-y-1">
                <p>Colombo, Sri Lanka</p>
                <p>Tel: 0740574948</p>
                <p>Email: nelumpathirana584@gmail.com</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
              <div className="text-sm space-y-1">
                <p><span className="font-semibold">Invoice #:</span> {order.order_number}</p>
                <p><span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                <p><span className="font-semibold">Status:</span> <span className="uppercase font-semibold text-green-600">{order.status}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="p-8 border-b">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Bill To:</h3>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{order.shipping_address?.full_name}</p>
                <p>{order.customer_email}</p>
                <p>{order.shipping_address?.phone}</p>
                <p>{order.shipping_address?.address_line1}</p>
                {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>{order.shipping_address?.city} {order.shipping_address?.postal_code}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Payment Method:</h3>
              <div className="text-sm">
                <p className="font-semibold">{order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'Credit/Debit Card (Stripe)'}</p>
                <p className="text-gray-600 mt-1">Payment Status: <span className="font-semibold capitalize">{order.payment_status}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 font-bold text-gray-800 uppercase tracking-wide">#</th>
                <th className="text-left py-3 font-bold text-gray-800 uppercase tracking-wide">Item Description</th>
                <th className="text-center py-3 font-bold text-gray-800 uppercase tracking-wide">Qty</th>
                <th className="text-right py-3 font-bold text-gray-800 uppercase tracking-wide">Unit Price</th>
                <th className="text-right py-3 font-bold text-gray-800 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-4 text-gray-600">{index + 1}</td>
                  <td className="py-4">
                    <p className="font-medium text-gray-800">{item.name}</p>
                  </td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">Rs. {item.price.toFixed(2)}</td>
                  <td className="py-4 text-right font-medium text-gray-800">Rs. {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-80">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs. {order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">Rs. {order.shipping_cost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-800">TOTAL:</span>
                  <span className="text-lg font-bold text-primary">Rs. {order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-8 border-t">
          <div className="text-center text-sm space-y-2">
            <p className="font-semibold text-gray-800">Thank you for your business!</p>
            <p className="text-gray-600">For any queries, contact us at nelumpathirana584@gmail.com or call 0740574948</p>
            <p className="text-xs text-gray-500 mt-4">This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>

        {/* Print Button */}
        <div className="p-8 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Print Invoice
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrintPage;