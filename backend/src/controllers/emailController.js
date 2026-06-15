import { parseEmailInvoice } from "../services/emailParser.js";
import { applyRuleToDraft, resolveCategoryByName } from "../services/automationEngine.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { createHttpError } from "../utils/httpError.js";

export async function parseEmail(req, res) {
  const user = await resolveCurrentUser(req);
  const { subject, from, body } = req.body;

  if (!subject && !body) {
    throw createHttpError(400, "Email subject or body is required");
  }

  const parsed = parseEmailInvoice({ subject, from, body });
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
