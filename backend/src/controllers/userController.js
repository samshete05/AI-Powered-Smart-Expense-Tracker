import { resolveCurrentUser } from "../services/currentUser.js";

function mapUser(user) {
  return {
    _id: user._id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    fullName: user.fullName,
    preferences: {
      currency: user.preferences?.currency || "INR",
      theme: user.preferences?.theme || "dark",
      onboardingCompleted: Boolean(user.preferences?.onboardingCompleted),
      focusAreas: user.preferences?.focusAreas || [],
      incomeRange: user.preferences?.incomeRange || "",
      onboardingNotes: user.preferences?.onboardingNotes || ""
    }
  };
}

export async function getCurrentUserProfile(req, res) {
  const user = await resolveCurrentUser(req);
  res.json({ success: true, data: mapUser(user) });
}

export async function updateCurrentUserProfile(req, res) {
  const user = await resolveCurrentUser(req);
  const preferences = user.preferences || {};
  const nextPreferences = { ...preferences.toObject?.(), ...preferences };

  if (typeof req.body.currency === "string" && req.body.currency.trim()) {
    nextPreferences.currency = req.body.currency.trim().toUpperCase();
  }

  if (typeof req.body.theme === "string" && req.body.theme.trim()) {
    nextPreferences.theme = req.body.theme.trim();
  }

  if (typeof req.body.onboardingCompleted === "boolean") {
    nextPreferences.onboardingCompleted = req.body.onboardingCompleted;
  }

  if (Array.isArray(req.body.focusAreas)) {
    nextPreferences.focusAreas = req.body.focusAreas
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (typeof req.body.incomeRange === "string") {
    nextPreferences.incomeRange = req.body.incomeRange.trim();
  }

  if (typeof req.body.onboardingNotes === "string") {
    nextPreferences.onboardingNotes = req.body.onboardingNotes.trim();
  }

  user.preferences = nextPreferences;
  await user.save();

  res.json({ success: true, data: mapUser(user) });
}
