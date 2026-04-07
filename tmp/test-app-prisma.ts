import { prisma } from "../lib/prisma";

async function main() {
  try {
    const products = await prisma.product.findMany({ take: 1 });
    console.log("Success:", products);
  } catch (e) {
    console.error("Prisma App Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
