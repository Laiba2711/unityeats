import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const restaurants = await prisma.restaurant.findMany({
    include: { menuItems: true }
  });
  console.log("Restaurants sample:");
  console.log(JSON.stringify(restaurants.slice(0, 2), null, 2));

  const carts = await prisma.cart.findMany({ take: 2 });
  console.log("Carts sample:");
  console.log(JSON.stringify(carts, null, 2));
}

main().finally(() => prisma.$disconnect());
