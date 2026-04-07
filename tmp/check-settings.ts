import { prisma } from "../lib/prisma";

async function checkSettings() {
  const settings = await prisma.setting.findMany();
  console.log("Current Settings:", JSON.stringify(settings, null, 2));
  
  if (settings.length > 0) {
    const s = settings[0];
    console.log("Currency Type:", typeof s.currency);
    console.log("Stripe Publishable Key:", s.stripePublishableKey);
  }
}

checkSettings()
  .catch(e => console.error(e))
  .finally(() => process.exit());
