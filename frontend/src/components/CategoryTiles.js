import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';

const CategoryTiles = ({ categories }) => {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
      data-testid="category-tiles"
    >
      {categories.map((category) => (
        <Link key={category.slug} to={`/products?category=${category.slug}`}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="aspect-square w-full mb-2 overflow-hidden rounded-lg bg-muted">
                <img
                  src={category.image || 'https://via.placeholder.com/200'}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-medium line-clamp-2">
                {category.name}
              </h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default CategoryTiles;
