import React, { useState } from 'react';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

const CheckoutPaymentSelector = ({ value, onChange }) => {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Payment Method</h3>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        data-testid="checkout-payment-method-radio"
      >
        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
          <RadioGroupItem value="stripe" id="stripe" data-testid="checkout-payment-stripe-option" />
          <Label htmlFor="stripe" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Credit/Debit Card</div>
                <div className="text-sm text-muted-foreground">Secure payment via Stripe</div>
              </div>
              <Badge variant="outline">Recommended</Badge>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
          <RadioGroupItem value="cod" id="cod" data-testid="checkout-payment-cod-option" />
          <Label htmlFor="cod" className="flex-1 cursor-pointer">
            <div>
              <div className="font-medium">Cash on Delivery (COD)</div>
              <div className="text-sm text-muted-foreground">Pay when you receive</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </Card>
  );
};

export default CheckoutPaymentSelector;
