import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_4402d63f-6a71-413d-a87b-55ea0ac46c4e/artifacts/5xvvepmr_image.png';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-muted/40 to-muted/60 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={LOGO_URL}
                alt="GSN Enterprises Logo"
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <div className="font-heading text-lg font-bold tracking-tight">
                  <span className="text-primary">GSN</span>
                  <span className="text-foreground"> Enterprises</span>
                </div>
                <div className="text-[9px] tracking-[0.2em] text-muted-foreground font-medium -mt-1">
                  Nothing but the BEST
                </div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Sri Lanka's trusted destination for genuine electronics and tech gadgets. 
              Quality products, competitive prices, and excellent service since 2024.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>nelumpathirana584@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0740574948</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="#" className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Facebook className="h-4 w-4 text-primary" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Instagram className="h-4 w-4 text-primary" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter className="h-4 w-4 text-primary" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Youtube className="h-4 w-4 text-primary" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-primary transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Deals & Offers
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-primary transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Returns & Refunds</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Shipping Information</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Warranty Policy</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Contact Us</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GSN Enterprises. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Secure Payments:</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium text-xs">Stripe</span>
                <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium text-xs">COD</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              DESIGN BY <span className="font-semibold text-primary">TW CREATIONS-ASIA</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;