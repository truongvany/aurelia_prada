import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Phone, Mail } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const trendingProducts = [
  { id: 1, name: 'Silk Slip Dress in Pearl', price: '1.690.000đ', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: 'New', badgeType: 'new' as const },
  { id: 2, name: 'Linen Wrap Blouse', price: '1.590.000đ', image: 'https://images.unsplash.com/photo-1515347619152-141b212f4551?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: 'New', badgeType: 'new' as const },
  { id: 3, name: 'Cashmere Cardigan', price: '1.390.000đ', image: 'https://images.unsplash.com/photo-1574291814206-363acdf2aa79?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: 'New', badgeType: 'new' as const },
  { id: 4, name: 'Pleated Midi Skirt', price: '1.290.000đ', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: 'New', badgeType: 'new' as const },
];

const saleProducts = [
  { id: 5, name: 'Tailored Trousers', price: '534.000đ', originalPrice: '890.000đ', image: 'https://images.unsplash.com/photo-1509631179647-0c500ba14174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: '-40%', badgeType: 'sale' as const },
  { id: 6, name: 'Oversized Blazer', price: '850.500đ', originalPrice: '1.890.000đ', image: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: '-55%', badgeType: 'sale' as const },
  { id: 7, name: 'Merino Wool Overcoat', price: '876.000đ', originalPrice: '2.190.000đ', image: 'https://images.unsplash.com/photo-1515347619152-141b212f4551?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: '-60%', badgeType: 'sale' as const },
  { id: 8, name: 'Pointed Mule in Cream', price: '716.000đ', originalPrice: '1.790.000đ', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', badge: '-60%', badgeType: 'sale' as const },
];

const galleryImages = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509631179647-0c500ba14174?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1434389678369-182cb1301209?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
];

const Home = () => {
  return (
    <div className="home-page p-2 p-md-4">
      {/* Hero Section */}
      <section className="hero-section min-vh-100 d-flex align-items-center position-relative mt-5 mt-md-0">
        <div className="container position-relative z-2">
          <div className="row align-items-center pt-5">
            <div className="col-lg-6 text-center text-lg-start pt-5 pt-lg-0">
              <span className="badge-custom mb-3 d-inline-block">Spring Summer 2026 Collection</span>
              <h1 className="display-2 font-serif mb-4 fw-bold lh-sm">
                Elegance in <br />
                <span className="text-white font-serif fst-italic">Simplicity</span>
              </h1>
              <p className="lead mb-5 text-muted pe-lg-5">
                Discover our new collection of minimalist, sustainable fashion designed for the modern woman.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                <Link to="/shop" className="btn btn-dark btn-lg rounded-pill px-5">Shop Now</Link>
                <Link to="/about" className="btn btn-outline-dark btn-lg rounded-pill px-5">Our Story</Link>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0 position-relative d-none d-md-block">
              <div className="position-relative floating-element">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Fashion Model" 
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ objectFit: 'cover', height: '600px', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-5 mt-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="font-serif display-6 mb-3 text-uppercase tracking-wider">New Arrival</h2>
            <div className="d-flex justify-content-center gap-4">
              <span className="text-dark fw-medium border-bottom border-dark pb-1 cursor-pointer">Aurelia</span>
              <span className="text-muted cursor-pointer">Metagent</span>
            </div>
          </div>
          
          <div className="row g-4">
            {trendingProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                {...product} 
                delay={(index % 4) + 1} 
              />
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to="/shop" className="btn btn-outline-dark rounded-pill px-5 py-2">Xem tất cả</Link>
          </div>
        </div>
      </section>

      {/* Hot Summer Deal */}
      <section className="py-5 bg-light rounded-4 mx-2 mx-md-4">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="font-serif display-6 mb-3 text-uppercase tracking-wider">Hot Summer Deal | Sale Upto 70%</h2>
            <div className="d-flex justify-content-center gap-4">
              <span className="text-dark fw-medium border-bottom border-dark pb-1 cursor-pointer">Aurelia</span>
              <span className="text-muted cursor-pointer">Metagent</span>
            </div>
          </div>
          
          <div className="row g-4">
            {saleProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                {...product} 
                delay={(index % 4) + 1} 
              />
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to="/shop" className="btn btn-outline-dark rounded-pill px-5 py-2 bg-white">Xem tất cả</Link>
          </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="font-serif display-6 mb-0 text-uppercase tracking-wider">Summer Special - Ưu đãi đặc biệt từ 150k</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="position-relative rounded-4 overflow-hidden shadow-sm" style={{ aspectRatio: '21/9' }}>
                <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Promo 1" className="w-100 h-100 object-fit-cover" />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex align-items-center p-5">
                  <div className="text-white">
                    <h3 className="font-serif display-5 fw-bold mb-2">Summer<br/>Special</h3>
                    <p className="fs-5 mb-0">Từ 150K</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="position-relative rounded-4 overflow-hidden shadow-sm" style={{ aspectRatio: '21/9' }}>
                <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Promo 2" className="w-100 h-100 object-fit-cover" />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex align-items-center p-5">
                  <div className="text-white">
                    <h3 className="font-serif display-5 fw-bold mb-2">Ưu đãi<br/>Đặc biệt</h3>
                    <p className="fs-5 mb-0">Lên đến 50%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-5">
        <div className="container-fluid px-0">
          <div className="text-center mb-5">
            <h2 className="font-serif display-6 mb-0 text-uppercase tracking-wider">Gallery</h2>
          </div>
          <div className="row g-0">
            {galleryImages.map((img, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-2 flex-grow-1">
                <div className="gallery-wrapper">
                  <img src={img} alt={`Gallery ${index + 1}`} className="gallery-img" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="marquee-container my-5">
        <div className="marquee-content">
          <span className="brand-logo">VOGUE</span>
          <span className="brand-logo">ELLE</span>
          <span className="brand-logo">HARPER'S BAZAAR</span>
          <span className="brand-logo">MARIE CLAIRE</span>
          <span className="brand-logo">COSMOPOLITAN</span>
          <span className="brand-logo">GQ</span>
          {/* Duplicate for seamless loop */}
          <span className="brand-logo">VOGUE</span>
          <span className="brand-logo">ELLE</span>
          <span className="brand-logo">HARPER'S BAZAAR</span>
          <span className="brand-logo">MARIE CLAIRE</span>
          <span className="brand-logo">COSMOPOLITAN</span>
          <span className="brand-logo">GQ</span>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <h2 className="section-title">What Our Muses Say</h2>
          <div className="row g-4 mt-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="col-md-4">
                <div className="card p-4 h-100 text-center bg-light border-0">
                  <div className="d-flex justify-content-center gap-1 mb-3 text-warning">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="fst-italic text-muted mb-4">"The quality and fit are absolutely perfect. Aurelia has become my go-to for elegant, everyday pieces."</p>
                  <h6 className="font-serif mb-0">Sarah Jenkins</h6>
                  <small className="text-muted">Verified Buyer</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-5 mb-5">
        <div className="container">
          <div className="card bg-dark text-white rounded-4 border-0 overflow-hidden">
            <div className="row g-0">
              <div className="col-md-6 p-5 d-flex flex-column justify-content-center">
                <h2 className="font-serif display-6 mb-4">Need Assistance?</h2>
                <p className="lead text-white-50 mb-5">Our styling advisors are here to help you find the perfect piece or answer any questions.</p>
                
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white bg-opacity-10 p-3 rounded-circle">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h6 className="mb-1">Call Us</h6>
                      <p className="text-white-50 mb-0">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white bg-opacity-10 p-3 rounded-circle">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h6 className="mb-1">Email Us</h6>
                      <p className="text-white-50 mb-0">hello@aurelia.com</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 d-none d-md-block">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Contact Us" 
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
