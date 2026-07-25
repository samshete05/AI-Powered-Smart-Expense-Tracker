import { parseSmsText } from "../services/smsParser.js";
import { applyRuleToDraft, resolveCategoryByName } from "../services/automationEngine.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { createHttpError } from "../utils/httpError.js";

export async function parseSms(req, res) {
  const user = await resolveCurrentUser(req);
  const { text } = req.body;

  if (!text) {
    throw createHttpError(400, "SMS text is required");
  }

  const parsed = parseSmsText(text);
  const matchedCategory = await resolveCategoryByName(user._id, parsed.category, parsed.type);
  const enriched = await applyRuleToDraft(user._id, {
    ...parsed,
    categoryId: matchedCategory ? String(matchedCategory._id) : undefined,
    categoryMeta: matchedCategory || undefined,
    category: matchedCategory?.name || parsed.category
  });

  res.json({
    success: true,
    data: {
      ...enriched,
      reviewRequired: true
    }
  });
}
