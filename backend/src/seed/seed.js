// backend/src/seed/seed.js
import dotenv from 'dotenv';
dotenv.config();
import { query, getPool } from '../db.js';
import faker from 'faker';

const SEED_COUNT = parseInt(process.env.SEED_COUNT || '800', 10);

const CATEGORIES = ['Electronics','Apparel','Books','Home & Kitchen','Toys','Sports','Garden','Automotive','Beauty','Grocery','Computers','Mobile'];
const baseBrands = ["HP", "Nike", "Samsung", "Sony"];
const BRANDS = Array.from({ length: 50 }, (_, i) => baseBrands[i % baseBrands.length]);
const COLORS = ['Red','Blue','Green','Black','White','Grey','Yellow','Pink','Silver','Gold'];

function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

async function seed() {
    try {
        const pool = getPool();
        const batchSize = 20;
        for (let i = 0; i < SEED_COUNT; i++) {
            const name = faker.commerce.productName() + ' ' + faker.commerce.productAdjective();
            const description = faker.lorem.sentences(2);
            const price = (Math.random() * 100000).toFixed(2);
            const image_url = `https://picsum.photos/seed/${faker.datatype.uuid()}/400/300`;
            const brand = randChoice(BRANDS);

            const catCount = 1 + Math.floor(Math.random() * 3);
            const cats = [];
            while (cats.length < catCount) {
                const c = randChoice(CATEGORIES);
                if (!cats.includes(c)) cats.push(c);
            }

            const attrs = {};
            attrs.color = randChoice(COLORS);
            if (cats.includes('Electronics') || cats.includes('Computers') || cats.includes('Mobile')) {
                attrs.memory_gb = randChoice([4, 8, 16, 32, 64, 128]);
                attrs.storage_gb = randChoice([64, 128, 256, 512, 1024]);
            }
            if (cats.includes('Apparel')) {
                attrs.size = randChoice(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
                attrs.material = randChoice(['Cotton', 'Polyester', 'Wool', 'Leather']);
            }

            const sql = `INSERT INTO products (name, description, price, image_url, brand, categories, attrs) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const params = [name, description, price, image_url, brand, JSON.stringify(cats), JSON.stringify(attrs)];

            await query(sql, params);
            if (i % 100 === 0) console.log(`Inserted ${i} / ${SEED_COUNT}`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('Seed error', err);
        process.exit(1);
    }
}

seed();
