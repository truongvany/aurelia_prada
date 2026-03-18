import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const products = [
  { id: 1, name: 'Silk Slip Dress', price: '$120', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Linen Wrap Blouse', price: '$85', image: 'https://images.unsplash.com/photo-1515347619152-141b212f4551?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'Cashmere Cardigan', price: '$150', image: 'https://images.unsplash.com/photo-1574291814206-363acdf2aa79?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 4, name: 'Pleated Midi Skirt', price: '$95', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 5, name: 'Tailored Trousers', price: '$110', image: 'https://images.unsplash.com/photo-1509631179647-0c500ba14174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 6, name: 'Oversized Blazer', price: '$180', image: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const Shop = () => {
  return (
    <div className="shop-page pt-5 mt-5 min-vh-100">
      <div className="container py-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 mb-5 mb-md-0 fade-in-stagger delay-1">
            <div className="position-sticky" style={{ top: '100px' }}>
              {/* Search */}
              <div className="position-relative mb-4">
                <input type="text" className="form-control search-custom ps-4" placeholder="Search products..." />
                <Search size={18} className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
              </div>

              {/* Filters Accordion */}
              <div className="accordion accordion-custom" id="filterAccordion">
                {/* Categories */}
                <div className="accordion-item mb-4">
                  <h2 className="accordion-header" id="headingCategories">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCategories" aria-expanded="true" aria-controls="collapseCategories">
                      Categories
                    </button>
                  </h2>
                  <div id="collapseCategories" className="accordion-collapse collapse show" aria-labelledby="headingCategories">
                    <div className="accordion-body">
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                        <li><a href="#" className="text-decoration-none text-dark fw-medium">New In</a></li>
                        <li><a href="#" className="text-decoration-none text-muted">Clothing</a></li>
                        <li><a href="#" className="text-decoration-none text-muted">Shoes</a></li>
                        <li><a href="#" className="text-decoration-none text-muted">Accessories</a></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="accordion-item mb-4">
                  <h2 className="accordion-header" id="headingPrice">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePrice" aria-expanded="false" aria-controls="collapsePrice">
                      Price Range
                    </button>
                  </h2>
                  <div id="collapsePrice" className="accordion-collapse collapse" aria-labelledby="headingPrice">
                    <div className="accordion-body">
                      <input type="range" className="form-range" min="0" max="500" id="priceRange" />
                      <div className="d-flex justify-content-between text-muted small mt-2">
                        <span>$0</span>
                        <span>$500+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color */}
                <div className="accordion-item mb-4">
                  <h2 className="accordion-header" id="headingColor">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseColor" aria-expanded="false" aria-controls="collapseColor">
                      Color
                    </button>
                  </h2>
                  <div id="collapseColor" className="accordion-collapse collapse" aria-labelledby="headingColor">
                    <div className="accordion-body d-flex flex-wrap gap-2">
                      <span className="color-swatch" style={{ backgroundColor: '#000000' }} title="Black"></span>
                      <span className="color-swatch" style={{ backgroundColor: '#FFFFFF' }} title="White"></span>
                      <span className="color-swatch" style={{ backgroundColor: '#E8D8D0' }} title="Dusty Rose"></span>
                      <span className="color-swatch" style={{ backgroundColor: '#C5A89E' }} title="Deeper Rose"></span>
                      <span className="color-swatch" style={{ backgroundColor: '#8B9D83' }} title="Sage"></span>
                      <span className="color-swatch" style={{ backgroundColor: '#A3B1C6' }} title="Slate Blue"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="col-md-9">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 fade-in-stagger delay-2">
              <h2 className="font-serif m-0">All Collections</h2>
              <div className="dropdown">
                <button className="btn btn-light bg-white border-0 shadow-sm rounded-pill px-4 py-2 dropdown-toggle d-flex align-items-center gap-2" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  Sort By
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm rounded-3" aria-labelledby="sortDropdown">
                  <li><a className="dropdown-item" href="#">Featured</a></li>
                  <li><a className="dropdown-item" href="#">Newest</a></li>
                  <li><a className="dropdown-item" href="#">Price: Low to High</a></li>
                  <li><a className="dropdown-item" href="#">Price: High to Low</a></li>
                </ul>
              </div>
            </div>

            {/* Grid */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 mb-5">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id} 
                  name={product.name} 
                  price={product.price} 
                  image={product.image} 
                  delay={(index % 6) + 1} 
                />
              ))}
            </div>

            {/* Pagination */}
            <nav aria-label="Page navigation" className="fade-in-stagger delay-6 mt-5">
              <ul className="pagination pagination-custom justify-content-center">
                <li className="page-item disabled">
                  <a className="page-link" href="#" tabIndex={-1} aria-disabled="true">Prev</a>
                </li>
                <li className="page-item active"><a className="page-link" href="#">1</a></li>
                <li className="page-item"><a className="page-link" href="#">2</a></li>
                <li className="page-item"><a className="page-link" href="#">3</a></li>
                <li className="page-item">
                  <a className="page-link" href="#">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
