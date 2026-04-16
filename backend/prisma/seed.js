const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@barakabox.ma' },
    update: {},
    create: {
      email: 'admin@barakabox.ma',
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'BarakaBox',
      role: 'ADMIN',
    },
  });

  const merchantHash = await bcrypt.hash('Merchant@1234', 12);
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@barakabox.ma' },
    update: {},
    create: {
      email: 'merchant@barakabox.ma',
      passwordHash: merchantHash,
      firstName: 'Hassan',
      lastName: 'Alami',
      role: 'MERCHANT',
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      businessName: 'Boulangerie Al Baraka',
      description: 'Boulangerie artisanale au cœur de Casablanca',
      category: 'Boulangerie',
      address: '45 Rue Mohamed V',
      city: 'Casablanca',
      latitude: 33.5731,
      longitude: -7.5898,
      phone: '+212600000001',
      status: 'ACTIVE',
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pickupStart = new Date(tomorrow);
  pickupStart.setHours(18, 0, 0, 0);
  const pickupEnd = new Date(tomorrow);
  pickupEnd.setHours(20, 0, 0, 0);

  await prisma.offer.upsert({
    where: { id: 'seed-offer-1' },
    update: {},
    create: {
      id: 'seed-offer-1',
      merchantId: merchant.id,
      title: 'Baraka Box Boulangerie',
      description: '3-5 produits surprise: pain, viennoiseries, pâtisseries invendus du jour',
      originalPrice: 80,
      currentPrice: 30,
      minPrice: 20,
      totalQuantity: 10,
      remainingQuantity: 8,
      pickupStart,
      pickupEnd,
      tags: ['pain', 'viennoiserie', 'surprise'],
    },
  });

  await prisma.appConfig.upsert({
    where: { key: 'commission_rate' },
    update: {},
    create: { key: 'commission_rate', value: '0.15' },
  });

  await prisma.appConfig.upsert({
    where: { key: 'max_radius_km' },
    update: {},
    create: { key: 'max_radius_km', value: '20' },
  });

  console.log('Seed complete!');
  console.log('Admin: admin@barakabox.ma / Admin@1234');
  console.log('Merchant: merchant@barakabox.ma / Merchant@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
