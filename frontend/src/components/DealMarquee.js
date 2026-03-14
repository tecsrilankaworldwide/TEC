import React from 'react';
import { Badge } from './ui/badge';

const DealMarquee = () => {
  const deals = [
    { icon: '🚚', text: 'Free Delivery in Colombo' },
    { icon: '✅', text: 'Genuine Warranty' },
    { icon: '💰', text: 'Pay with COD' },
    { icon: '🔒', text: 'Secure Payments' },
  ];

  return (
    <div
      className="bg-[linear-gradient(90deg,hsl(var(--brand-deal)/0.14),transparent_60%)] border-b"
      data-testid="deal-marquee"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-8 py-2 overflow-x-auto">
          {deals.map((deal, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-lg">{deal.icon}</span>
              <span className="text-xs sm:text-sm font-medium">{deal.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealMarquee;
