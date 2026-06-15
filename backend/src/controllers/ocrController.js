import multer from "multer";
import { applyRuleToDraft, resolveCategoryByName } from "../services/automationEngine.js";
import { parseDocumentText } from "../services/ocrParser.js";
import { resolveCurrentUser } from "../services/currentUser.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadReceipt = upload.single("file");

export async function parseReceipt(req, res) {
  const user = await resolveCurrentUser(req);
  const rawText = req.body.rawText || "";
  const fileName = req.file?.originalname || req.body.fileName || "receipt";
  const parsed = parseDocumentText({ rawText, fileName });
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
