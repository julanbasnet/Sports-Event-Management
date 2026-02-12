import type { z } from "zod";

import type { ActionResult } from "@/lib/types";

export function createSafeAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (validatedData: TInput) => Promise<TOutput>
): (data: TInput) => Promise<ActionResult<TOutput>> {
  return async (data: TInput): Promise<ActionResult<TOutput>> => {
    const result = schema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? "Validation failed",
      };
    }

    try {
      const output = await handler(result.data);
      return { success: true, data: output };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return { success: false, error: message };
    }
  };
}
