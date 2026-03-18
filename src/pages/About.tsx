import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Heart, Star } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page pt-5 mt-5">
      {/* Hero Section */}
      <section className="py-5 bg-white fade-in-stagger delay-1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-4 font-serif fw-bold mb-4">Câu chuyện của Aurelia</h1>
              <p className="lead text-muted mb-4 pe-lg-5">
                Aurelia ra đời từ một khát khao giản dị: tạo ra những trang phục giúp phụ nữ cảm thấy xinh đẹp, thoải mái và tự tin mỗi ngày.
              </p>
              <p className="text-muted pe-lg-5">
                Được thành lập vào năm 2020, chúng tôi tin vào sức mạnh của thiết kế tối giản và thời trang bền vững. Mỗi sản phẩm đều được thiết kế tỉ mỉ tại studio của chúng tôi và sản xuất có đạo đức bằng các chất liệu cao cấp, thân thiện với môi trường.
              </p>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Our Studio" 
                className="img-fluid rounded-4 shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lịch sử phát triển (Timeline) */}
      <section className="py-5 bg-light fade-in-stagger delay-2">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="font-serif display-6 mb-3">Hành trình phát triển</h2>
            <p className="text-muted">Những cột mốc đáng nhớ làm nên Aurelia hôm nay.</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="timeline-custom position-relative">
                {/* Timeline Item 1 */}
                <div className="d-flex mb-4 position-relative">
                  <div className="timeline-dot bg-dark rounded-circle border border-4 border-white shadow-sm" style={{ width: '20px', height: '20px', zIndex: 2, marginTop: '5px' }}></div>
                  <div className="ms-4 pb-4 border-bottom w-100">
                    <h5 className="font-serif fw-bold mb-1">2020 - Khởi nguồn</h5>
                    <p className="text-muted mb-0">Aurelia chính thức ra mắt bộ sưu tập đầu tiên với 10 thiết kế lụa cơ bản, tập trung vào sự thoải mái khi ở nhà.</p>
                  </div>
                </div>
                {/* Timeline Item 2 */}
                <div className="d-flex mb-4 position-relative">
                  <div className="timeline-dot bg-dark rounded-circle border border-4 border-white shadow-sm" style={{ width: '20px', height: '20px', zIndex: 2, marginTop: '5px' }}></div>
                  <div className="ms-4 pb-4 border-bottom w-100">
                    <h5 className="font-serif fw-bold mb-1">2022 - Mở rộng quy mô</h5>
                    <p className="text-muted mb-0">Khai trương cửa hàng flagship đầu tiên tại trung tâm thành phố và ra mắt dòng sản phẩm thời trang công sở thanh lịch.</p>
                  </div>
                </div>
                {/* Timeline Item 3 */}
                <div className="d-flex mb-4 position-relative">
                  <div className="timeline-dot bg-dark rounded-circle border border-4 border-white shadow-sm" style={{ width: '20px', height: '20px', zIndex: 2, marginTop: '5px' }}></div>
                  <div className="ms-4 pb-4 border-bottom w-100">
                    <h5 className="font-serif fw-bold mb-1">2024 - Bước tiến bền vững</h5>
                    <p className="text-muted mb-0">Chuyển đổi 80% nguồn nguyên liệu sang các chất liệu tái chế và hữu cơ, đạt chứng nhận thời trang bền vững.</p>
                  </div>
                </div>
                {/* Timeline Item 4 */}
                <div className="d-flex position-relative">
                  <div className="timeline-dot bg-dark rounded-circle border border-4 border-white shadow-sm" style={{ width: '20px', height: '20px', zIndex: 2, marginTop: '5px' }}></div>
                  <div className="ms-4 w-100">
                    <h5 className="font-serif fw-bold mb-1">2026 - Vươn tầm quốc tế</h5>
                    <p className="text-muted mb-0">Hợp tác với các thương hiệu lớn toàn cầu và phục vụ hơn 100.000 khách hàng trên toàn thế giới.</p>
                  </div>
                </div>
                {/* Timeline Line */}
                <div className="position-absolute bg-secondary" style={{ width: '2px', top: '15px', bottom: '0', left: '9px', zIndex: 1 }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-5 my-5 fade-in-stagger delay-3">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="font-serif display-6 mb-3">Giá trị cốt lõi</h2>
          </div>
          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <div className="card h-100 p-4 text-center bg-transparent border-0">
                <div className="mb-4">
                  <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px' }}>
                    <span className="font-serif fs-3 text-dark">01</span>
                  </div>
                </div>
                <h4 className="font-serif mb-3">Bền vững</h4>
                <p className="text-muted">Sử dụng vải thân thiện với môi trường và quy trình sản xuất có đạo đức để giảm thiểu tác động đến trái đất.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 text-center bg-transparent border-0">
                <div className="mb-4">
                  <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px' }}>
                    <span className="font-serif fs-3 text-dark">02</span>
                  </div>
                </div>
                <h4 className="font-serif mb-3">Chất lượng</h4>
                <p className="text-muted">Trang phục được chế tác để tồn tại lâu dài, sử dụng vật liệu cao cấp và sự chú ý tỉ mỉ đến từng chi tiết.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 text-center bg-transparent border-0">
                <div className="mb-4">
                  <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '80px', height: '80px' }}>
                    <span className="font-serif fs-3 text-dark">03</span>
                  </div>
                </div>
                <h4 className="font-serif mb-3">Vượt thời gian</h4>
                <p className="text-muted">Thiết kế những phom dáng cổ điển vượt qua các xu hướng nhất thời, đảm bảo tủ đồ của bạn luôn hợp thời.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="py-5 bg-dark text-white fade-in-stagger delay-4">
        <div className="container text-center mb-4">
          <h2 className="font-serif fs-3 mb-0">Đối tác & Thương hiệu đồng hành</h2>
        </div>
        <div className="marquee-container bg-dark border-0 py-3">
          <div className="marquee-content">
            <span className="brand-logo text-white opacity-50">VOGUE</span>
            <span className="brand-logo text-white opacity-50">ELLE</span>
            <span className="brand-logo text-white opacity-50">HARPER'S BAZAAR</span>
            <span className="brand-logo text-white opacity-50">MARIE CLAIRE</span>
            <span className="brand-logo text-white opacity-50">COSMOPOLITAN</span>
            <span className="brand-logo text-white opacity-50">GQ</span>
            {/* Duplicate for seamless loop */}
            <span className="brand-logo text-white opacity-50">VOGUE</span>
            <span className="brand-logo text-white opacity-50">ELLE</span>
            <span className="brand-logo text-white opacity-50">HARPER'S BAZAAR</span>
            <span className="brand-logo text-white opacity-50">MARIE CLAIRE</span>
            <span className="brand-logo text-white opacity-50">COSMOPOLITAN</span>
            <span className="brand-logo text-white opacity-50">GQ</span>
          </div>
        </div>
      </section>

      {/* Sự ủng hộ của khách hàng */}
      <section className="py-5 my-5 fade-in-stagger delay-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <h2 className="font-serif display-6 mb-4">Cộng đồng Aurelia</h2>
              <p className="text-muted mb-5">
                Sự tin tưởng và ủng hộ của hàng ngàn khách hàng chính là động lực lớn nhất để chúng tôi không ngừng hoàn thiện và mang đến những sản phẩm tuyệt vời hơn.
              </p>
              <div className="d-flex gap-4 mb-4">
                <div>
                  <h3 className="display-5 font-serif fw-bold mb-0">100k+</h3>
                  <p className="text-muted small text-uppercase tracking-wider">Khách hàng</p>
                </div>
                <div className="border-start"></div>
                <div>
                  <h3 className="display-5 font-serif fw-bold mb-0">4.9/5</h3>
                  <p className="text-muted small text-uppercase tracking-wider">Đánh giá sao</p>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="row g-4">
                <div className="col-md-6 mt-md-5">
                  <div className="card border-0 bg-light p-4 rounded-4 shadow-sm h-100">
                    <div className="d-flex text-warning mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="fst-italic text-muted mb-4">"Chất lượng vải lụa thực sự xuất sắc. Tôi đã mặc chiếc váy này đến 3 sự kiện khác nhau và luôn nhận được lời khen."</p>
                    <div className="d-flex align-items-center gap-3 mt-auto">
                      <div className="bg-secondary rounded-circle" style={{ width: '40px', height: '40px', backgroundImage: 'url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)', backgroundSize: 'cover' }}></div>
                      <div>
                        <h6 className="mb-0 fw-bold">Trần Mai Anh</h6>
                        <small className="text-muted">Hà Nội</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 bg-light p-4 rounded-4 shadow-sm h-100">
                    <div className="d-flex text-warning mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="fst-italic text-muted mb-4">"Dịch vụ chăm sóc khách hàng tuyệt vời. Đóng gói đẹp như một món quà. Chắc chắn sẽ mua thêm nhiều lần nữa!"</p>
                    <div className="d-flex align-items-center gap-3 mt-auto">
                      <div className="bg-secondary rounded-circle" style={{ width: '40px', height: '40px', backgroundImage: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80)', backgroundSize: 'cover' }}></div>
                      <div>
                        <h6 className="mb-0 fw-bold">Lê Ngọc Hân</h6>
                        <small className="text-muted">TP. Hồ Chí Minh</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chính sách */}
      <section className="py-5 bg-light fade-in-stagger delay-6">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="font-serif display-6 mb-3">Chính sách & Cam kết</h2>
            <p className="text-muted">Trải nghiệm mua sắm an tâm tuyệt đối tại Aurelia.</p>
          </div>
          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="text-center p-3">
                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-4" style={{ width: '70px', height: '70px' }}>
                  <Truck size={30} className="text-dark" />
                </div>
                <h5 className="font-serif fw-bold mb-2">Miễn phí vận chuyển</h5>
                <p className="text-muted small">Cho mọi đơn hàng nội địa từ 1.000.000đ. Giao hàng nhanh chóng 2-4 ngày.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="text-center p-3">
                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-4" style={{ width: '70px', height: '70px' }}>
                  <RefreshCw size={30} className="text-dark" />
                </div>
                <h5 className="font-serif fw-bold mb-2">Đổi trả 30 ngày</h5>
                <p className="text-muted small">Hỗ trợ đổi trả miễn phí tận nhà trong vòng 30 ngày nếu không ưng ý.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="text-center p-3">
                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-4" style={{ width: '70px', height: '70px' }}>
                  <ShieldCheck size={30} className="text-dark" />
                </div>
                <h5 className="font-serif fw-bold mb-2">Bảo mật thông tin</h5>
                <p className="text-muted small">Dữ liệu cá nhân và thông tin thanh toán được mã hóa an toàn tuyệt đối.</p>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="text-center p-3">
                <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm mb-4" style={{ width: '70px', height: '70px' }}>
                  <Heart size={30} className="text-dark" />
                </div>
                <h5 className="font-serif fw-bold mb-2">Chăm sóc tận tâm</h5>
                <p className="text-muted small">Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn 24/7 qua hotline và email.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
