import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import ProductCard from '../components/ProductCard';
import CategoryTiles from '../components/CategoryTiles';
import { ArrowRight } from 'lucide-react';

const HomePage = ({ sessionId, onCartUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [usedProducts, setUsedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      const [categoriesRes, dealsRes, newRes, usedRes] = await Promise.all([
        fetch(`${backendUrl}/api/categories`),
        fetch(`${backendUrl}/api/products?is_deal=true&limit=8`),
        fetch(`${backendUrl}/api/products?is_new=true&limit=8`),
        fetch(`${backendUrl}/api/products?condition=used&limit=8`),
      ]);

      const categoriesData = await categoriesRes.json();
      const dealsData = await dealsRes.json();
      const newData = await newRes.json();
      const usedData = await usedRes.json();

      setCategories(categoriesData);
      setDealProducts(dealsData.products || []);
      setNewProducts(newData.products || []);
      setUsedProducts(usedData.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[radial-gradient(1200px_circle_at_20%_0%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(900px_circle_at_90%_10%,hsl(var(--accent)/0.14),transparent_60%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-12">
            {/* Main Hero */}
            <div className="lg:col-span-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 sm:p-12 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-[hsl(var(--brand-deal))]">
                LIMITED TIME OFFER
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
                Latest Tech at
                <br />
                <span className="text-primary">Unbeatable Prices</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl">
                Shop genuine electronics with warranty. Free delivery in Colombo. Pay with COD or Stripe.
              </p>
              <Link to="/products?is_deal=true">
                <Button size="lg" className="w-fit">
                  Shop Deals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Side Promos */}
            <div className="lg:col-span-4 grid gap-4">
              <Link
                to="/products?category=mobile-phones"
                className="bg-card rounded-xl p-6 hover:shadow-lg transition-shadow border"
              >
                <h3 className="font-semibold mb-2">Latest Smartphones</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  iPhone, Samsung & more
                </p>
                <Button variant="outline" size="sm">
                  Explore
                </Button>
              </Link>
              <Link
                to="/products?category=laptops-computers"
                className="bg-card rounded-xl p-6 hover:shadow-lg transition-shadow border"
              >
                <h3 className="font-semibold mb-2">Powerful Laptops</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  MacBook, Dell, HP & more
                </p>
                <Button variant="outline" size="sm">
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-6">
            Shop by Category
          </h2>
          <CategoryTiles categories={categories} />
        </div>
      </section>

      {/* Flash Deals */}
      {dealProducts.length > 0 && (
        <section className="py-8 sm:py-10 lg:py-12 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Flash Deals 🔥
              </h2>
              <Link to="/products?is_deal=true">
                <Button variant="ghost">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dealProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sessionId={sessionId}
                  onCartUpdate={onCartUpdate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-8 sm:py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                New Arrivals
              </h2>
              <Link to="/products?is_new=true">
                <Button variant="ghost">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sessionId={sessionId}
                  onCartUpdate={onCartUpdate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Used Quality Phones & Electronics */}
      {usedProducts.length > 0 && (
        <section className="py-8 sm:py-10 lg:py-12 bg-amber-50/50" data-testid="used-products-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Used Quality Phones & Electronics
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Certified pre-owned devices at unbeatable prices with 30-day guarantee
                </p>
              </div>
              <Link to="/products?condition=used">
                <Button variant="ghost">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {usedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sessionId={sessionId}
                  onCartUpdate={onCartUpdate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-8 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold">Genuine Products</div>
              <div className="text-sm text-muted-foreground">With Warranty</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🚚</div>
              <div className="font-semibold">Fast Delivery</div>
              <div className="text-sm text-muted-foreground">Same Day in Colombo</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <div className="font-semibold">Secure Payments</div>
              <div className="text-sm text-muted-foreground">Stripe Protected</div>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold">COD Available</div>
              <div className="text-sm text-muted-foreground">Pay on Delivery</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
