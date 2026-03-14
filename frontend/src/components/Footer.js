import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-muted/40 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading font-semibold mb-4">About Us</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted electronics store for genuine products with warranty.
            </p>
          </div>
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-primary">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-primary">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Returns & Refunds</li>
              <li>Shipping Info</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold mb-4">Payment Methods</h3>
            <p className="text-sm text-muted-foreground">Stripe • Cash on Delivery</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TechStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
