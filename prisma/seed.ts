import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Get default admin credentials from environment variables
  const defaultAdminUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!";

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: Role.SUPER_ADMIN,
    },
  });

  if (existingSuperAdmin) {
    console.log("✅ Super admin already exists, skipping seed.");
    console.log(`   Username: ${existingSuperAdmin.username}`);
    console.log(`   Email: ${existingSuperAdmin.email}`);
    return;
  }

  // Hash the default password
  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

  // Create the default super admin user
  const superAdmin = await prisma.user.create({
    data: {
      username: defaultAdminUsername,
      email: defaultAdminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("✅ Default super admin created successfully!");
  console.log(`   Username: ${superAdmin.username}`);
  console.log(`   Email: ${superAdmin.email}`);
  console.log(`   Password: ${defaultAdminPassword}`);
  console.log("");
  console.log("⚠️  IMPORTANT: Change the default password immediately after first login!");
  console.log("");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
