import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const ProductCard = ({ product, sessionId, onCartUpdate }) => {
  const price = product.sale_price || product.regular_price;
  const hasDiscount = product.sale_price && product.discount_percent;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/cart/${sessionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast.success('Added to cart!');
        if (onCartUpdate) onCartUpdate();
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link to={`/products/${product.id}`}>
      <Card
        className="product-card overflow-hidden h-full"
        data-testid="product-card"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="object-cover w-full h-full"
          />
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2 deal-badge"
            >
              {product.discount_percent}% OFF
            </Badge>
          )}
          {product.is_deal && (
            <Badge className="absolute top-2 right-2 bg-[hsl(var(--brand-deal))]">
              DEAL
            </Badge>
          )}
          {product.is_new && (
            <Badge className="absolute top-2 right-2 bg-[hsl(var(--brand-success))]">
              NEW
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm sm:text-base leading-snug line-clamp-2 mb-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-semibold tabular-nums">
              Rs. {price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through tabular-nums">
                Rs. {product.regular_price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
            data-testid="product-card-add-to-cart-button"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
