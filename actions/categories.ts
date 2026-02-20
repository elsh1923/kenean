"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  nameAmharic: z.string().optional(),
  nameGeez: z.string().optional(),
  description: z.string().optional(),
  descriptionAmharic: z.string().optional(),
  descriptionGeez: z.string().optional(),
  slug: z.string().min(1, "Slug is required").max(100),
  order: z.number().int().default(0),
});

const updateCategorySchema = createCategorySchema.partial();

// Types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/**
 * Get all categories (public)
 */
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { volumes: true },
        },
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

/**
 * Get a single category by ID or slug (public)
 */
export async function getCategory(idOrSlug: string) {
  try {
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        volumes: {
          orderBy: { volumeNumber: "asc" },
          include: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

/**
 * Create a new category (admin only)
 */
export async function createCategory(input: CreateCategoryInput) {
  try {
    await requireAdmin();

    const validated = createCategorySchema.parse(input);

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validated.slug },
    });

    if (existingCategory) {
      return { success: false, error: "A category with this slug already exists" };
    }

    const category = await prisma.category.create({
      data: validated,
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create category" };
  }
}

/**
 * Update a category (admin only)
 */
export async function updateCategory(id: string, input: UpdateCategoryInput) {
  try {
    await requireAdmin();

    const validated = updateCategorySchema.parse(input);

    // Check if slug already exists (if updating slug)
    if (validated.slug) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug: validated.slug,
          NOT: { id },
        },
      });

      if (existingCategory) {
        return { success: false, error: "A category with this slug already exists" };
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return { success: true, data: category };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update category" };
  }
}

/**
 * Delete a category (admin only)
 */
export async function deleteCategory(id: string) {
  try {
    await requireAdmin();

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete category" };
  }
}
