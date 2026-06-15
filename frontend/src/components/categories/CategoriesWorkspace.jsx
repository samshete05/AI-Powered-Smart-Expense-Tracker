import { useMemo, useState } from "react";
import { createCategory, deleteCategory, updateCategory } from "../../services/api";
import { useCategoriesPageData } from "../../hooks/useCategoriesPageData";
import { emitDataChanged } from "../../lib/dataEvents";
import { ErrorState } from "../states/ErrorState";
import { LoadingState } from "../states/LoadingState";
import { AppIcon, getCategoryIconName } from "../ui/AppIcon";
import { CategoryFormModal } from "./CategoryFormModal";
import { useToast } from "../ui/ToastProvider";

export function CategoriesWorkspace() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const { data, loading, error, refetch } = useCategoriesPageData();
  const { pushToast } = useToast();

  const grouped = useMemo(
    () => ({
      expense: data.filter((category) => category.type === "expense"),
      income: data.filter((category) => category.type === "income")
    }),
    [data]
  );

  async function handleSaveCategory(form) {
    if (saving) return;
    setSaving(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, form);
        pushToast({ title: "Saved", message: "Category updated successfully." });
      } else {
        await createCategory(form);
        pushToast({ title: "Saved", message: "Category created successfully." });
      }

      emitDataChanged({ type: "category-changed" });
      setModalOpen(false);
      setEditingCategory(null);
      await refetch();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;
    await deleteCategory(category._id);
    emitDataChanged({ type: "category-deleted" });
    pushToast({ title: "Deleted", message: "Category removed successfully." });
    await refetch();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#a9682b] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <AppIcon name="plus" className="h-4 w-4" />
          Add category
        </button>
      </section>

      <section className="min-h-[420px] rounded-[20px] border border-stone-200 bg-[#fdfcfc]/95 p-4 shadow-[0_18px_40px_rgba(83,67,51,0.06)]">
        {data.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {["expense", "income"].map((type) => (
              <div key={type}>
                <h2 className="text-lg font-bold text-stone-900 capitalize">{type} categories</h2>
                <div className="mt-3 space-y-3">
                  {grouped[type].map((category) => (
                    <div key={category._id} className="flex flex-col gap-3 rounded-[16px] border border-stone-200 bg-[#faf7f3] p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-10 w-10 place-items-center rounded-2xl text-white"
                          style={{ backgroundColor: category.color || "#10b981" }}
                        >
                          <AppIcon name={getCategoryIconName(category.icon)} className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{category.name}</p>
                          <p className="text-xs text-stone-500 capitalize">{category.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-700"
                        >
                          <AppIcon name="edit" className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-rose-600"
                        >
                          <AppIcon name="delete" className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f4eee7] text-stone-500">
                <AppIcon name="categories" className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xl font-semibold text-stone-900">No categories</p>
              <p className="mt-1 text-sm text-stone-500">Get started by creating a new category.</p>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setModalOpen(true);
                }}
                className="mt-4 rounded-xl bg-[#a9682b] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Add Category
              </button>
            </div>
          </div>
        )}
      </section>

      <CategoryFormModal
        open={modalOpen}
        category={editingCategory}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        saving={saving}
      />
    </div>
  );
}
