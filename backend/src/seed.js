require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

dns.setServers(['8.8.8.8', '1.1.1.1']);
const products = [
  { name: 'W16 Racing Jacket', nameRu: 'Гоночная куртка W16', price: 189, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiAd0JdGLyMOS2p-w66irEbEaR3GvkYdVafqyrD-yPkEedAMOJrAzE0DsO&s=10', category: 'clothing', descriptionRu: 'Официальная командная гоночная куртка 2025 года. Лёгкая, ветрозащитная.', badge: 'W16', sizes: ['S','M','L','XL','XXL'] },
  { name: '2025 Season Cap', nameRu: 'Бейсболка 2025', price: 49, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8TwuLIgap2dVo1KLX1FuUYavNKnOeUUEo5sRDZqWtNA&s=10', category: 'accessories', descriptionRu: 'Официальная командная бейсболка. Универсальный размер.', badge: 'NEW' },
  { name: 'AMG Team Polo', nameRu: 'Поло AMG Team', price: 79, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw23RHeHybT6L_zB2EwRplwka5gxgKyj15gDOwpmSnlWUH4jfKTUycrKs&s=10', category: 'clothing', descriptionRu: 'Классическое командное поло.', sizes: ['S','M','L','XL'] },
  { name: 'Scale Model W16 1:18', nameRu: 'Масштабная модель W16 — 1:18', price: 249, image: 'https://www.toycollectorsindia.com/cdn/shop/files/rn-image_picker_lib_temp_86e3a9e8-dc0b-43ba-9e68-02aa04279f4d.png?v=1775808993', category: 'collectibles', descriptionRu: 'Масштабная модель болида W16 в масштабе 1:18. Литой металл.', badge: 'NEW' },
  { name: 'Silver Arrow Hoodie', nameRu: 'Худи Silver Arrow', price: 119, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqhFs2ZfGCsIH1iXZpETgV0olDLcowjqROtZnbrhS_aRExeW_14qio_mA&s=10', category: 'clothing', descriptionRu: 'Премиальное худи с принтом Silver Arrow.', sizes: ['S','M','L','XL','XXL'] },
  { name: 'Team Backpack 2025', nameRu: 'Рюкзак команды 2025', price: 139, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0O06eW6ETl5b-f8sFtMZ9DPNALFH0qW9p9aYac_MuvQ&s=10', category: 'accessories', descriptionRu: 'Официальный командный рюкзак с отделением для ноутбука.', badge: 'W16' },
  { name: 'Russell #63 T-Shirt', nameRu: 'Футболка Расселл #63', price: 59, image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTeqWk6dmVBM1TPmPRQkJT5yz9HntE4RxTCdkIdw267ahC0GuANCGm-1LrXHcFxs05wD1EQ7U4bivW1iMth470UDoMRv1wmO0foLg0P2Gatg1_pyezGjTVkRdQNSVEozuN_WRBmwrdSvGg&usqp=CAc', category: 'clothing', descriptionRu: 'Футболка с номером и именем Джорджа Расселла.', sizes: ['S','M','L','XL'] },
  { name: 'Antonelli #12 T-Shirt', nameRu: 'Футболка Антонелли #12', price: 59, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXVU8dI_ePtn7GgeHsv6hsQcwEY1-5ZzgWGBu_GGSy8g&s=10', category: 'clothing', descriptionRu: 'Футболка с номером и именем Андреа Ким Антонелли.', badge: 'NEW', sizes: ['S','M','L','XL'] },
  { name: 'Pit Wall Hoodie', nameRu: 'Худи Pit Wall', price: 129, image: 'https://shop.mercedesamgf1.com/cdn/shop/files/KF0166_1_APPAREL_Photography_Front_Center_View_grey.jpg?v=1766403726&width=3200', category: 'clothing', descriptionRu: 'Теплое худи для болельщиков и фанатов команды.', badge: 'NEW', sizes: ['S','M','L','XL','XXL'] },
  { name: 'Race Day Jacket', nameRu: 'Куртка Race Day', price: 169, image: 'https://www.cmcmotorsports.com/cdn/shop/files/KE8167_b2b012_plp_480x.webp?v=1769188985', category: 'clothing', descriptionRu: 'Стильная куртка для матчей и поездок на трассу.', badge: 'HOT', sizes: ['S','M','L','XL'] },
  { name: 'Team Track Tee', nameRu: 'Футболка Team Track', price: 69, image: 'https://admin.di-sport.uz/storage/galleries/18909/k1MKZmZBJ1ppFPrXxTNbb5U5cgf3K20AO2Ditc9X.webp', category: 'clothing', descriptionRu: 'Лёгкая футболка с современным принтом.', sizes: ['S','M','L','XL'] },
  { name: 'Storm Jacket', nameRu: 'Куртка Storm', price: 149, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi41JYUDw9HC9hdbnUj0Bj4-oLkbpt7pnRE5KkYLL8iSBRf5aqANx4q-0&s=10', category: 'clothing', descriptionRu: 'Ветровка для прохладной погоды и поездок по городу.', sizes: ['S','M','L','XL','XXL'] },
];

(async () => {
  await mongoose.connect(process.env.DB_URI);
  await Product.deleteMany({});
  const r = await Product.insertMany(products);
  console.log(`✅ Seeded ${r.length} products`);

  // Create admin user if not exists
  const adminEmail = 'admin@merc-store.com';
  const exists = await User.findOne({ email: adminEmail });
  if (!exists) {
    await User.create({ name: 'Admin', email: adminEmail, password: 'admin123', role: 'admin' });
    console.log(`✅ Admin user created: ${adminEmail} / admin123`);
  }

  process.exit(0);
})();
