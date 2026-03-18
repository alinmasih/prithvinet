const db = require('./src/config/localDb');
const { v4: uuidv4 } = require('uuid');

const industries = [
  { name: 'Maa Mahamaya Sahakari Karkhana Mydt', owner: 'Manoj Kumar Padhi', mobile: '8718996259', district: 'AMBIKAPUR' },
  { name: 'ACC LTD, JAMUL CEMENT WORKS', owner: 'MR. VINAY KAPUR', mobile: '9752599818', district: 'BHILAI' },
  { name: 'BHILAI STEEL PLANT', owner: 'Mr. R G Gupta', mobile: '9407981464', district: 'BHILAI' },
  { name: 'AIRAN STEEL & POWER PVT LTD', owner: 'ALOK AGRWAL', mobile: '9753019594', district: 'BILASPUR' },
  { name: 'BEC FERTILIZERS', owner: 'S.SATHEEESAN', mobile: '9826110353', district: 'BILASPUR' },
  { name: 'BHATIA WINES MERCHANTS', owner: 'B B SINGH', mobile: '9229228461', district: 'BILASPUR' },
  { name: 'CHHATTISGARH STATE POWER GENERATION COMPANY LIMITED', owner: 'RAJDEEP VERMA', mobile: '8319970527', district: 'BILASPUR' },
  { name: 'DB POWER LIMITED', owner: 'MR. VIJAI PAL SINGH', mobile: '9109951037', district: 'BILASPUR' },
  { name: 'GEETANJALI ISPAT & POWERS PVT LTD', owner: 'Jayant Agrawal', mobile: '9575042807', district: 'BILASPUR' },
  { name: 'MADHYABHARAT PAPER LIMITED', owner: 'Unknown', mobile: 'Unknown', district: 'BILASPUR' }
];

async function seed() {
  console.log('--- Seeding Industries ---');
  const insert = db.prepare(`
    INSERT INTO industries (
      id, industry_name, district, owner_name, contact_mobile,
      address, product_name, product_activity, industry_type, approval_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  industries.forEach(ind => {
    try {
      insert.run(
        uuidv4(),
        ind.name,
        ind.district,
        ind.owner,
        ind.mobile,
        `${ind.district} Industrial Area`,
        'General Manufacturing',
        'Production',
        'Industrial',
        'Approved'
      );
      console.log(`✅ Seeded: ${ind.name}`);
    } catch (err) {
      console.error(`❌ Failed to seed ${ind.name}:`, err.message);
    }
  });
  console.log('--- Seeding Complete ---');
}

seed();
