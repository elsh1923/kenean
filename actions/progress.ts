"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function getUserProgress() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const progress = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            titleAmharic: true,
            titleGeez: true,
            volumeId: true,
            volume: {
              select: {
                title: true,
                titleAmharic: true,
                titleGeez: true,
                categoryId: true,
                volumeNumber: true,
                category: { 
                  select: { 
                    name: true,
                    nameAmharic: true,
                    nameGeez: true
                  } 
                }
              }
            }
          }
        }
      }
    });

    const totalLessons = await prisma.lesson.count({ where: { published: true } });
    const completedLessons = progress.filter((p) => p.completed).length;

    return { success: true, data: { progress, totalLessons, completedLessons } };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to fetch user progress" };
  }
}

export async function markLessonCompleted(lessonId: string, completed: boolean = true) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const progress = await prisma.userProgress.upsert({
      where: {
         userId_lessonId: {
          userId: session.user.id,
          lessonId
        }
      },
      update: {
        completed
      },
      create: {
        userId: session.user.id,
        lessonId,
        completed
      }
    });

    return { success: true, data: progress };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to mark lesson completed" };
  }
}

export async function getLessonProgress(lessonId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: true, data: false }; // Not logged in -> false

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId
        }
      }
    });

    return { success: true, data: progress?.completed || false };
  } catch (error) {
    return { success: false, error: "Failed to fetch lesson progress" };
  }
}
