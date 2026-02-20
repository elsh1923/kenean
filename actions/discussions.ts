"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { QuestionStatus } from "@prisma/client";

// Validation schemas
const addDiscussionSchema = z.object({
  content: z.string().min(1, "Content is required").max(5000),
});

// Types
export type AddDiscussionInput = z.infer<typeof addDiscussionSchema>;

/**
 * Get all discussions for a question (admin only)
 */
export async function getDiscussions(questionId: string) {
  try {
    await requireAdmin();

    const discussions = await prisma.adminDiscussion.findMany({
      where: { questionId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: discussions };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch discussions" };
  }
}

/**
 * Add a discussion comment to a question (admin only)
 */
export async function addDiscussion(questionId: string, input: AddDiscussionInput) {
  try {
    const session = await requireAdmin();

    const validated = addDiscussionSchema.parse(input);

    // Get the question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    if (question.status === QuestionStatus.ANSWERED) {
      return { success: false, error: "Cannot discuss an already answered question" };
    }

    // Create discussion and optionally update question status
    const discussion = await prisma.$transaction(async (tx) => {
      const newDiscussion = await tx.adminDiscussion.create({
        data: {
          content: validated.content,
          questionId,
          authorId: session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Update question status to DISCUSSING if it's PENDING or CLAIMED
      if (
        question.status === QuestionStatus.PENDING ||
        question.status === QuestionStatus.CLAIMED
      ) {
        await tx.question.update({
          where: { id: questionId },
          data: {
            status: QuestionStatus.DISCUSSING,
            // Auto-claim if not claimed
            ...(question.status === QuestionStatus.PENDING && {
              claimedById: session.user.id,
              claimedAt: new Date(),
            }),
          },
        });
      }

      return newDiscussion;
    });

    revalidatePath(`/admin/questions/${questionId}`);

    return { success: true, data: discussion };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add discussion" };
  }
}

/**
 * Update a discussion comment (admin only - author only)
 */
export async function updateDiscussion(id: string, content: string) {
  try {
    const session = await requireAdmin();

    const validated = addDiscussionSchema.parse({ content });

    const discussion = await prisma.adminDiscussion.findUnique({
      where: { id },
    });

    if (!discussion) {
      return { success: false, error: "Discussion not found" };
    }

    if (discussion.authorId !== session.user.id) {
      return { success: false, error: "You can only edit your own comments" };
    }

    const updatedDiscussion = await prisma.adminDiscussion.update({
      where: { id },
      data: {
        content: validated.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/admin/questions/${discussion.questionId}`);

    return { success: true, data: updatedDiscussion };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update discussion" };
  }
}

/**
 * Delete a discussion comment (admin only - author only)
 */
export async function deleteDiscussion(id: string) {
  try {
    const session = await requireAdmin();

    const discussion = await prisma.adminDiscussion.findUnique({
      where: { id },
    });

    if (!discussion) {
      return { success: false, error: "Discussion not found" };
    }

    if (discussion.authorId !== session.user.id) {
      return { success: false, error: "You can only delete your own comments" };
    }

    await prisma.adminDiscussion.delete({
      where: { id },
    });

    revalidatePath(`/admin/questions/${discussion.questionId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete discussion" };
  }
}

/**
 * Get discussions count for a question (admin only)
 */
export async function getDiscussionsCount(questionId: string) {
  try {
    await requireAdmin();

    const count = await prisma.adminDiscussion.count({
      where: { questionId },
    });

    return { success: true, data: count };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to fetch count" };
  }
}
