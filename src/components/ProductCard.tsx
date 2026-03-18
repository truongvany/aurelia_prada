import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  delay: number;
  badge?: string;
  badgeType?: 'new' | 'sale';
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, originalPrice, image, delay, badge, badgeType }) => {
  return (
    <div className={`col fade-in-stagger delay-${delay}`}>
      <div className="product-card-custom h-100">
        <div className="img-wrapper mb-3">
          {badge && (
            <span className={`product-badge ${badgeType === 'sale' ? 'badge-sale' : 'badge-new'}`}>
              {badge}
            </span>
          )}
          <Link to={`/product/${id}`}>
            <img src={image} alt={name} className="product-img" />
          </Link>
          <button className="quick-add-btn">Quick Add +</button>
        </div>
        <div className="text-center">
          <Link to={`/product/${id}`} className="text-decoration-none text-dark">
            <h5 className="font-serif fs-6 mb-1">{name}</h5>
          </Link>
          <p className="text-muted mb-0 font-sans small">
            <span className="fw-medium text-dark">{price}</span>
            {originalPrice && (
              <span className="text-decoration-line-through ms-2 opacity-50">{originalPrice}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
