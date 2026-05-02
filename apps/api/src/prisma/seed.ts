// apps/api/prisma/seed.ts

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding permissions...")

  await prisma.permission.createMany({
    skipDuplicates: true, // se rodar de novo, não duplica
    data: [
      { key: "barbers.view",    module: "barbers",   description: "View barbers" },
      { key: "barbers.create",  module: "barbers",   description: "Create barbers" },
      { key: "barbers.edit",    module: "barbers",   description: "Edit barbers" },
      { key: "barbers.delete",  module: "barbers",   description: "Delete barbers" },
      { key: "services.view",   module: "services",  description: "View services" },
      { key: "services.create", module: "services",  description: "Create services" },
      { key: "services.edit",   module: "services",  description: "Edit services" },
      { key: "services.delete", module: "services",  description: "Delete services" },
      { key: "schedule.view",   module: "schedule",  description: "View schedule" },
      { key: "schedule.manage", module: "schedule",  description: "Manage schedule" },
      { key: "schedule.block",  module: "schedule",  description: "Create blocks" },
      { key: "customers.view",  module: "customers", description: "View customers" },
      { key: "customers.manage", module: "customers", description: "Manage customers" },
      { key: "users.view",      module: "users",     description: "View users" },
      { key: "users.manage",    module: "users",     description: "Manage users" },
      { key: "roles.view",      module: "roles",     description: "View roles" },
      { key: "roles.manage",    module: "roles",     description: "Manage roles" },
      { key: "reports.view",    module: "reports",   description: "View reports" },
    ],
  })

  console.log("✅ Seed concluído!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
