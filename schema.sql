-- 1. Users table
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- hoặc uuid_generate_v4() nếu dùng extension
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,                       -- nên hash trước khi lưu
    role        VARCHAR(50) NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
    phone       VARCHAR(50),
    
    -- Address fields (có thể tách thành bảng riêng nếu cần nhiều địa chỉ sau này)
    street      VARCHAR(255),
    city        VARCHAR(100),
    state       VARCHAR(100),
    zip_code    VARCHAR(20),
    country     VARCHAR(100),
    
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger để tự động update updated_at (tương tự timestamps: true)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- 2. Categories table
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- 3. Products table
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    price           DECIMAL(12, 2) NOT NULL,
    original_price  DECIMAL(12, 2),
    category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    stock           INTEGER NOT NULL DEFAULT 0,
    images          TEXT[],                               -- array of image URLs
    status          VARCHAR(50) NOT NULL DEFAULT 'Active'
                    CHECK (status IN ('Active', 'Low Stock', 'Out of Stock')),
    is_new_arrival  BOOLEAN NOT NULL DEFAULT FALSE,
    is_sale         BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Index hữu ích
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);


-- 4. Orders table
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Shipping address (có thể tách bảng nếu user có nhiều địa chỉ)
    shipping_street VARCHAR(255) NOT NULL,
    shipping_city   VARCHAR(100) NOT NULL,
    shipping_state  VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    
    payment_method  VARCHAR(100) NOT NULL,
    
    -- Payment result (lưu dưới dạng JSONB để linh hoạt)
    payment_result  JSONB,
    
    items_price     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_price       DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_price  DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_price     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    is_paid         BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at         TIMESTAMP WITH TIME ZONE,
    
    is_delivered    BOOLEAN NOT NULL DEFAULT FALSE,
    delivered_at    TIMESTAMP WITH TIME ZONE,
    
    status          VARCHAR(50) NOT NULL DEFAULT 'Processing'
                    CHECK (status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
    
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Index
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);


-- 5. Order Items (bảng riêng để lưu chi tiết sản phẩm trong đơn hàng - normalized)
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    name        VARCHAR(255) NOT NULL,               -- snapshot tên sản phẩm lúc đặt hàng
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    price       DECIMAL(12, 2) NOT NULL,             -- giá lúc đặt hàng
    image       TEXT,                                -- ảnh chính lúc đặt
    
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);