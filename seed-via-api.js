// Seed script that uses API instead of direct DB connection
const products = [
  { name: 'W16 Racing Jacket', nameRu: 'Гоночная куртка W16', price: 189, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiAd0JdGLyMOS2p-w66irEbEaR3GvkYdVafqyrD-yPkEedAMOJrAzE0DsO&s=10', category: 'clothing', descriptionRu: 'Официальная командная гоночная куртка 2025 года. Лёгкая, ветрозащитная.', badge: 'W16', sizes: ['S','M','L','XL','XXL'] },
  { name: '2025 Season Cap', nameRu: 'Бейсболка 2025', price: 49, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8TwuLIgap2dVo1KLX1FuUYavNKnOeUUEo5sRDZqWtNA&s=10', category: 'accessories', descriptionRu: 'Официальная командная бейсболка. Универсальный размер.', badge: 'NEW' },
  { name: 'AMG Team Polo', nameRu: 'Поло AMG Team', price: 79, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw23RHeHybT6L_zB2EwRplwka5gxgKyj15gDOwpmSnlWUH4jfKTUycrKs&s=10', category: 'clothing', descriptionRu: 'Классическое командное поло.', sizes: ['S','M','L','XL'] },
  { name: 'Scale Model W16 1:18', nameRu: 'Масштабная модель W16 — 1:18', price: 249, image: 'https://www.toycollectorsindia.com/cdn/shop/files/rn-image_picker_lib_temp_86e3a9e8-dc0b-43ba-9e68-02aa04279f4d.png?v=1775808993', category: 'collectibles', descriptionRu: 'Масштабная модель болида W16 в масштабе 1:18. Литой металл.', badge: 'NEW' },
  { name: 'Silver Arrow Hoodie', nameRu: 'Худи Silver Arrow', price: 119, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqhFs2ZfGCsIH1iXZpETgV0olDLcowjqROtZnbrhS_aRExeW_14qio_mA&s=10', category: 'clothing', descriptionRu: 'Премиальное худи с принтом Silver Arrow.', sizes: ['S','M','L','XL','XXL'] },
  { name: 'Team Backpack 2025', nameRu: 'Рюкзак команды 2025', price: 139, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0O06eW6ETl5b-f8sFtMZ9DPNALFH0qW9p9aYac_MuvQ&s=10', category: 'accessories', descriptionRu: 'Официальный командный рюкзак с отделением для ноутбука.', badge: 'W16' },
  { name: 'Russell #63 T-Shirt', nameRu: 'Футболка Расселл #63', price: 59, image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTeqWk6dmVBM1TPmPRQkJT5yz9HntE4RxTCdkIdw267ahC0GuANCGm-1LrXHcFxs05wD1EQ7U4bivW1iMth470UDoMRv1wmO0foLg0P2Gatg1_pyezGjTVkRdQNSVEozuN_WRBmwrdSvGg&usqp=CAc', category: 'clothing', descriptionRu: 'Футболка с номером и именем Джорджа Расселла.', sizes: ['S','M','L','XL'] },
  { name: 'Antonelli #12 T-Shirt', nameRu: 'Футболка Антонелли #12', price: 59, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXVU8dI_ePtn7GgeHsv6hsQcwEY1-5ZzgWGBu_GGSy8g&s=10', category: 'clothing', descriptionRu: 'Футболка с номером и именем Андреа Ким Антонелли.', badge: 'NEW', sizes: ['S','M','L','XL'] },
];

async function seed() {
  try {
    console.log('🔑 Admin login...');
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@merc-store.com', password: 'admin123' })
    });

    let token = null;
    let adminId = null;
    
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
      adminId = data.user._id;
      console.log('✅ Admin login successful');
    } else {
      console.log('⚠️  Admin login failed, trying to set role via update...');
      // Attempt to get first user and set as admin - this won't work without a token
      // For now, just proceed with creating products (will fail if not admin)
    }

    if (!token) {
      console.log('❌ No token available. Please ensure admin user exists with correct credentials.');
      process.exit(1);
    }

    console.log('📦 Creating products...');
    for (let i = 0; i < products.length; i++) {
      const res = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(products[i])
      });

      if (res.ok) {
        console.log(`  ✅ ${i + 1}. ${products[i].name}`);
      } else {
        const err = await res.json();
        console.log(`  ❌ ${i + 1}. ${products[i].name}: ${err.error}`);
      }
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

seed();
