"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const lessonBaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  titleAmharic: z.string().optional(),
  titleGeez: z.string().optional(),
  description: z.string().optional(),
  descriptionAmharic: z.string().optional(),
  descriptionGeez: z.string().optional(),
  type: z.enum(["VIDEO", "BOOK"]).default("VIDEO"),
  youtubeUrl: z.string().url("Invalid YouTube URL").optional().or(z.literal("")),
  pdfUrl: z.string().url("Invalid PDF URL").optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional(),
  lessonNumber: z.number().int().positive("Lesson number must be positive"),
  duration: z.number().int().positive().optional(),
  volumeId: z.string().min(1, "Volume is required"),
  published: z.boolean().default(false),
});

const createLessonSchema = lessonBaseSchema.refine((data) => {
  if (data.type === "VIDEO" && !data.youtubeUrl) {
    return false;
  }
  return true;
}, {
  message: "YouTube URL is required for video lessons",
  path: ["youtubeUrl"],
});

const updateLessonSchema = lessonBaseSchema.partial();

// Types
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Get all published lessons (public)
 */
export async function getPublishedLessons(options?: {
  limit?: number;
  offset?: number;
}) {
  try {
    const { limit, offset } = options || {};
    
    const lessons = await prisma.lesson.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        volume: {
          include: {
            category: true,
          },
        },
      },
    });
    return { success: true, data: lessons };
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return { success: false, error: "Failed to fetch lessons" };
  }
}

/**
 * Get lessons by volume (public - only published)
 */
export async function getLessonsByVolume(volumeId: string) {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        volumeId,
        published: true,
      },
      orderBy: { lessonNumber: "asc" },
    });
    return { success: true, data: lessons };
  } catch (error) {
    console.error("Failed to fetch lessons:", error);
    return { success: false, error: "Failed to fetch lessons" };
  }
}

/**
 * Get all lessons by volume (admin only - includes unpublished)
 */
export async function getLessonsByVolumeAdmin(volumeId: string) {
  try {
    await requireAdmin();

    const lessons = await prisma.lesson.findMany({
      where: { volumeId },
      orderBy: { lessonNumber: "asc" },
    });
    return { success: true, data: lessons };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch lessons" };
  }
}

/**
 * Get a single lesson by ID (public - only if published)
 */
export async function getLesson(id: string) {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id,
        published: true,
      },
      include: {
        volume: {
          include: {
            category: true,
            lessons: {
              where: { published: true },
              orderBy: { lessonNumber: "asc" },
              select: {
                id: true,
                title: true,
                lessonNumber: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    return { success: true, data: lesson };
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return { success: false, error: "Failed to fetch lesson" };
  }
}

/**
 * Get a single lesson by ID (admin only - includes unpublished)
 */
export async function getLessonAdmin(id: string) {
  try {
    await requireAdmin();

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        volume: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    return { success: true, data: lesson };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch lesson" };
  }
}

/**
 * Create a new lesson (admin only)
 */
export async function createLesson(input: CreateLessonInput) {
  try {
    await requireAdmin();

    const validated = createLessonSchema.parse(input);

    // Check if lesson number already exists in this volume
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        volumeId: validated.volumeId,
        lessonNumber: validated.lessonNumber,
      },
    });

    if (existingLesson) {
      return {
        success: false,
        error: "A lesson with this number already exists in this volume",
      };
    }

    // Auto-generate thumbnail from YouTube URL if not provided and it's a video
    let thumbnailUrl = validated.thumbnailUrl;
    if (!thumbnailUrl && validated.type === "VIDEO" && validated.youtubeUrl) {
      const videoId = extractYouTubeId(validated.youtubeUrl);
      if (videoId) {
        thumbnailUrl = getYouTubeThumbnail(videoId);
      }
    }

    const lesson = await prisma.lesson.create({
      data: {
        ...validated,
        thumbnailUrl,
      },
    });

    revalidatePath("/");
    revalidatePath(`/volumes/${validated.volumeId}`);
    revalidatePath("/admin/lessons");

    return { success: true, data: lesson };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create lesson" };
  }
}

/**
 * Update a lesson (admin only)
 */
export async function updateLesson(id: string, input: UpdateLessonInput) {
  try {
    await requireAdmin();

    const validated = updateLessonSchema.parse(input);

    // Get the current lesson
    const currentLesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!currentLesson) {
      return { success: false, error: "Lesson not found" };
    }

    // Check if lesson number already exists (if updating lesson number)
    if (validated.lessonNumber) {
      const existingLesson = await prisma.lesson.findFirst({
        where: {
          volumeId: validated.volumeId || currentLesson.volumeId,
          lessonNumber: validated.lessonNumber,
          NOT: { id },
        },
      });

      if (existingLesson) {
        return {
          success: false,
          error: "A lesson with this number already exists in this volume",
        };
      }
    }

    // Update thumbnail if YouTube URL changed and no thumbnail provided
    let thumbnailUrl = validated.thumbnailUrl;
    if (validated.type === "VIDEO" && validated.youtubeUrl && !validated.thumbnailUrl) {
      const videoId = extractYouTubeId(validated.youtubeUrl);
      if (videoId) {
        thumbnailUrl = getYouTubeThumbnail(videoId);
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...validated,
        ...(thumbnailUrl && { thumbnailUrl }),
      },
    });

    revalidatePath("/");
    revalidatePath(`/volumes/${lesson.volumeId}`);
    revalidatePath(`/lessons/${id}`);
    revalidatePath("/admin/lessons");

    return { success: true, data: lesson };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update lesson" };
  }
}

/**
 * Toggle lesson publish status (admin only)
 */
export async function toggleLessonPublished(id: string) {
  try {
    await requireAdmin();

    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        published: !lesson.published,
      },
    });

    revalidatePath("/");
    revalidatePath(`/volumes/${lesson.volumeId}`);
    revalidatePath(`/lessons/${id}`);
    revalidatePath("/admin/lessons");

    return { success: true, data: updatedLesson };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update lesson" };
  }
}

/**
 * Delete a lesson (admin only)
 */
export async function deleteLesson(id: string) {
  try {
    await requireAdmin();

    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      return { success: false, error: "Lesson not found" };
    }

    await prisma.lesson.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath(`/volumes/${lesson.volumeId}`);
    revalidatePath("/admin/lessons");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete lesson" };
  }
}
