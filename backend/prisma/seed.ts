
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding restaurants...');

  // 1. Italian: Pasta Palace
  await prisma.restaurant.upsert({
    where: { id: 'pasta-palace-id' },
    update: {},
    create: {
      id: 'pasta-palace-id',
      name: 'Pasta Palace',
      cuisine: 'Italian',
      description: 'Authentic handmade pasta and wood-fired pizzas in a cozy atmosphere.',
      address: '123 Little Italy Way, New York, NY',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=2064&auto=format&fit=crop',
      menuItems: {
        create: [
          { name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with seasonal truffles.', priceCents: 2400 },
          { name: 'Margherita Pizza', description: 'Fresh basil, mozzarella, and San Marzano tomatoes.', priceCents: 1800 },
          { name: 'Classic Lasagna', description: 'Layered pasta with rich bolognese and béchamel.', priceCents: 2100 },
        ],
      },
    },
  });

  // 2. Japanese: Sakura Sushi
  await prisma.restaurant.upsert({
    where: { id: 'sakura-sushi-id' },
    update: {},
    create: {
      id: 'sakura-sushi-id',
      name: 'Sakura Sushi',
      cuisine: 'Japanese',
      description: 'Premium sushi and sashimi prepared with the freshest catch of the day.',
      address: '456 Tokyo Drift St, Los Angeles, CA',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop',
      menuItems: {
        create: [
          { name: 'Dragon Roll', description: 'Eel and cucumber topped with avocado.', priceCents: 1600 },
          { name: 'Premium Sashimi Platter', description: '12 pieces of chef-selected fresh fish.', priceCents: 3200 },
          { name: 'Miso Ramen', description: 'Rich pork broth with bamboo shoots and soft egg.', priceCents: 1500 },
        ],
      },
    },
  });

  // 3. Burger: The Burger Joint
  await prisma.restaurant.upsert({
    where: { id: 'burger-joint-id' },
    update: {},
    create: {
      id: 'burger-joint-id',
      name: 'The Burger Joint',
      cuisine: 'American',
      description: 'Juicy grass-fed beef burgers with gourmet toppings and hand-cut fries.',
      address: '789 Broadway Ave, Austin, TX',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop',
      menuItems: {
        create: [
          { name: 'The BBQ Beast', description: 'Double patty with onion rings and smokey BBQ sauce.', priceCents: 1400 },
          { name: 'Truffle Parmesan Fries', description: 'Crispy fries tossed in truffle oil and cheese.', priceCents: 800 },
          { name: 'Beyond Burger (V)', description: 'Plant-based patty with all the fixings.', priceCents: 1300 },
        ],
      },
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
