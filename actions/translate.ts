"use server";

import { translateToGeez } from "@/lib/gemini";
import { requireAdmin } from "@/lib/auth-utils";

export async function translateToGeezAction(text: string) {
  try {
    await requireAdmin();
    const translation = await translateToGeez(text);
    return { success: true, data: translation };
  } catch (error) {
    console.error("Translation action error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Translation failed" };
  }
}
