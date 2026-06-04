import { Category } from "../models/Category.js";
import { resolveCurrentUser } from "../services/currentUser.js";
import { createHttpError } from "../utils/httpError.js";

export async function listCategories(req, res) {
  const user = await resolveCurrentUser(req);
  const categories = await Category.find({ createdBy: user._id }).sort({ type: 1, name: 1 });
  res.json({ success: true, data: categories });
}

export async function createCategory(req, res) {
  const user = await resolveCurrentUser(req);
  const { name, type, icon, color } = req.body;

  if (!name || !type) {
    throw createHttpError(400, "Category name and type are required");
  }

  const category = await Category.create({
    createdBy: user._id,
    name,
    type,
    icon,
    color
  });

  res.status(201).json({ success: true, data: category });
}

export async function updateCategory(req, res) {
  const user = await resolveCurrentUser(req);
  const category = await Category.findOne({ _id: req.params.id, createdBy: user._id });

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  ["name", "type", "icon", "color"].forEach((field) => {
    if (typeof req.body[field] === "string") {
      category[field] = req.body[field];
    }
  });

  await category.save();
  res.json({ success: true, data: category });
}

export async function deleteCategory(req, res) {
  const user = await resolveCurrentUser(req);
  const category = await Category.findOneAndDelete({ _id: req.params.id, createdBy: user._id });

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  res.json({ success: true, message: "Category deleted" });
}
