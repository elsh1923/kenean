"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const createVolumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  titleAmharic: z.string().optional(),
  titleGeez: z.string().optional(),
  description: z.string().optional(),
  descriptionAmharic: z.string().optional(),
  descriptionGeez: z.string().optional(),
  volumeNumber: z.number().int().positive("Volume number must be positive"),
  categoryId: z.string().min(1, "Category is required"),
});

const updateVolumeSchema = createVolumeSchema.partial();

// Types
export type CreateVolumeInput = z.infer<typeof createVolumeSchema>;
export type UpdateVolumeInput = z.infer<typeof updateVolumeSchema>;

/**
 * Get all volumes for a category (public)
 */
export async function getVolumesByCategory(categoryId: string) {
  try {
    const volumes = await prisma.volume.findMany({
      where: { categoryId },
      orderBy: { volumeNumber: "asc" },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });
    return { success: true, data: volumes };
  } catch (error) {
    console.error("Failed to fetch volumes:", error);
    return { success: false, error: "Failed to fetch volumes" };
  }
}

/**
 * Get a single volume by ID (public)
 */
export async function getVolume(id: string) {
  try {
    const volume = await prisma.volume.findUnique({
      where: { id },
      include: {
        category: true,
        lessons: {
          where: { published: true },
          orderBy: { lessonNumber: "asc" },
        },
      },
    });

    if (!volume) {
      return { success: false, error: "Volume not found" };
    }

    return { success: true, data: volume };
  } catch (error) {
    console.error("Failed to fetch volume:", error);
    return { success: false, error: "Failed to fetch volume" };
  }
}

/**
 * Get a single volume with all lessons (admin only - includes unpublished)
 */
export async function getVolumeAdmin(id: string) {
  try {
    await requireAdmin();

    const volume = await prisma.volume.findUnique({
      where: { id },
      include: {
        category: true,
        lessons: {
          orderBy: { lessonNumber: "asc" },
        },
      },
    });

    if (!volume) {
      return { success: false, error: "Volume not found" };
    }

    return { success: true, data: volume };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch volume" };
  }
}

/**
 * Create a new volume (admin only)
 */
export async function createVolume(input: CreateVolumeInput) {
  try {
    await requireAdmin();

    const validated = createVolumeSchema.parse(input);

    // Check if volume number already exists in this category
    const existingVolume = await prisma.volume.findFirst({
      where: {
        categoryId: validated.categoryId,
        volumeNumber: validated.volumeNumber,
      },
    });

    if (existingVolume) {
      return {
        success: false,
        error: "A volume with this number already exists in this category",
      };
    }

    const volume = await prisma.volume.create({
      data: validated,
    });

    revalidatePath("/");
    revalidatePath(`/categories/${validated.categoryId}`);
    revalidatePath("/admin/volumes");

    return { success: true, data: volume };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create volume" };
  }
}

/**
 * Update a volume (admin only)
 */
export async function updateVolume(id: string, input: UpdateVolumeInput) {
  try {
    await requireAdmin();

    const validated = updateVolumeSchema.parse(input);

    // Get the current volume
    const currentVolume = await prisma.volume.findUnique({
      where: { id },
    });

    if (!currentVolume) {
      return { success: false, error: "Volume not found" };
    }

    // Check if volume number already exists (if updating volume number)
    if (validated.volumeNumber) {
      const existingVolume = await prisma.volume.findFirst({
        where: {
          categoryId: validated.categoryId || currentVolume.categoryId,
          volumeNumber: validated.volumeNumber,
          NOT: { id },
        },
      });

      if (existingVolume) {
        return {
          success: false,
          error: "A volume with this number already exists in this category",
        };
      }
    }

    const volume = await prisma.volume.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/");
    revalidatePath(`/categories/${volume.categoryId}`);
    revalidatePath("/admin/volumes");

    return { success: true, data: volume };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update volume" };
  }
}

/**
 * Delete a volume (admin only)
 */
export async function deleteVolume(id: string) {
  try {
    await requireAdmin();

    const volume = await prisma.volume.findUnique({
      where: { id },
    });

    if (!volume) {
      return { success: false, error: "Volume not found" };
    }

    await prisma.volume.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath(`/categories/${volume.categoryId}`);
    revalidatePath("/admin/volumes");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete volume" };
  }
}
