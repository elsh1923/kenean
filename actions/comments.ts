"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const submitCommentSchema = z.object({
  content: z.string().min(2, "Comment must be at least 2 characters").max(5000),
  answerId: z.string(),
  attachments: z.array(z.string().url()).optional(),
  links: z.array(z.string().url()).optional(),
});

export type SubmitCommentInput = z.infer<typeof submitCommentSchema>;

/**
 * Add a comment/follow-up question to an answer
 */
export async function addAnswerComment(input: SubmitCommentInput) {
  try {
    const session = await requireAuth();
    const validated = submitCommentSchema.parse(input);

    const answer = await prisma.answer.findUnique({
      where: { id: validated.answerId },
      include: { question: true }
    });

    if (!answer) {
      return { success: false, error: "Answer not found" };
    }

    // Embed attachments and links into content as metadata
    let finalContent = validated.content;
    if ((validated.attachments && validated.attachments.length > 0) || (validated.links && validated.links.length > 0)) {
      const metadata = {
        attachments: validated.attachments || [],
        links: validated.links || []
      };
      finalContent += `\n\n---METADATA---\n${JSON.stringify(metadata)}`;
    }

    const comment = await prisma.answerComment.create({
      data: {
        content: finalContent,
        answerId: validated.answerId,
        userId: session.user.id,
      },
    });

    revalidatePath(`/questions/${answer.questionId}`);
    revalidatePath("/questions");

    return {
      success: true,
      data: comment,
      message: "Comment added successfully.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to submit comment" };
  }
}
