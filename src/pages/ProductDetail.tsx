import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Champagne');

  // Mock product data
  const product = {
    id: id,
    name: 'Silk Slip Dress in Pearl',
    price: '$320.00',
    rating: 4.8,
    reviews: 124,
    description: 'A timeless classic. Our Silk Slip Dress is cut on the bias to beautifully drape over your silhouette. Crafted from 100% pure mulberry silk, it features a delicate V-neckline and adjustable spaghetti straps. Perfect for evening wear or layering during the day.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733958-d15319a5120b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    colors: [
      { name: 'Champagne', hex: '#E8D8D0' },
      { name: 'Black', hex: '#222222' },
      { name: 'Ivory', hex: '#FDFBF7' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  };

  return (
    <div className="product-detail-page pt-5 mt-5 min-vh-100 bg-white">
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4 fade-in-stagger delay-1">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/shop" className="text-muted text-decoration-none">Shop</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="row g-5 mb-5">
          {/* Product Images */}
          <div className="col-md-6 fade-in-stagger delay-2">
            <div className="row g-2">
              <div className="col-12">
                <img src={product.images[0]} alt={product.name} className="img-fluid rounded-4 w-100" style={{ objectFit: 'cover', aspectRatio: '3/4' }} />
              </div>
              <div className="col-6">
                <img src={product.images[1]} alt={`${product.name} detail`} className="img-fluid rounded-4 w-100" style={{ objectFit: 'cover', aspectRatio: '3/4' }} />
              </div>
              <div className="col-6">
                <img src={product.images[0]} alt={`${product.name} detail`} className="img-fluid rounded-4 w-100" style={{ objectFit: 'cover', aspectRatio: '3/4' }} />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="col-md-6 fade-in-stagger delay-3">
            <div className="position-sticky" style={{ top: '100px' }}>
              <h1 className="font-serif display-5 fw-bold mb-2">{product.name}</h1>
              <p className="fs-4 mb-3">{product.price}</p>
              
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="d-flex text-warning">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-muted small">({product.reviews} đánh giá)</span>
              </div>

              <p className="text-muted mb-4 lh-lg">{product.description}</p>

              {/* Color Selection */}
              <div className="mb-4">
                <p className="fw-medium mb-2">Color: <span className="text-muted fw-normal">{selectedColor}</span></p>
                <div className="d-flex gap-2">
                  {product.colors.map(color => (
                    <button 
                      key={color.name}
                      className={`color-swatch ${selectedColor === color.name ? 'border-dark shadow-sm' : ''}`}
                      style={{ backgroundColor: color.hex, width: '32px', height: '32px' }}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="fw-medium mb-0">Size: <span className="text-muted fw-normal">{selectedSize}</span></p>
                  <button className="btn btn-link text-muted p-0 text-decoration-none small">Size Guide</button>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <button className="btn btn-dark btn-lg w-100 rounded-pill py-3 mb-4 fw-medium">
                Add to Bag - {product.price}
              </button>

              {/* Features */}
              <div className="d-flex flex-column gap-3 py-4 border-top border-bottom">
                <div className="d-flex align-items-center gap-3 text-muted">
                  <Truck size={20} />
                  <span className="small">Free shipping on orders over $200</span>
                </div>
                <div className="d-flex align-items-center gap-3 text-muted">
                  <RefreshCw size={20} />
                  <span className="small">30-day free returns</span>
                </div>
                <div className="d-flex align-items-center gap-3 text-muted">
                  <ShieldCheck size={20} />
                  <span className="small">2-year quality guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section (Vietnamese as requested) */}
        <div className="row mt-5 pt-5 fade-in-stagger delay-4">
          <div className="col-12">
            <ul className="nav nav-tabs nav-tabs-custom justify-content-center mb-5" role="tablist">
              <li className="nav-item" role="presentation">
                <button className={`nav-link ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Chi tiết</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Đánh giá</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className={`nav-link ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>Chính sách bảo mật</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>Câu hỏi thường gặp</button>
              </li>
            </ul>

            <div className="tab-content max-w-7xl mx-auto" style={{ maxWidth: '800px', margin: '0 auto' }}>
              {/* Chi tiết */}
              {activeTab === 'details' && (
                <div className="fade-in-stagger">
                  <h4 className="font-serif mb-4">Chi tiết sản phẩm</h4>
                  <p className="text-muted lh-lg mb-4">
                    Chiếc váy lụa Silk Slip Dress của chúng tôi được thiết kế để mang lại sự thanh lịch và thoải mái tối đa. 
                    Được cắt may tỉ mỉ theo đường xéo vải (bias cut) giúp tôn lên đường cong tự nhiên của cơ thể.
                  </p>
                  <ul className="text-muted lh-lg">
                    <li><strong>Chất liệu:</strong> 100% Lụa Mulberry cao cấp (19 momme).</li>
                    <li><strong>Thiết kế:</strong> Cổ chữ V tinh tế, dây áo spaghetti có thể điều chỉnh độ dài.</li>
                    <li><strong>Sản xuất:</strong> Được may thủ công tại xưởng may đạt chuẩn đạo đức nghề nghiệp.</li>
                    <li><strong>Bảo quản:</strong> Giặt tay bằng nước lạnh hoặc giặt khô. Không sử dụng chất tẩy mạnh. Phơi trong bóng râm.</li>
                  </ul>
                </div>
              )}

              {/* Đánh giá */}
              {activeTab === 'reviews' && (
                <div className="fade-in-stagger">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="font-serif mb-0">Đánh giá từ khách hàng</h4>
                    <button className="btn btn-outline-dark rounded-pill px-4">Viết đánh giá</button>
                  </div>
                  
                  <div className="d-flex align-items-center gap-3 mb-5 p-4 bg-light rounded-4">
                    <h2 className="display-4 fw-bold mb-0">4.8</h2>
                    <div>
                      <div className="d-flex text-warning mb-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />)}
                      </div>
                      <span className="text-muted small">Dựa trên {product.reviews} đánh giá</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-4">
                    {[1, 2, 3].map((review) => (
                      <div key={review} className="border-bottom pb-4">
                        <div className="d-flex justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="mb-0 fw-bold">Nguyễn Thị A.</h6>
                            <span className="badge bg-success bg-opacity-10 text-success fw-normal rounded-pill">Đã mua hàng</span>
                          </div>
                          <span className="text-muted small">12/10/2026</span>
                        </div>
                        <div className="d-flex text-warning mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                        <p className="text-muted mb-0">Chất lụa cực kỳ mềm mại và mát. Form váy ôm vừa vặn, mặc lên rất sang trọng. Giao hàng nhanh và đóng gói rất cẩn thận, đẹp mắt. Sẽ tiếp tục ủng hộ shop!</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chính sách bảo mật */}
              {activeTab === 'privacy' && (
                <div className="fade-in-stagger">
                  <h4 className="font-serif mb-4">Chính sách bảo mật thông tin</h4>
                  <div className="text-muted lh-lg">
                    <p>Tại Aurelia, chúng tôi cam kết bảo vệ sự riêng tư và thông tin cá nhân của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.</p>
                    <h6 className="fw-bold text-dark mt-4">1. Thu thập thông tin</h6>
                    <p>Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng và cải thiện trải nghiệm mua sắm của bạn (tên, địa chỉ, email, số điện thoại).</p>
                    <h6 className="fw-bold text-dark mt-4">2. Sử dụng thông tin</h6>
                    <p>Thông tin của bạn được sử dụng để giao hàng, hỗ trợ khách hàng và gửi thông tin khuyến mãi (nếu bạn đồng ý nhận).</p>
                    <h6 className="fw-bold text-dark mt-4">3. Bảo mật dữ liệu</h6>
                    <p>Chúng tôi áp dụng các biện pháp bảo mật tiên tiến (mã hóa SSL) để đảm bảo thông tin thanh toán và dữ liệu cá nhân của bạn luôn an toàn tuyệt đối.</p>
                  </div>
                </div>
              )}

              {/* Câu hỏi thường gặp */}
              {activeTab === 'faq' && (
                <div className="fade-in-stagger">
                  <h4 className="font-serif mb-4">Câu hỏi thường gặp (FAQs)</h4>
                  <div className="accordion accordion-custom" id="faqAccordion">
                    <div className="accordion-item border-bottom">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed fw-medium" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                          Làm thế nào để chọn đúng size?
                        </button>
                      </h2>
                      <div id="faq1" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body text-muted">
                          Bạn có thể tham khảo "Bảng kích cỡ" (Size Guide) được đính kèm trên mỗi trang sản phẩm. Nếu bạn vẫn phân vân, hãy liên hệ với bộ phận CSKH để được tư vấn chi tiết dựa trên số đo cơ thể.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item border-bottom">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed fw-medium" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                          Thời gian giao hàng là bao lâu?
                        </button>
                      </h2>
                      <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body text-muted">
                          Đối với các đơn hàng nội địa, thời gian giao hàng dự kiến từ 2-4 ngày làm việc. Đơn hàng quốc tế sẽ mất từ 7-14 ngày tùy thuộc vào vị trí địa lý.
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item border-bottom">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed fw-medium" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                          Tôi có thể đổi trả sản phẩm không?
                        </button>
                      </h2>
                      <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body text-muted">
                          Có, chúng tôi hỗ trợ đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng, với điều kiện sản phẩm còn nguyên tem mác, chưa qua sử dụng và không bị hư hỏng.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
