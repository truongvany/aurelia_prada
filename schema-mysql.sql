-- MySQL Schema for Aurelia Prada

-- 1. Users table
CREATE TABLE users (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'user',
    phone           VARCHAR(50),
    
    -- Address fields
    street          VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    zip_code        VARCHAR(20),
    country         VARCHAR(100),
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT check_role CHECK (role IN ('user', 'admin')),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- 2. Categories table
CREATE TABLE categories (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categories_slug (slug)
);

-- 3. Products table
CREATE TABLE products (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           DECIMAL(12, 2) NOT NULL,
    original_price  DECIMAL(12, 2),
    category_id     INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    color           VARCHAR(100),
    stock           INT NOT NULL DEFAULT 0,
    image           TEXT,
    badge           VARCHAR(50),
    status          VARCHAR(50) NOT NULL DEFAULT 'Active',
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT check_status CHECK (status IN ('Active', 'Low Stock', 'Out of Stock')),
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status)
);

-- 4. Orders table
CREATE TABLE orders (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Shipping address
    shipping_street VARCHAR(255) NOT NULL,
    shipping_city   VARCHAR(100) NOT NULL,
    shipping_state  VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    
    payment_method  VARCHAR(100),
    payment_result  JSON,
    
    items_price     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_price       DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_price  DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_price     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    is_paid         BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at         TIMESTAMP NULL,
    
    is_delivered    BOOLEAN NOT NULL DEFAULT FALSE,
    delivered_at    TIMESTAMP NULL,
    
    status          VARCHAR(50) NOT NULL DEFAULT 'Processing',
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT check_order_status CHECK (status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status)
);

-- 5. Order Items table
CREATE TABLE order_items (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    order_id        INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    price           DECIMAL(12, 2) NOT NULL,
    image           TEXT,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);
