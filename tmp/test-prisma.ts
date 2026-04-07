import { PrismaClient } from "../app/generated/prisma";
const prisma = new PrismaClient();
async function main() {
  try {
    console.log("Attempting query...");
    const products = await prisma.product.findMany({
      take: 1,
      include: { variants: true }
    });
    console.log("Success:", JSON.stringify(products, null, 2));
  } catch (e) {
    console.error("FULL DB ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
