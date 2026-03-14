import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

const CartSummary = ({ subtotal, shipping, total, onCheckout, checkoutLabel = 'Proceed to Checkout' }) => {
  return (
    <Card data-testid="cart-summary">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className="tabular-nums">
              {shipping === 0 ? 'Calculated at checkout' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="tabular-nums">${total.toFixed(2)}</span>
        </div>
        {onCheckout && (
          <Button onClick={onCheckout} className="w-full" size="lg">
            {checkoutLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSummary;
