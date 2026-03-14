import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Check } from 'lucide-react';

const OrderStatusStepper = ({ status }) => {
  const steps = [
    { key: 'pending_payment', label: 'Payment Pending', completed: false },
    { key: 'paid', label: 'Payment Confirmed', completed: false },
    { key: 'confirmed', label: 'Order Confirmed', completed: false },
    { key: 'fulfilled', label: 'Fulfilled', completed: false },
  ];

  const statusOrder = ['pending_payment', 'paid', 'confirmed', 'fulfilled'];
  const currentIndex = statusOrder.indexOf(status);

  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <Card data-testid="order-status-stepper">
      <CardContent className="pt-6">
        <Progress value={progress} className="mb-6" />
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                    {step.label}
                  </div>
                  {isCurrent && (
                    <Badge variant="outline" className="mt-1">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusStepper;
