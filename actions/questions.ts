"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin, getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { QuestionStatus } from "@prisma/client";

// Validation schemas
const submitQuestionSchema = z.object({
  content: z.string().min(10, "Question must be at least 10 characters").max(2000),
  lessonId: z.string().optional(),
});

// Types
export type SubmitQuestionInput = z.infer<typeof submitQuestionSchema>;

/**
 * Get all answered questions (public)
 */
export async function getAnsweredQuestions(options?: {
  lessonId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const { lessonId, limit = 10, offset = 0 } = options || {};

    const where = {
      status: QuestionStatus.ANSWERED,
      ...(lessonId && { lessonId }),
    };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              titleAmharic: true,
              titleGeez: true,
            },
          },
          answer: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      success: true,
      data: {
        questions,
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return { success: false, error: "Failed to fetch questions" };
  }
}

/**
 * Get all questions (admin only)
 */
export async function getAllQuestions(options?: {
  status?: QuestionStatus;
  limit?: number;
  offset?: number;
}) {
  try {
    await requireAdmin();

    const { status, limit = 20, offset = 0 } = options || {};

    const where = status ? { status } : {};

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              titleAmharic: true,
              titleGeez: true,
            },
          },
          claimedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          answer: true,
          _count: {
            select: { discussions: true },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      success: true,
      data: {
        questions,
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch questions" };
  }
}

/**
 * Get pending questions count (admin only)
 */
export async function getPendingQuestionsCount() {
  try {
    await requireAdmin();

    const count = await prisma.question.count({
      where: { status: QuestionStatus.PENDING },
    });

    return { success: true, data: count };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch count" };
  }
}

/**
 * Get a single question (admin only for non-answered, public for answered)
 */
export async function getQuestion(id: string) {
  try {
    const session = await getSession();

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            titleAmharic: true,
            titleGeez: true,
            volume: {
              select: {
                id: true,
                title: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        claimedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        answer: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // Only admins can see non-answered questions
    if (question.status !== QuestionStatus.ANSWERED) {
      if (!session || session.user.role !== "admin") {
        return { success: false, error: "Question not found" };
      }
    }

    return { success: true, data: question };
  } catch (error) {
    console.error("Failed to fetch question:", error);
    return { success: false, error: "Failed to fetch question" };
  }
}

/**
 * Submit a new question (authenticated users)
 */
export async function submitQuestion(input: SubmitQuestionInput) {
  try {
    const session = await requireAuth();

    const validated = submitQuestionSchema.parse(input);

    // Verify lesson exists if provided
    if (validated.lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: validated.lessonId },
      });

      if (!lesson) {
        return { success: false, error: "Lesson not found" };
      }
    }

    const question = await prisma.question.create({
      data: {
        content: validated.content,
        lessonId: validated.lessonId,
        userId: session.user.id,
        status: QuestionStatus.PENDING,
      },
    });

    revalidatePath("/admin/questions");
    revalidatePath("/questions");

    return {
      success: true,
      data: question,
      message: "Your question has been submitted. You will be notified when it is answered.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to submit question" };
  }
}

/**
 * Claim a question (admin only)
 */
export async function claimQuestion(id: string) {
  try {
    const session = await requireAdmin();

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    if (question.status !== QuestionStatus.PENDING) {
      if (question.claimedById === session.user.id) {
        return { success: false, error: "You have already claimed this question" };
      }
      return { success: false, error: "This question has already been claimed" };
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        status: QuestionStatus.CLAIMED,
        claimedById: session.user.id,
        claimedAt: new Date(),
      },
    });

    revalidatePath("/admin/questions");

    return { success: true, data: updatedQuestion };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to claim question" };
  }
}

/**
 * Unclaim a question (admin only - only the claimer or another admin)
 */
export async function unclaimQuestion(id: string) {
  try {
    await requireAdmin();

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    if (question.status === QuestionStatus.ANSWERED) {
      return { success: false, error: "Cannot unclaim an answered question" };
    }

    if (question.status === QuestionStatus.PENDING) {
      return { success: false, error: "Question is not claimed" };
    }

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        status: QuestionStatus.PENDING,
        claimedById: null,
        claimedAt: null,
      },
    });

    revalidatePath("/admin/questions");

    return { success: true, data: updatedQuestion };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to unclaim question" };
  }
}

/**
 * Mark question as discussing (admin only)
 */
export async function markQuestionDiscussing(id: string) {
  try {
    const session = await requireAdmin();

    const question = await prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    if (question.status === QuestionStatus.ANSWERED) {
      return { success: false, error: "Question is already answered" };
    }

    // Auto-claim if not claimed
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        status: QuestionStatus.DISCUSSING,
        ...(question.status === QuestionStatus.PENDING && {
          claimedById: session.user.id,
          claimedAt: new Date(),
        }),
      },
    });

    revalidatePath("/admin/questions");

    return { success: true, data: updatedQuestion };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update question" };
  }
}

/**
 * Delete a question (admin only)
 */
export async function deleteQuestion(id: string) {
  try {
    await requireAdmin();

    await prisma.question.delete({
      where: { id },
    });

    revalidatePath("/admin/questions");
    revalidatePath("/questions");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete question" };
  }
}

/**
 * Get user's own questions (authenticated)
 */
export async function getMyQuestions() {
  try {
    const session = await requireAuth();

    const questions = await prisma.question.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            titleAmharic: true,
            titleGeez: true,
          },
        },
        answer: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    return { success: true, data: questions };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch questions" };
  }
}
