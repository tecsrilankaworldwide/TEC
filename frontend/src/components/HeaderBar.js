import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_4402d63f-6a71-413d-a87b-55ea0ac46c4e/artifacts/5xvvepmr_image.png';

const HeaderBar = ({ cartCount = 0, onCartUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { name: 'Laptops & Computers', slug: 'laptops-computers' },
    { name: 'Mobile Phones', slug: 'mobile-phones' },
    { name: 'Headphones & Audio', slug: 'headphones-audio' },
    { name: 'Cameras', slug: 'cameras' },
    { name: 'Smart Watches', slug: 'smart-watches' },
    { name: 'TV & Home Entertainment', slug: 'tv-home-entertainment' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with contact info */}
        <div className="border-b py-2 text-xs text-muted-foreground hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>nelumpathirana584@gmail.com</span>
            <span>0740574948</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-primary">Track Order</Link>
            <Link to="/admin/login" className="hover:text-primary">Admin</Link>
          </div>
        </div>

        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              <img
                src={LOGO_URL}
                alt="GSN Enterprises Logo"
                className="h-10 w-10 rounded-lg object-cover"
              />
              <div>
                <div className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                  <span className="text-primary">GSN</span>
                  <span className="text-foreground"> Enterprises</span>
                </div>
                <div className="text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground font-medium -mt-1">
                  Nothing but the BEST
                </div>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="header-search-input"
                className="pr-10"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
                data-testid="header-search-submit-button"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-testid="header-cart-button"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="header-mobile-menu-button"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-6">
                  <form onSubmit={handleSearch} className="mb-4">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/products"
                      className="text-sm font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      All Products
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/products?category=${cat.slug}`}
                        className="text-sm hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <Link
                      to="/track-order"
                      className="text-sm hover:text-primary mt-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Track Order
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Categories - Desktop */}
        <nav className="hidden md:flex items-center gap-6 py-3 border-t">
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="text-sm hover:text-primary transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default HeaderBar;