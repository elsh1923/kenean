import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user using Better Auth's internal methods
  // This creates a properly hashed password
  const email = "admin@orthodox-hub.com";
  const password = "Admin123!"; // Change this after first login!
  const name = "Admin Teacher";

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Admin user already exists, updating role...");
      await prisma.user.update({
        where: { email },
        data: { role: "admin" },
      });
      console.log("✅ Admin role updated!");
      return;
    }

    // Create user with Better Auth's sign-up
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!response) {
      throw new Error("Failed to create user");
    }

    // Update to admin role
    await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("");
    console.log("⚠️  IMPORTANT: Change this password after first login!");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
