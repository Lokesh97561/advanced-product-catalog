import { query } from '../db.js';

/**
 * GET /api/products/:id
 */
export const getProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const rows = await query(
            'SELECT id, name, description, price, image_url, brand, categories, attrs, created_at FROM products WHERE id = ?',
            [productId]
        );
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // parse JSON fields if necessary (optional, depending on how you want to return)
        // e.g. rows[0].attrs = JSON.parse(rows[0].attrs) if stored as string

        res.json(rows[0]);
    } catch (err) {
        console.error('getProduct error', err);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/products
 * Query params:
 *  - search (string)
 *  - categories (comma separated)
 *  - brands (comma separated)
 *  - price_min, price_max
 *  - attrs (JSON string)
 *  - page, pageSize
 *  - sort_by (price|name|date|relevance)
 *  - sort_order (asc|desc)
 */
export const getProducts = async (req, res) => {
    try {
        const {
            search,
            categories,
            brands,
            price_min,
            price_max,
            attrs,
            page = 1,
            pageSize = 24,
            sort_by = 'relevance',
            sort_order = 'desc',
        } = req.query;

        const categoriesArr = categories ? categories.split(',').map(s => s.trim()).filter(Boolean) : null;
        const brandsArr = brands ? brands.split(',').map(s => s.trim()).filter(Boolean) : null;

        let attrsObj = null;
        if (attrs) {
            try {
                attrsObj = JSON.parse(attrs);
            } catch {
                attrsObj = null;
            }
        }

        const limit = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 24));
        const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * limit;

        // Build WHERE clauses & params
        const where = [];
        const params = [];

        // FULLTEXT search condition (keeps original behavior)
        if (search && search.trim().length) {
            where.push(`(MATCH(name, description) AGAINST(? IN BOOLEAN MODE))`);
            const terms = search.trim().split(/\s+/).map(t => `${t}*`).join(' ');
            params.push(terms);
        }

        // categories (JSON array stored as JSON string or json column)
        if (categoriesArr && categoriesArr.length) {
            const catConds = categoriesArr.map(() => `JSON_CONTAINS(categories, JSON_QUOTE(?))`).join(' OR ');
            where.push(`(${catConds})`);
            categoriesArr.forEach(c => params.push(c));
        }

        // brands
        if (brandsArr && brandsArr.length) {
            const placeholders = brandsArr.map(() => '?').join(',');
            where.push(`brand IN (${placeholders})`);
            brandsArr.forEach(b => params.push(b));
        }

        // price range
        if (price_min) {
            where.push(`price >= ?`);
            params.push(price_min);
        }
        if (price_max) {
            where.push(`price <= ?`);
            params.push(price_max);
        }

        // attrs (JSON attributes)
        if (attrsObj && typeof attrsObj === 'object') {
            Object.entries(attrsObj).forEach(([k, vArr]) => {
                if (!Array.isArray(vArr) || vArr.length === 0) return;
                const placeholders = vArr.map(() => '?').join(',');
                where.push(`JSON_UNQUOTE(JSON_EXTRACT(attrs, ?)) IN (${placeholders})`);
                params.push(`$.${k}`, ...vArr.map(String));
            });
        }

        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        // Determine ORDER BY clause
        const sortOrder = (sort_order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        let orderSQL = 'ORDER BY created_at DESC'; // default

        // If a search is present and sort_by is relevance, use MATCH for ordering
        if (search && sort_by === 'relevance') {
            orderSQL = `ORDER BY MATCH(name, description) AGAINST(? IN BOOLEAN MODE) ${sortOrder}`;
        } else {
            // map sort_by options to actual columns
            if (sort_by === 'price') {
                orderSQL = `ORDER BY price ${sortOrder}`;
            } else if (sort_by === 'name') {
                // use case-insensitive ordering for name
                orderSQL = `ORDER BY name COLLATE utf8mb4_general_ci ${sortOrder}`;
            } else if (sort_by === 'date' || sort_by === 'created_at') {
                orderSQL = `ORDER BY created_at ${sortOrder}`;
            } else {
                // fallback default
                orderSQL = `ORDER BY created_at ${sortOrder}`;
            }
        }

        // Get total count (uses same params that built WHERE)
        const countSQL = `SELECT COUNT(*) AS total FROM products ${whereSQL};`;
        const totalRes = await query(countSQL, params);
        const total = totalRes && totalRes[0] ? parseInt(totalRes[0].total, 10) : 0;

        // Prepare params for products query (copy base params)
        const productsParams = [...params];
        // If ordering by relevance (MATCH in ORDER BY) we need to push the search terms AGAIN
        if (search && sort_by === 'relevance') {
            const terms = search.trim().split(/\s+/).map(t => `${t}*`).join(' ');
            productsParams.push(terms); // for ORDER BY MATCH(...)
        }

        // Fetch products with pagination
        const productsSQL = `
      SELECT id, name, description, price, image_url, brand, categories, attrs, created_at
      FROM products
      ${whereSQL}
      ${orderSQL}
      LIMIT ${limit} OFFSET ${offset};
    `;
        const products = await query(productsSQL, productsParams);

        // Facets ----------------------------------------------------------

        // categories facet
        const categoriesFacetParams = [...params];
        if (search && sort_by === 'relevance') {
            const terms = search.trim().split(/\s+/).map(t => `${t}*`).join(' ');
            categoriesFacetParams.push(terms);
        }
        const categoriesFacetSQL = `
      SELECT cat AS value, COUNT(*) AS count FROM (
        SELECT id, TRIM(jt.cat) AS cat
        FROM products
        JOIN JSON_TABLE(categories, '$[*]' COLUMNS (cat VARCHAR(255) PATH '$')) AS jt ON 1
        ${whereSQL.replace(/MATCH\(name, description\) AGAINST\(\? IN BOOLEAN MODE\)/g, search ? 'MATCH(name, description) AGAINST(? IN BOOLEAN MODE)' : '1=1')}
      ) t
      GROUP BY cat
      ORDER BY count DESC;
    `;
        const categoriesFacet = await query(categoriesFacetSQL, categoriesFacetParams);

        // brands facet
        const brandsFacet = await query(
            `SELECT brand AS value, COUNT(*) AS count FROM products ${whereSQL} GROUP BY brand ORDER BY count DESC;`,
            params
        );

        // price buckets facet
        const priceFacetSQL = `
      SELECT
        CASE
          WHEN price < 50 THEN '0-49'
          WHEN price >= 50 AND price < 100 THEN '50-99'
          WHEN price >= 100 AND price < 500 THEN '100-499'
          WHEN price >= 500 AND price < 1000 THEN '500-999'
          WHEN price >= 1000 AND price < 5000 THEN '1000-4999'
          ELSE '5000+'
        END AS range_label,
        COUNT(*) AS count
      FROM products
      ${whereSQL}
      GROUP BY range_label
      ORDER BY count DESC;
    `;
        const priceFacet = await query(priceFacetSQL, params);

        // attribute facets (e.g., color, size, memory_gb)
        const attrFacets = {};
        const attrKeysToCompute = attrsObj ? Object.keys(attrsObj) : ['color', 'size', 'memory_gb'];
        for (const key of attrKeysToCompute) {
            const attrSQL = `
        SELECT JSON_UNQUOTE(JSON_EXTRACT(CAST(attrs AS CHAR CHARACTER SET utf8mb4), ?)) AS value,
               COUNT(*) AS count
        FROM products
        ${whereSQL}
        GROUP BY value
        HAVING value IS NOT NULL
        ORDER BY count DESC;
      `;
            const attrParams = [`$.${key}`, ...params];
            const rows = await query(attrSQL, attrParams);
            attrFacets[key] = rows;
        }

        // Response
        res.json({
            products,
            total,
            page: parseInt(page, 10),
            pageSize: limit,
            facets: {
                categories: categoriesFacet,
                brands: brandsFacet,
                priceRanges: priceFacet,
                attrs: attrFacets,
            },
        });
    } catch (err) {
        console.error('getProducts error', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};
