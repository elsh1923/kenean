"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const updateUserRoleSchema = z.object({
  role: z.enum(["user", "teacher", "admin"]),
});

const banUserSchema = z.object({
  reason: z.string().min(1, "Ban reason is required").max(500),
  expiresAt: z.string().datetime().optional(),
});

// Get all users (admin only)
export async function getAllUsers(options?: {
  role?: string;
  banned?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    await requireSuperAdmin();

    const where: any = {};

    if (options?.role) {
      where.role = options.role;
    }

    if (options?.banned !== undefined) {
      where.banned = options.banned;
    }

    if (options?.search) {
      where.OR = [
        { email: { contains: options.search, mode: "insensitive" } },
        { name: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              questions: true,
              answers: true,
              discussions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.user.count({ where }),
    ]);

    return { success: true, data: users, total };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch users" };
  }
}

// Get user by ID (admin only)
export async function getUserById(id: string) {
  try {
    await requireSuperAdmin();

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: true,
            answers: true,
            discussions: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch user" };
  }
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: "user" | "teacher" | "admin") {
  try {
    await requireSuperAdmin();

    const validated = updateUserRoleSchema.parse({ role });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: validated.role },
    });

    revalidatePath("/admin/users");

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update user role" };
  }
}

// Ban user (admin only)
export async function banUser(
  userId: string,
  input: { reason: string; expiresAt?: string }
) {
  try {
    await requireSuperAdmin();

    const validated = banUserSchema.parse(input);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: true,
        banReason: validated.reason,
        banExpires: validated.expiresAt ? new Date(validated.expiresAt) : null,
      },
    });

    revalidatePath("/admin/users");

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to ban user" };
  }
}

// Unban user (admin only)
export async function unbanUser(userId: string) {
  try {
    await requireSuperAdmin();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });

    revalidatePath("/admin/users");

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to unban user" };
  }
}

// Delete user (admin only)
export async function deleteUser(userId: string) {
  try {
    await requireSuperAdmin();

    // Cascade delete will handle related records (sessions, questions, etc.)
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete user" };
  }
}

// Get admin statistics (admin only)
export async function getAdminStats() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalAdmins,
      totalCategories,
      totalVolumes,
      totalLessons,
      publishedLessons,
      totalQuestions,
      pendingQuestions,
      claimedQuestions,
      answeredQuestions,
      recentLessons,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ["admin", "teacher"] } } }),
      prisma.category.count(),
      prisma.volume.count(),
      prisma.lesson.count(),
      prisma.lesson.count({ where: { published: true } }),
      prisma.question.count(),
      prisma.question.count({ where: { status: "PENDING" } }),
      prisma.question.count({ where: { status: "CLAIMED" } }),
      prisma.question.count({ where: { status: "ANSWERED" } }),
      prisma.lesson.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          volume: {
            select: {
              title: true,
              category: {
                select: { name: true }
              }
            }
          }
        }
      })
    ]);

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
        },
        content: {
          categories: totalCategories,
          volumes: totalVolumes,
          lessons: totalLessons,
          publishedLessons,
          recentLessons,
        },
        questions: {
          total: totalQuestions,
          pending: pendingQuestions,
          claimed: claimedQuestions,
          answered: answeredQuestions,
        },
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch statistics" };
  }
}

// Get current user's profile (any authenticated user)
export async function getMyProfile() {
  try {
    const { getSession } = await import("@/lib/auth-utils");
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch profile" };
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

// Update current user's profile (any authenticated user)
export async function updateMyProfile(input: { name: string }) {
  try {
    const { getSession } = await import("@/lib/auth-utils");
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const validated = updateProfileSchema.parse(input);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: validated.name },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/admin/profile");

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update profile" };
  }
}
