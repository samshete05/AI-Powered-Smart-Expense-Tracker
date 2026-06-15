import { Category } from "../models/Category.js";
import { AutomationRule } from "../models/AutomationRule.js";

function buildSearchText(input = {}) {
  return [input.merchant, input.note, input.description, input.rawText, input.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export async function findMatchingRule(userId, input = {}) {
  const searchText = buildSearchText(input);
  if (!searchText) return null;

  const rules = await AutomationRule.find({
    createdBy: userId,
    isActive: true,
    appliesToType: { $in: ["all", input.type || "expense"] }
  }).populate("category", "name type color icon");

  return rules.find((rule) => searchText.includes(rule.merchantContains.toLowerCase())) || null;
}

export async function resolveCategoryByName(userId, name, type = "expense") {
  if (!name) return null;
  return Category.findOne({
    createdBy: userId,
    type,
    name: new RegExp(`^${String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
  });
}

export async function applyRuleToDraft(userId, draft) {
  const matchedRule = await findMatchingRule(userId, draft);
  if (!matchedRule?.category) {
    return {
      ...draft,
      automation: null
    };
  }

  return {
    ...draft,
    category: matchedRule.category.name,
    categoryId: String(matchedRule.category._id),
    categoryMeta: matchedRule.category,
    automation: {
      ruleId: String(matchedRule._id),
      ruleName: matchedRule.name
    }
  };
}

export async function applyRuleToTransactionInput(userId, input) {
  if (input.categoryId) {
    return input;
  }

  const matchedRule = await findMatchingRule(userId, input);
  if (!matchedRule?.category) {
    return input;
  }

  return {
    ...input,
    categoryId: String(matchedRule.category._id),
    automationRuleId: String(matchedRule._id)
  };
}
