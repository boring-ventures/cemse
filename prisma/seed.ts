import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create super admin user
  const hashedPassword = await bcrypt.hash("12345678", 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
      isActive: true,
    },
  });

  console.log("✅ Super admin created:", superAdmin.username);

  // Create profile for super admin
  await prisma.profile.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: {
      userId: superAdmin.id,
      firstName: "Super",
      lastName: "Admin",
      role: UserRole.SUPERADMIN,
      active: true,
    },
  });

  // Create some sample users for different roles
  const sampleUsers = [
    { username: "jovenes1", password: "12345678", role: UserRole.YOUTH },
    {
      username: "adolescentes1",
      password: "12345678",
      role: UserRole.ADOLESCENTS,
    },
    { username: "empresa1", password: "12345678", role: UserRole.COMPANIES },
    {
      username: "gobierno1",
      password: "12345678",
      role: UserRole.MUNICIPAL_GOVERNMENTS,
    },
    {
      username: "centro1",
      password: "12345678",
      role: UserRole.TRAINING_CENTERS,
    },
    {
      username: "ong1",
      password: "12345678",
      role: UserRole.NGOS_AND_FOUNDATIONS,
    },
  ];

  for (const userData of sampleUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
      },
    });

    // Create corresponding profile for each user
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: userData.username,
        lastName: "Usuario",
        role: userData.role,
        active: true,
      },
    });
  }

  console.log("✅ Sample users created");

  console.log("🎉 Database seeding completed!");
  console.log("");
  console.log("📋 Login Credentials:");
  console.log("Super Admin: admin / admin123");
  console.log("Sample Users:");
  sampleUsers.forEach((user) => {
    console.log(`  ${user.role}: ${user.username} / ${user.password}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
