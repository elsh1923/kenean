"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { QuestionStatus } from "@prisma/client";

// Validation schemas
const submitAnswerSchema = z.object({
  content: z.string().min(10, "Answer must be at least 10 characters").max(10000),
  attachments: z.array(z.string().url()).optional(),
});

const updateAnswerSchema = submitAnswerSchema.partial();

// Types
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;

/**
 * Submit an answer to a question (admin only)
 */
export async function submitAnswer(questionId: string, input: SubmitAnswerInput) {
  try {
    const session = await requireAdmin();

    const validated = submitAnswerSchema.parse(input);

    // Get the question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { answer: true },
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    if (question.answer) {
      return { success: false, error: "This question already has an answer" };
    }

    // Create answer and update question status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const answer = await tx.answer.create({
        data: {
          content: validated.content,
          attachments: validated.attachments || [],
          questionId,
          authorId: session.user.id,
        },
      });

      await tx.question.update({
        where: { id: questionId },
        data: {
          status: QuestionStatus.ANSWERED,
          // Auto-claim if not claimed
          ...(question.status === QuestionStatus.PENDING && {
            claimedById: session.user.id,
            claimedAt: new Date(),
          }),
        },
      });

      return answer;
    });

    revalidatePath("/admin/questions");
    revalidatePath("/questions");
    revalidatePath(`/questions/${questionId}`);

    return {
      success: true,
      data: result,
      message: "Answer published successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to submit answer" };
  }
}

/**
 * Update an existing answer (admin only - author only)
 */
export async function updateAnswer(id: string, input: UpdateAnswerInput) {
  try {
    const session = await requireAdmin();

    const validated = updateAnswerSchema.parse(input);

    const answer = await prisma.answer.findUnique({
      where: { id },
    });

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    // Only the author can update the answer
    if (answer.authorId !== session.user.id) {
      return { success: false, error: "You can only edit your own answers" };
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: {
        content: validated.content,
        ...(validated.attachments !== undefined && {
          attachments: validated.attachments,
        }),
      },
    });

    revalidatePath("/questions");
    revalidatePath(`/questions/${answer.questionId}`);

    return { success: true, data: updatedAnswer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update answer" };
  }
}

/**
 * Delete an answer (admin only)
 * This will also reset the question status back to CLAIMED
 */
export async function deleteAnswer(id: string) {
  try {
    await requireAdmin();

    const answer = await prisma.answer.findUnique({
      where: { id },
      include: { question: true },
    });

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    // Delete answer and update question status in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.answer.delete({
        where: { id },
      });

      // Reset question status to CLAIMED since the question was already being worked on
      await tx.question.update({
        where: { id: answer.questionId },
        data: {
          status: QuestionStatus.CLAIMED,
        },
      });
    });

    revalidatePath("/admin/questions");
    revalidatePath("/questions");
    revalidatePath(`/questions/${answer.questionId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete answer" };
  }
}

/**
 * Get an answer by question ID
 */
export async function getAnswerByQuestion(questionId: string) {
  try {
    const answer = await prisma.answer.findUnique({
      where: { questionId },
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

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    return { success: true, data: answer };
  } catch (error) {
    console.error("Failed to fetch answer:", error);
    return { success: false, error: "Failed to fetch answer" };
  }
}

/**
 * Add attachment to answer (admin only)
 */
export async function addAttachmentToAnswer(id: string, attachmentUrl: string) {
  try {
    const session = await requireAdmin();

    const answer = await prisma.answer.findUnique({
      where: { id },
    });

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    if (answer.authorId !== session.user.id) {
      return { success: false, error: "You can only edit your own answers" };
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: {
        attachments: {
          push: attachmentUrl,
        },
      },
    });

    revalidatePath(`/questions/${answer.questionId}`);

    return { success: true, data: updatedAnswer };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to add attachment" };
  }
}

/**
 * Remove attachment from answer (admin only)
 */
export async function removeAttachmentFromAnswer(id: string, attachmentUrl: string) {
  try {
    const session = await requireAdmin();

    const answer = await prisma.answer.findUnique({
      where: { id },
    });

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    if (answer.authorId !== session.user.id) {
      return { success: false, error: "You can only edit your own answers" };
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id },
      data: {
        attachments: answer.attachments.filter((url) => url !== attachmentUrl),
      },
    });

    revalidatePath(`/questions/${answer.questionId}`);

    return { success: true, data: updatedAnswer };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to remove attachment" };
  }
}
