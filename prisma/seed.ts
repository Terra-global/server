import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FARM_TYPES = [
  { name: 'Subsistence Farmer', description: 'Someone who grows food primarily to feed themselves and their family, with little to no surplus for trade' },
  { name: 'Hobby Farmer', description: "Also known as a 'Lifestyle Farmer'; someone who farms for pleasure or as a side interest rather than as a primary source of income" },
  { name: 'Smallholder', description: 'Farmers who operate on a small scale, usually less than 2-5 hectares, often found in developing agricultural sectors.' },
  { name: 'Contract Farmer', description: 'A farmer who produces specific crops or livestock under a pre-formal agreement with a buyer (like a large food processor).' },
  { name: 'Livestock Producer', description: 'Specifically focused on raising animals (cattle, poultry, etc.).' },
  { name: 'Arable Farmer', description: 'A farmer focused strictly on growing crops like wheat, maize, or soy.' },
  { name: 'Horticulturalist', description: 'Focuses on high-value crops like fruits, vegetables, nuts, or ornamental plants (greenhouse or nursery).' },
  { name: 'Aquaculture Farmer', description: 'Someone who raises aquatic organisms like fish, crustaceans, or mollusks.' },
];

async function main() {
  console.log('Seeding farm types...');
  for (const type of FARM_TYPES) {
    await prisma.farmType.upsert({
      where: { name: type.name },
      update: { description: type.description },
      create: { name: type.name, description: type.description },
    });
  }
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
