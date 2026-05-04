// ============================================================
// server.js  —  Price-Pulse Backend (Node.js + Express + SQLite)
// ============================================================
// This server:
//   1. Connects to a local SQLite database (price_pulse.db)
//   2. Exposes REST endpoints for products (GET, POST, PUT, DELETE)
//   3. Exposes auth endpoints for user registration & login
//   4. Serves data as JSON for the frontend
// ============================================================

// ------ Import libraries ------
const express  = require('express');
const cors     = require('cors');
const initSqlJs = require('sql.js');
const fs       = require('fs');
const path     = require('path');

// ------ Create Express app ------
const app  = express();
const PORT = 3000;

// ------ Middleware ------
app.use(cors());
app.use(express.json());

// ------ Database path ------
const DB_PATH = path.join(__dirname, 'price_pulse.db');

let db; // Will hold the sql.js Database instance

// Helper: save the in-memory database to disk
function saveDatabase() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// ============================================================
// STARTUP — Load the database and start listening
// ============================================================
async function startServer() {
    const SQL = await initSqlJs();

    // Load existing database file, or error if it doesn't exist
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('🗄️  Loaded SQLite database from:', DB_PATH);
    } else {
        console.error('❌  Database file not found at:', DB_PATH);
        console.error('    Run  node init-db.js  first to create and seed the database.');
        process.exit(1);
    }

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // ============================================================
    // PRODUCTS ENDPOINTS
    // ============================================================

    // ------ GET /products ------
    // Returns all products with their offers, stores, and categories.
    // Each row = one offer (one product at one store).
    app.get('/products', (req, res) => {
        try {
            const stmt = db.prepare(`
                SELECT
                    p.product_id,
                    p.product_name,
                    p.brand,
                    p.unit_info,
                    p.image_url,
                    c.category_name,
                    s.store_id,
                    s.store_name,
                    po.offer_id,
                    po.price_egp,
                    po.product_url
                FROM products p
                JOIN categories c      ON p.category_id = c.category_id
                JOIN product_offers po ON p.product_id  = po.product_id
                JOIN stores s          ON po.store_id   = s.store_id
                ORDER BY p.product_id, po.price_egp
            `);

            const products = [];
            while (stmt.step()) {
                const row = stmt.getAsObject();
                products.push({
                    id:          row.offer_id,
                    productId:   row.product_id,
                    name:        row.product_name,
                    brand:       row.brand,
                    unit:        row.unit_info,
                    price:       row.price_egp,
                    image:       row.image_url || '',
                    link:        row.product_url,
                    category:    row.category_name ? row.category_name.toLowerCase() : '',
                    storeId:     row.store_id,
                    store:       row.store_name
                });
            }
            stmt.free();

            res.json(products);

        } catch (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Could not fetch products from the database.' });
        }
    });

    // ------ POST /products ------
    // Add a new product with one or more store offers.
    // Body: { name, category, description, image, stores: [{ name, price }] }
    app.post('/products', (req, res) => {
        try {
            const { name, category, description, image, stores } = req.body;

            if (!name || !category || !stores || stores.length === 0) {
                return res.status(400).json({ error: 'Missing required fields: name, category, stores[]' });
            }

            // Get or create category
            let catId;
            const catStmt = db.prepare(`SELECT category_id FROM categories WHERE category_name = ?`);
            catStmt.bind([category.toLowerCase()]);
            if (catStmt.step()) {
                catId = catStmt.getAsObject().category_id;
            }
            catStmt.free();

            if (!catId) {
                db.run(`INSERT INTO categories (category_name) VALUES (?)`, [category.toLowerCase()]);
                const idStmt = db.prepare(`SELECT last_insert_rowid() as id`);
                idStmt.step();
                catId = idStmt.getAsObject().id;
                idStmt.free();
            }

            // Insert product
            db.run(
                `INSERT INTO products (category_id, product_name, brand, unit_info, image_url) VALUES (?, ?, '', '', ?)`,
                [catId, name, image || '']
            );
            const pidStmt = db.prepare(`SELECT last_insert_rowid() as id`);
            pidStmt.step();
            const productId = pidStmt.getAsObject().id;
            pidStmt.free();

            // Insert offers for each store
            stores.forEach(s => {
                const storeId = getOrCreateStore(s.name);
                db.run(
                    `INSERT INTO product_offers (product_id, store_id, price_egp, product_url, region) VALUES (?, ?, ?, ?, 'Cairo')`,
                    [productId, storeId, s.price, s.link || '']
                );
            });

            saveDatabase();
            res.status(201).json({ message: 'Product created successfully.', productId });

        } catch (err) {
            console.error('Error creating product:', err.message);
            res.status(500).json({ error: 'Could not create product.' });
        }
    });

    // ------ PUT /products/:name ------
    // Update a product by name (replaces all offers).
    app.put('/products/:name', (req, res) => {
        try {
            const oldName = decodeURIComponent(req.params.name);
            const { name, category, description, image, stores } = req.body;

            // Find products with this name
            const findStmt = db.prepare(`SELECT product_id FROM products WHERE product_name = ?`);
            findStmt.bind([oldName]);
            const existingIds = [];
            while (findStmt.step()) {
                existingIds.push(findStmt.getAsObject().product_id);
            }
            findStmt.free();

            if (existingIds.length === 0) {
                return res.status(404).json({ error: 'Product not found.' });
            }

            // Get or create category
            let catId;
            const catStmt = db.prepare(`SELECT category_id FROM categories WHERE category_name = ?`);
            catStmt.bind([category.toLowerCase()]);
            if (catStmt.step()) {
                catId = catStmt.getAsObject().category_id;
            }
            catStmt.free();

            if (!catId) {
                db.run(`INSERT INTO categories (category_name) VALUES (?)`, [category.toLowerCase()]);
                const idStmt = db.prepare(`SELECT last_insert_rowid() as id`);
                idStmt.step();
                catId = idStmt.getAsObject().id;
                idStmt.free();
            }

            const productId = existingIds[0];

            // Update product
            db.run(
                `UPDATE products SET product_name = ?, category_id = ?, image_url = ? WHERE product_id = ?`,
                [name || oldName, catId, image || '', productId]
            );

            // Remove old offers and re-insert
            db.run(`DELETE FROM product_offers WHERE product_id = ?`, [productId]);

            if (stores && stores.length > 0) {
                stores.forEach(s => {
                    const storeId = getOrCreateStore(s.name);
                    db.run(
                        `INSERT INTO product_offers (product_id, store_id, price_egp, product_url, region) VALUES (?, ?, ?, ?, 'Cairo')`,
                        [productId, storeId, s.price, s.link || '']
                    );
                });
            }

            // Delete duplicate rows
            for (let i = 1; i < existingIds.length; i++) {
                db.run(`DELETE FROM product_offers WHERE product_id = ?`, [existingIds[i]]);
                db.run(`DELETE FROM products WHERE product_id = ?`, [existingIds[i]]);
            }

            saveDatabase();
            res.json({ message: 'Product updated successfully.' });

        } catch (err) {
            console.error('Error updating product:', err.message);
            res.status(500).json({ error: 'Could not update product.' });
        }
    });

    // ------ DELETE /products/:name ------
    app.delete('/products/:name', (req, res) => {
        try {
            const productName = decodeURIComponent(req.params.name);

            const findStmt = db.prepare(`SELECT product_id FROM products WHERE product_name = ?`);
            findStmt.bind([productName]);
            const ids = [];
            while (findStmt.step()) {
                ids.push(findStmt.getAsObject().product_id);
            }
            findStmt.free();

            if (ids.length === 0) {
                return res.status(404).json({ error: 'Product not found.' });
            }

            ids.forEach(id => {
                db.run(`DELETE FROM product_offers WHERE product_id = ?`, [id]);
                db.run(`DELETE FROM products WHERE product_id = ?`, [id]);
            });

            saveDatabase();
            res.json({ message: 'Product deleted successfully.' });

        } catch (err) {
            console.error('Error deleting product:', err.message);
            res.status(500).json({ error: 'Could not delete product.' });
        }
    });

    // ============================================================
    // AUTH ENDPOINTS
    // ============================================================

    // ------ POST /auth/register ------
    app.post('/auth/register', (req, res) => {
        try {
            const { name, email, password, city } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Name, email, and password are required.' });
            }

            if (email.toLowerCase() === 'adminpricepulse@gmail.com') {
                return res.status(403).json({ error: 'Cannot register with the admin email address.' });
            }

            const checkStmt = db.prepare(`SELECT user_id FROM users WHERE email = ?`);
            checkStmt.bind([email]);
            const exists = checkStmt.step();
            checkStmt.free();

            if (exists) {
                return res.status(409).json({ error: 'An account with that email already exists.' });
            }

            db.run(
                `INSERT INTO users (name, email, password, city) VALUES (?, ?, ?, ?)`,
                [name, email, password, city || '']
            );

            saveDatabase();
            res.status(201).json({ message: 'Registration successful.', user: { name, email } });

        } catch (err) {
            console.error('Registration error:', err.message);
            res.status(500).json({ error: 'Could not register user.' });
        }
    });

    // ------ POST /auth/login ------
    app.post('/auth/login', (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required.' });
            }

            const stmt = db.prepare(
                `SELECT user_id, name, email, city, dob, gender FROM users WHERE email = ? AND password = ?`
            );
            stmt.bind([email, password]);

            if (!stmt.step()) {
                stmt.free();
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            const user = stmt.getAsObject();
            stmt.free();

            res.json({ message: 'Login successful.', user });

        } catch (err) {
            console.error('Login error:', err.message);
            res.status(500).json({ error: 'Could not process login.' });
        }
    });

    // ------ PUT /auth/profile ------
    app.put('/auth/profile', (req, res) => {
        try {
            const { originalEmail, name, email, dob, gender } = req.body;

            if (!originalEmail) {
                return res.status(400).json({ error: 'Original email is required.' });
            }

            db.run(
                `UPDATE users SET name = ?, email = ?, dob = ?, gender = ? WHERE email = ?`,
                [name || '', email || originalEmail, dob || '', gender || '', originalEmail]
            );

            const stmt = db.prepare(
                `SELECT user_id, name, email, city, dob, gender FROM users WHERE email = ?`
            );
            stmt.bind([email || originalEmail]);
            stmt.step();
            const updatedUser = stmt.getAsObject();
            stmt.free();

            saveDatabase();
            res.json({ message: 'Profile updated.', user: updatedUser });

        } catch (err) {
            console.error('Profile update error:', err.message);
            res.status(500).json({ error: 'Could not update profile.' });
        }
    });

    // ============================================================
    // CATEGORIES & STORES ENDPOINTS
    // ============================================================

    app.get('/categories', (req, res) => {
        try {
            const stmt = db.prepare(`SELECT * FROM categories ORDER BY category_name`);
            const categories = [];
            while (stmt.step()) categories.push(stmt.getAsObject());
            stmt.free();
            res.json(categories);
        } catch (err) {
            res.status(500).json({ error: 'Could not fetch categories.' });
        }
    });

    app.get('/stores', (req, res) => {
        try {
            const stmt = db.prepare(`SELECT * FROM stores ORDER BY store_name`);
            const stores = [];
            while (stmt.step()) stores.push(stmt.getAsObject());
            stmt.free();
            res.json(stores);
        } catch (err) {
            res.status(500).json({ error: 'Could not fetch stores.' });
        }
    });

    // ============================================================
    // CLICK TRACKING & TRENDING
    // ============================================================

    // ------ POST /track-click ------
    // Records a click on a product (when user clicks a store link)
    app.post('/track-click', (req, res) => {
        try {
            const { productId, storeId } = req.body;
            if (!productId || !storeId) {
                return res.status(400).json({ error: 'productId and storeId are required.' });
            }
            db.run(`INSERT INTO click_tracking (product_id, store_id) VALUES (?, ?)`, [productId, storeId]);
            saveDatabase();
            res.json({ message: 'Click tracked.' });
        } catch (err) {
            console.error('Click tracking error:', err.message);
            res.status(500).json({ error: 'Could not track click.' });
        }
    });

    // ------ GET /admin/store-clicks ------
    // Returns total clicks for each store
    app.get('/admin/store-clicks', (req, res) => {
        try {
            const stmt = db.prepare(`
                SELECT s.store_name, COUNT(ct.click_id) as click_count
                FROM stores s
                LEFT JOIN click_tracking ct ON s.store_id = ct.store_id
                GROUP BY s.store_id
                ORDER BY click_count DESC
            `);
            const storeClicks = [];
            while (stmt.step()) storeClicks.push(stmt.getAsObject());
            stmt.free();
            res.json(storeClicks);
        } catch (err) {
            console.error('Store clicks error:', err.message);
            res.status(500).json({ error: 'Could not fetch store clicks.' });
        }
    });

    // ------ GET /trending ------
    // Returns top 5 most-clicked products
    app.get('/trending', (req, res) => {
        try {
            const stmt = db.prepare(`
                SELECT 
                    p.product_id,
                    p.product_name,
                    p.brand,
                    p.unit_info,
                    p.image_url,
                    c.category_name,
                    COUNT(DISTINCT ct.click_id) as click_count,
                    MIN(po.price_egp) as lowest_price
                FROM click_tracking ct
                JOIN products p       ON ct.product_id = p.product_id
                JOIN categories c     ON p.category_id = c.category_id
                JOIN product_offers po ON p.product_id = po.product_id
                GROUP BY p.product_id
                HAVING COUNT(DISTINCT ct.click_id) > 5
                ORDER BY click_count DESC
                LIMIT 5
            `);

            const trending = [];
            while (stmt.step()) {
                const row = stmt.getAsObject();
                trending.push({
                    productId:  row.product_id,
                    name:       row.product_name,
                    brand:      row.brand,
                    unit:       row.unit_info,
                    image:      row.image_url || '',
                    category:   row.category_name,
                    clicks:     row.click_count,
                    price:      row.lowest_price
                });
            }
            stmt.free();
            res.json(trending);
        } catch (err) {
            console.error('Trending error:', err.message);
            res.status(500).json({ error: 'Could not fetch trending products.' });
        }
    });

    // ------ GET /auth/user-count ------
    // Returns the number of registered users (for admin dashboard)
    app.get('/auth/user-count', (req, res) => {
        try {
            const stmt = db.prepare(`SELECT COUNT(*) as count FROM users`);
            stmt.step();
            const count = stmt.getAsObject().count;
            stmt.free();
            res.json({ count });
        } catch (err) {
            res.status(500).json({ error: 'Could not count users.' });
        }
    });

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================

    function getOrCreateStore(storeName) {
        const stmt = db.prepare(`SELECT store_id FROM stores WHERE store_name = ?`);
        stmt.bind([storeName]);
        if (stmt.step()) {
            const id = stmt.getAsObject().store_id;
            stmt.free();
            return id;
        }
        stmt.free();

        db.run(`INSERT INTO stores (store_name, city, is_local, website) VALUES (?, 'Cairo', 1, '')`, [storeName]);
        const idStmt = db.prepare(`SELECT last_insert_rowid() as id`);
        idStmt.step();
        const id = idStmt.getAsObject().id;
        idStmt.free();
        return id;
    }

    // ============================================================
    // START LISTENING
    // ============================================================
    app.listen(PORT, "0.0.0.0", () => {
        console.log('');
        console.log(`✅  Price-Pulse backend is running at http://localhost:${PORT}`);
        console.log(`📦  Products endpoint:  http://localhost:${PORT}/products`);
        console.log(`🔐  Auth endpoints:     http://localhost:${PORT}/auth/login`);
        console.log(`                        http://localhost:${PORT}/auth/register`);
        console.log('');
    });
}

// ============================================================
// Graceful shutdown
// ============================================================
process.on('SIGINT', () => {
    if (db) {
        saveDatabase();
        db.close();
    }
    console.log('\n🗄️  Database saved and closed. Goodbye!');
    process.exit(0);
});

// Kick everything off
startServer().catch(err => {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
});
