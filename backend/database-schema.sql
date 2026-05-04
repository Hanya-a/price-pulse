SET DEFINE OFF;

-- =========================================================
-- PRICE PULSE - CAIRO SEED DATA
-- Oracle SQL
-- =========================================================

-- Optional cleanup (run only if the tables already exist)
BEGIN EXECUTE IMMEDIATE 'DROP TABLE product_offers'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE products'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE stores'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE click_tracking'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE users'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE categories'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- =========================================================
-- TABLES
-- =========================================================

CREATE TABLE users (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(200) NOT NULL,
    email VARCHAR2(200) NOT NULL UNIQUE,
    password VARCHAR2(200) NOT NULL,
    city VARCHAR2(100),
    dob VARCHAR2(100),
    gender VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id NUMBER PRIMARY KEY,
    category_name VARCHAR2(100) NOT NULL UNIQUE
);

CREATE TABLE stores (
    store_id NUMBER PRIMARY KEY,
    store_name VARCHAR2(100) NOT NULL UNIQUE,
    city VARCHAR2(100) DEFAULT 'Cairo',
    is_local NUMBER(1) DEFAULT 1 CHECK (is_local IN (0,1)),
    base_url VARCHAR2(500)
);

CREATE TABLE products (
    product_id NUMBER PRIMARY KEY,
    category_id NUMBER NOT NULL,
    product_name VARCHAR2(200) NOT NULL,
    brand VARCHAR2(100),
    unit_info VARCHAR2(100),
    image_url VARCHAR2(1000),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE product_offers (
    offer_id NUMBER PRIMARY KEY,
    product_id NUMBER NOT NULL,
    store_id NUMBER NOT NULL,
    price_egp NUMBER(10,2),
    product_url VARCHAR2(1000) NOT NULL,
    availability_city VARCHAR2(100) DEFAULT 'Cairo',
    CONSTRAINT fk_offers_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_offers_store
        FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

CREATE TABLE click_tracking (
    click_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id NUMBER NOT NULL,
    store_id NUMBER NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clicks_product
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_clicks_store
        FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- =========================================================
-- CATEGORIES
-- =========================================================

INSERT INTO categories VALUES (1, 'Groceries');
INSERT INTO categories VALUES (2, 'Pharmacy');
INSERT INTO categories VALUES (3, 'Personal Care');
INSERT INTO categories VALUES (4, 'Electronics');

-- =========================================================
-- STORES
-- I treated "local" as Egypt/Cairo-serving store sites.
-- =========================================================

INSERT INTO stores VALUES (1, 'Metro Markets',   'Cairo', 1, 'https://www.metro-markets.com');
INSERT INTO stores VALUES (2, 'Carrefour Egypt', 'Cairo', 1, 'https://www.carrefouregypt.com');
INSERT INTO stores VALUES (3, 'Spinneys Egypt',  'Cairo', 1, 'https://spinneys-egypt.com');

INSERT INTO stores VALUES (4, 'Seif Pharmacies', 'Cairo', 1, 'https://seif-online.com');
INSERT INTO stores VALUES (5, 'Chefaa',          'Cairo', 1, 'https://chefaa.com');
INSERT INTO stores VALUES (6, 'Carrefour Health','Cairo', 1, 'https://www.carrefouregypt.com');

INSERT INTO stores VALUES (7, 'B.TECH',          'Cairo', 1, 'https://btech.com');
INSERT INTO stores VALUES (8, 'Raya Shop',       'Cairo', 1, 'https://www.rayashop.com');
INSERT INTO stores VALUES (9, 'Jumia Egypt',     'Cairo', 1, 'https://www.jumia.com.eg');

-- =========================================================
-- PRODUCTS
-- 5 per category
-- =========================================================

-- Groceries
INSERT INTO products VALUES (101, 1, 'Juhayna Full Cream Milk', 'Juhayna', '1L', 'https://cdn.mafrservices.com/sys-master-root/h73/ha2/10065366024222/12719_main.jpg?im=Resize=376');
INSERT INTO products VALUES (102, 1, 'Nutella Hazelnut Spread', 'Nutella', '350g', 'https://m.media-amazon.com/images/I/517jBIOV3XL._AC_UF894,1000_QL80_.jpg');
INSERT INTO products VALUES (103, 1, 'Al Doha Egyptian White Rice', 'Al Doha', '1kg', 'https://m.media-amazon.com/images/I/710iVFGKR4L._AC_SY300_SX300_QL70_ML2_.jpg');
INSERT INTO products VALUES (104, 1, 'Lipton Yellow Label Tea Bags', 'Lipton', '100 bags', 'https://m.media-amazon.com/images/I/61nro6GH4bL._AC_SX679_.jpg');
INSERT INTO products VALUES (105, 1, 'Ariel Automatic Powder Lavender', 'Ariel', '2.5kg', 'https://m.media-amazon.com/images/I/71bXfjzumML._AC_SY879_.jpg');

-- Pharmacy
INSERT INTO products VALUES (201, 2, 'Panadol Extra Optizorb', 'Panadol', '24 tablets', 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/panadol-reskin/ar_AE/adult/Panadol%20Extra%20455x455.jpg.rendition.455.455.jpg?auto=format');
INSERT INTO products VALUES (202, 2, 'Strepsils Honey & Lemon', 'Strepsils', '24 lozenges', 'https://m.media-amazon.com/images/I/81yEWxYtayL._AC_SX679_.jpg');
INSERT INTO products VALUES (203, 2, 'Voltaren Emulgel', 'Voltaren', '50g', 'https://cdn11.bigcommerce.com/s-jolu2e/images/stencil/1280x1280/products/2116/8046/Voltaren_Emulgel_50g__72135.1727661253.jpg?c=2');
INSERT INTO products VALUES (204, 2, 'Centrum Silver Adults 50+', 'Centrum', '100 tablets', 'https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/23/1240431/1.jpg?6639');
INSERT INTO products VALUES (205, 2, 'Sinomarin Cold & Flu Nasal Spray', 'Sinomarin', '30ml', 'https://media.zid.store/thumbs/4e24910d-e706-4e18-a65f-fdb5b376262a/05e10d10-5507-4ee9-a88a-760001c6050c-thumbnail-1000x1000-70.jpg');

-- Personal Care
INSERT INTO products VALUES (301, 3, 'Nivea Black & White Invisible Roll On', 'Nivea', '50ml', 'https://m.media-amazon.com/images/I/61RwwRxZ0LL._AC_SX679_.jpg');
INSERT INTO products VALUES (302, 3, 'Signal Cavity Fighter Toothpaste', 'Signal', '120ml', 'https://m.media-amazon.com/images/I/71kFQUysZqL._AC_SX679_.jpg');
INSERT INTO products VALUES (303, 3, 'Garnier Micellar Cleansing Water', 'Garnier', '400ml', 'https://m.media-amazon.com/images/I/51Z2OL1x66L._AC_SX679_.jpg');
INSERT INTO products VALUES (304, 3, 'Johnson''s Fresh Hydration Micellar Cleansing Jelly', 'Johnson''s', '200ml', 'https://m.media-amazon.com/images/I/619OoFVF1AL._AC_SX679_.jpg');
INSERT INTO products VALUES (305, 3, 'Vaseline Essential Healing Body Lotion', 'Vaseline', '400ml', 'https://m.media-amazon.com/images/I/51bczFcRx7L._AC_SX679_.jpg');

-- Electronics
INSERT INTO products VALUES (401, 4, 'Samsung Galaxy A15', 'Samsung', '128GB / 6GB', 'https://i.ebayimg.com/images/g/wnsAAeSwodJpcqGx/s-l1600.webp');
INSERT INTO products VALUES (402, 4, 'Lenovo IdeaPad Slim 3 15IRU8', 'Lenovo', 'Intel i3 / 8GB / 256GB SSD', 'https://f.nooncdn.com/p/pnsku/N70207510V/45/_/1756209566/a4753f68-ec7e-42d2-a91b-12299b43b01a.jpg?width=800');
INSERT INTO products VALUES (403, 4, 'TP-Link Tapo C200 Camera', 'TP-Link', 'Wi-Fi security camera', 'https://m.media-amazon.com/images/I/41a5w8F1xGL._AC_SX679_.jpg');
INSERT INTO products VALUES (404, 4, 'Xiaomi Redmi Buds 6 Play', 'Xiaomi', 'Wireless earbuds', 'https://f.nooncdn.com/p/pnsku/N70126625V/45/_/1764242397/d52f6a41-4692-4c65-a4c6-8d591955a6bc.jpg?width=800');
INSERT INTO products VALUES (405, 4, 'Apple AirPods 2nd Generation', 'Apple', 'Charging case', 'https://i.ebayimg.com/images/g/0pAAAOSwTu5lwUAZ/s-l1600.webp');

-- =========================================================
-- PRODUCT OFFERS
-- 3 store links per product
-- =========================================================

INSERT ALL
-- -------------------------
-- GROCERIES
-- -------------------------
INTO product_offers VALUES (1001, 101, 1, 44.99, 'https://www.metro-markets.com/product/Juhayna-Full-Cream-Milk---1kg/25804', 'Cairo')
INTO product_offers VALUES (1002, 101, 2, 44.99, 'https://www.carrefouregypt.com/mafegy/en/full-cream-milk/juhayna-full-cream-milk-1l/p/12721', 'Cairo')
INTO product_offers VALUES (1003, 101, 3, 294.00, 'https://spinneys-egypt.com/en/juhayna-full-cream-milk-6-pieces-1-l', 'Cairo')

INTO product_offers VALUES (1004, 102, 1, 213.75, 'https://www.metro-markets.com/index.php/en/product/Ferrero-Nutella-Hazelnut-With-Coca-350g/8100', 'Cairo')
INTO product_offers VALUES (1005, 102, 2, 212.95, 'https://www.carrefouregypt.com/mafegy/en/chocolate-spread/nutella-chocolate-spread-nut-350g/p/19476', 'Cairo')
INTO product_offers VALUES (1006, 102, 3, 213.95, 'https://spinneys-egypt.com/en/nutella-chocolate-spread-withhazelnut-350-gm-spinneys', 'Cairo')

INTO product_offers VALUES (1007, 103, 1, 37.99, 'https://www.metro-markets.com/product/Al-Doha-Egyptian-White-Rice---1kg/4613', 'Cairo')
INTO product_offers VALUES (1008, 103, 2, 35.99, 'https://www.carrefouregypt.com/mafegy/en/egyptian-rice/eldoha-rice-1k/p/17997', 'Cairo')
INTO product_offers VALUES (1009, 103, 3, 40.95, 'https://spinneys-egypt.com/en/100757', 'Cairo')

INTO product_offers VALUES (1010, 104, 1, 186.50, 'https://gitlab.metro-markets.com/product/Lipton-Yellow-Label-100Bags/37228', 'Cairo')
INTO product_offers VALUES (1011, 104, 2, 154.95, 'https://www.carrefouregypt.com/mafegy/en/tea-bags/lipton-yellow-label-teabag-100x2g/p/590189', 'Cairo')
INTO product_offers VALUES (1012, 104, 3, 154.95, 'https://spinneys-egypt.com/en/lipton-tea-bags-100pc', 'Cairo')

INTO product_offers VALUES (1013, 105, 1, 239.95, 'https://www.metro-markets.com/product/Ariel-Automatic-Powder-Lavender--2.5kg/30981', 'Cairo')
INTO product_offers VALUES (1014, 105, 2, 234.75, 'https://www.carrefouregypt.com/mafegy/en/c/laundry-detergent', 'Cairo')
INTO product_offers VALUES (1015, 105, 3, 245.00, 'https://spinneys-egypt.com/en/household-cleaning/laundry', 'Cairo')

-- -------------------------
-- PHARMACY
-- -------------------------
INTO product_offers VALUES (2001, 201, 4, 58.00, 'https://seif-online.com/en/panadol-extra-optizorb-24-tab-617533', 'Cairo')
INTO product_offers VALUES (2002, 201, 5, 54.00, 'https://chefaa.com/eg-ar/nowProduct/panadol-extra-tab', 'Cairo')
INTO product_offers VALUES (2003, 201, 6, 56.00, 'https://www.carrefouregypt.com/mafegy/en/c/NFEGY7030000', 'Cairo')

INTO product_offers VALUES (2004, 202, 4, 170.00, 'https://seif-online.com/en/strepsils-1-box-offer-170l-e-box-honey-lemon', 'Cairo')
INTO product_offers VALUES (2005, 202, 5, 95.00, 'https://chefaa.com/eg-ar/nowProduct/strepsils-honey-and-lemon', 'Cairo')
INTO product_offers VALUES (2006, 202, 6, 187.00, 'https://www.carrefouregypt.com/mafegy/en/cough-cold/strepsils-honey-lemon-24p/p/390272', 'Cairo')

INTO product_offers VALUES (2007, 203, 4, 68.00, 'https://seif-online.com/en/voltaren-1-50-gm-emulgel', 'Cairo')
INTO product_offers VALUES (2008, 203, 5, 68.00, 'https://chefaa.com/eg-ar/nowProduct/voltaren-emulgel-for-muscle-back-pain-relief-1-50gm-iuj4', 'Cairo')
INTO product_offers VALUES (2009, 203, 6, 155.00, 'https://www.carrefouregypt.com/mafegy/en/c/NFEGY7030000', 'Cairo')

INTO product_offers VALUES (2010, 204, 4, 780.00, 'https://seif-online.com/ar/centrum-silver-adults-50-100-tab', 'Cairo')
INTO product_offers VALUES (2011, 204, 5, 870.00, 'https://chefaa.com/eg-ar/nowProduct/centrum-silver-100tab-lpsl', 'Cairo')
INTO product_offers VALUES (2012, 204, 6, 960.00, 'https://www.carrefouregypt.com/mafegy/en/c/NFEGY7030000', 'Cairo')

INTO product_offers VALUES (2013, 205, 4, 170.00, 'https://seif-online.com/en/sinomarin-cold-flu-nasal-spray-30-ml', 'Cairo')
INTO product_offers VALUES (2014, 205, 5, 280.00, 'https://chefaa.com/eg-ar/blog/%D8%AF%D9%88%D8%A7%D8%A1-%D9%84%D9%84%D8%A8%D8%B1%D8%AF-%D8%B3%D8%B1%D9%8A%D8%B9-%D8%A7%D9%84%D9%85%D9%81%D8%B9%D9%88%D9%84-%D9%84%D9%84%D9%83%D8%A8%D8%A7%D8%B1/', 'Cairo')
INTO product_offers VALUES (2015, 205, 6, 265.00, 'https://www.carrefouregypt.com/mafegy/en/c/NFEGY7030000', 'Cairo')

-- -------------------------
-- PERSONAL CARE
-- -------------------------
INTO product_offers VALUES (3001, 301, 2, 89.00, 'https://www.carrefouregypt.com/mafegy/en/woman-deodorant-roll-on/nivea-roll-on-b-w-invisible-w-50m/p/356563', 'Cairo')
INTO product_offers VALUES (3002, 301, 3, 91.75, 'https://spinneys-egypt.com/en/nivea-black-and-white-invisible-silky-smooth-roll-on-deodoarnt-for-women-50-ml', 'Cairo')
INTO product_offers VALUES (3003, 301, 4, 95.00, 'https://seif-online.com/', 'Cairo')

INTO product_offers VALUES (3004, 302, 2, 42.99, 'https://www.carrefouregypt.com/mafegy/en/regular-toothpaste/signal-tooth-paste-calcium120m/p/372007', 'Cairo')
INTO product_offers VALUES (3005, 302, 3, 52.50, 'https://spinneys-egypt.com/en/316642', 'Cairo')
INTO product_offers VALUES (3006, 302, 4, 46.99, 'https://seif-online.com/', 'Cairo')

INTO product_offers VALUES (3007, 303, 2, 249.00, 'https://www.carrefouregypt.com/mafegy/en/face-cleansing-scrub-toners/garnier-skin-act-micellar-wat-400m/p/463708', 'Cairo')
INTO product_offers VALUES (3008, 303, 3, 234.95, 'https://spinneys-egypt.com/en/beauty-personal-care/face-body-skincare', 'Cairo')
INTO product_offers VALUES (3009, 303, 5, 312.00, 'https://chefaa.com/', 'Cairo')

INTO product_offers VALUES (3010, 304, 2, 180.75, 'https://www.carrefouregypt.com/mafegy/en/face-cleansing-scrub-toners/johnson-s-fresh-cleanser200m20-/p/536573', 'Cairo')
INTO product_offers VALUES (3011, 304, 3, 147.95, 'https://spinneys-egypt.com/en/beauty-personal-care/face-body-skincare', 'Cairo')
INTO product_offers VALUES (3012, 304, 5, 175.00, 'https://chefaa.com/', 'Cairo')

INTO product_offers VALUES (3013, 305, 2, 219.00, 'https://www.carrefouregypt.com/mafegy/en/body-lotion/vaseline-essential-healing-400m/p/487122', 'Cairo')
INTO product_offers VALUES (3014, 305, 3, 234.95, 'https://spinneys-egypt.com/en/378221', 'Cairo')
INTO product_offers VALUES (3015, 305, 5, 225.00, 'https://chefaa.com/', 'Cairo')

-- -------------------------
-- ELECTRONICS
-- -------------------------
INTO product_offers VALUES (4001, 401, 7, 7099.00, 'https://btech.com/en/p/samsung-galaxy-a15-128gb-6gb-4g-lte-dual-sim-black-local', 'Cairo')
INTO product_offers VALUES (4002, 401, 8, 7099.00, 'https://www.rayashop.com/en/samsung-galaxy-a15-dual-sim-128-gb-6-gb-ram-4g-lte-black-16', 'Cairo')
INTO product_offers VALUES (4003, 401, 9, 7499.00, 'https://www.jumia.com.eg/slp/samsung-galaxy-a15-128gb-total-wireless-phone', 'Cairo')

INTO product_offers VALUES (4004, 402, 7, 23900.00, 'https://btech.com/en/p/lenovo-ideapad-slim-3-15iru8-laptop-intel-i3-1315u-256gb-ssd-8gb-ram-15-6-dos-grey', 'Cairo')
INTO product_offers VALUES (4005, 402, 8, 16999.00, 'https://www.rayashop.com/ar/lenovo-ideapad-slim-3-15iru8-laptop-intel-core-i3-1315u-processor-15-6-inch-fhd-display-256-gb-ssd-8-gb-ram-lpddr5-intel-uhd-graphics-dos-arctic-grey-82x700dmed', 'Cairo')
INTO product_offers VALUES (4006, 402, 9, 37999.00, 'https://www.jumia.com.eg/lenovo-laptop-ip-slim-15iru8-ci3-1315u-8gb-256gb-ssd-intel-uhd-15.6-fhd-250nits-grey-82x700hrax-134041948.html', 'Cairo')

INTO product_offers VALUES (4007, 403, 7, 1999.00, 'https://btech.com/en/p/96492871-8538-46da-8e08-ffa2c13cacec?offering_id=e35c9e1a-3969-4c40-b540-da40047147f4', 'Cairo')
INTO product_offers VALUES (4008, 403, 8, 1149.00, 'https://www.rayashop.com/en/tp-link-tabo-c200-home-pan-tilt-security-camera-1080-pixels-wi-fi-white', 'Cairo')
INTO product_offers VALUES (4009, 403, 9, 1199.00, 'https://www.jumia.com.eg/tp-link-tapo-c200-pantilt-home-security-wi-fi-camera-133681840.html', 'Cairo')

INTO product_offers VALUES (4010, 404, 7, 649.00, 'https://btech.com/en/p/xiaomi-redmi-buds-6-play-earbuds-ai-noise-reduction-black', 'Cairo')
INTO product_offers VALUES (4011, 404, 8, 599.00, 'https://www.rayashop.com/en/xiaomi-redmi-buds-6-play-in-ear-earbuds-up-to-36-hours-white-bhr8773gl-6941812791271-bhr8773gl-white-tbarak', 'Cairo')
INTO product_offers VALUES (4012, 404, 9, 830.00, 'https://www.jumia.com.eg/redmi-mi-redmi.-buds-6-play-black-128810887.html', 'Cairo')

INTO product_offers VALUES (4013, 405, 7, 7999.00, 'https://btech.com/en/p/apple-airpods-white-mv7n2zm-a', 'Cairo')
INTO product_offers VALUES (4014, 405, 8, 8049.00, 'https://www.rayashop.com/en/apple-2nd-generation-wireless-airpods-white-mv7n2zaa-18373', 'Cairo')
INTO product_offers VALUES (4015, 405, 9, 8199.00, 'https://www.jumia.com.eg/mlp-airpods-2nd-generation/', 'Cairo')
SELECT 1 FROM dual;

COMMIT;