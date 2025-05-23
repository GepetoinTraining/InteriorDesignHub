
import React from 'react';
import { Product } from '../../types/product';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=EBF4FF&color=0B80EE&size=400&font-size=0.33&bold=true`;
  const imageUrl = product.imageUrl || placeholderImage;

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl h-full border border-slate-200">
      <div 
        className="w-full bg-slate-200 aspect-[4/3] transition-transform group-hover:scale-105 cursor-pointer relative overflow-hidden"
        onClick={() => alert(`View details for ${product.name}`)} // Placeholder
        aria-label={`View details for ${product.name}`}
      >
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
          loading="lazy"
          onError={(e) => {
            // Fallback if the primary image fails
            if (e.currentTarget.src !== placeholderImage) {
                e.currentTarget.src = placeholderImage;
            }
          }}
        />
         <span className="absolute top-3 right-3 bg-[var(--color-primary)] text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            {product.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-slate-800 text-lg font-semibold leading-snug truncate group-hover:text-[var(--color-primary)] transition-colors" title={product.name}>
          {product.name}
        </h3>
        <p className="text-slate-600 text-sm font-normal leading-normal mt-1 flex-grow min-h-[40px] line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-900 text-xl font-bold">${product.price.toFixed(2)}</p>
          <Button 
            variant="primary" 
            onClick={(e) => { e.stopPropagation(); alert(`Added ${product.name} to quote`);}} // Placeholder
            className="h-9 px-3 text-xs"
            aria-label={`Add ${product.name} to quote`}
          >
            <Icon iconName="add_shopping_cart" className="mr-1.5 text-sm" />
            Add to Quote
          </Button>
        </div>
         <Button 
            variant="outlined" 
            onClick={(e) => { e.stopPropagation(); alert(`View details for ${product.name}`);}} // Placeholder
            className="mt-3 w-full h-9 text-xs"
            aria-label={`View more details for ${product.name}`}
          >
            View Details
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
