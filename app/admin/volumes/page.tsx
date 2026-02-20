"use client";

import { useState, useEffect } from "react";
import {
  getCategories,
  getVolumesByCategory,
  createVolume,
  updateVolume,
  deleteVolume,
  CreateVolumeInput,
  UpdateVolumeInput,
} from "@/actions";
import { FormModal } from "@/components/admin/FormModal";
import { Edit, Trash2, Plus, BookOpen, FolderTree } from "lucide-react";

export default function VolumesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolume, setEditingVolume] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const categoriesResult = await getCategories();
    if (categoriesResult.success && categoriesResult.data) {
      setCategories(categoriesResult.data);
      
      // Load volumes for each category
      const volumesData: Record<string, any[]> = {};
      for (const category of categoriesResult.data) {
        const result = await getVolumesByCategory(category.id);
        if (result.success && result.data) {
          volumesData[category.id] = result.data;
        }
      }
      setVolumes(volumesData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingVolume(null);
    setIsModalOpen(true);
  };

  const handleEdit = (volume: any) => {
    setEditingVolume(volume);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this volume?")) return;

    const result = await deleteVolume(id);
    if (result.success) {
      await loadData();
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (data: CreateVolumeInput | UpdateVolumeInput) => {
    let result;
    if (editingVolume) {
      result = await updateVolume(editingVolume.id, data);
    } else {
      result = await createVolume(data as CreateVolumeInput);
    }

    if (result.success) {
      setIsModalOpen(false);
      await loadData();
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gold text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">
            Volumes
          </h1>
          <p className="text-gray-300">
            Manage volumes within each category
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-primary-dark rounded-lg font-semibold hover:bg-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Volume
        </button>
      </div>

      {/* Volumes by Category */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/20">
          <FolderTree className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No categories found</p>
          <p className="text-gray-500 text-sm mt-2">
            Create categories first before adding volumes
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-4">
                <FolderTree className="w-6 h-6 text-gold" />
                <h2 className="text-2xl font-serif font-bold text-white">
                  {category.name}
                </h2>
                <span className="text-sm text-gray-400">
                  ({volumes[category.id]?.length || 0} volumes)
                </span>
              </div>

              {volumes[category.id]?.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-white/20">
                  <p className="text-gray-400">No volumes in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {volumes[category.id]?.map((volume) => (
                    <div
                      key={volume.id}
                      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:border-gold/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                            <BookOpen className="w-5 h-5 text-gold" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Volume {volume.volumeNumber}
                            </div>
                            <h3 className="text-lg font-serif font-bold text-white">
                              {volume.title}
                            </h3>
                            {volume.titleAmharic && (
                              <p className="text-sm text-gray-400 mt-1">
                                {volume.titleAmharic}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {volume.description && (
                        <p className="text-gray-300 text-sm mb-4">
                          {volume.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="text-sm text-gray-400">
                          <span className="font-medium text-white">
                            {volume._count?.lessons || 0}
                          </span>{" "}
                          lessons
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(volume)}
                            className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(volume.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVolume ? "Edit Volume" : "Create Volume"}
      >
        <VolumeForm
          volume={editingVolume}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </div>
  );
}

import { Sparkles, Loader2 } from "lucide-react";

function VolumeForm({
  volume,
  categories,
  onSubmit,
  onCancel,
}: {
  volume?: any;
  categories: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: volume?.title || "",
    titleAmharic: volume?.titleAmharic || "",
    titleGeez: volume?.titleGeez || "",
    description: volume?.description || "",
    descriptionAmharic: volume?.descriptionAmharic || "",
    descriptionGeez: volume?.descriptionGeez || "",
    volumeNumber: volume?.volumeNumber || 1,
    categoryId: volume?.categoryId || categories[0]?.id || "",
  });

  const [isTranslatingTitle, setIsTranslatingTitle] = useState(false);
  const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "volumeNumber" ? parseInt(value) || 1 : value,
    }));
  };

  const handleTranslate = async (field: "title" | "description") => {
    const textToTranslate = field === "title" ? formData.title : formData.description;
    if (!textToTranslate) return;

    if (field === "title") setIsTranslatingTitle(true);
    else setIsTranslatingDesc(true);

    try {
      const { translateToGeezAction } = await import("@/actions/translate");
      const result = await translateToGeezAction(textToTranslate);
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          [field === "title" ? "titleGeez" : "descriptionGeez"]: result.data
        }));
      } else {
        alert(result.error || "Translation failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during translation");
    } finally {
      if (field === "title") setIsTranslatingTitle(false);
      else setIsTranslatingDesc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold/50"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-primary-dark">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Volume Number *
          </label>
          <input
            type="number"
            name="volumeNumber"
            value={formData.volumeNumber}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title (English) *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
            placeholder="e.g., Genesis"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title (Amharic)
          </label>
          <input
            type="text"
            name="titleAmharic"
            value={formData.titleAmharic}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 font-amharic"
            placeholder="ዘፍጥረት"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
          <span>Title (Geez)</span>
          <button
            type="button"
            onClick={() => handleTranslate("title")}
            disabled={isTranslatingTitle || !formData.title}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-gold/10 text-gold border border-gold/30 rounded-md hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isTranslatingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Auto-translate
          </button>
        </label>
        <input
          type="text"
          name="titleGeez"
          value={formData.titleGeez}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 font-geez"
          placeholder="ዘፍጥረት"
        />
      </div>

      <div className="h-px bg-white/5 my-2" />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description (English)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          placeholder="Brief description of the volume"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description (Amharic)
        </label>
        <textarea
          name="descriptionAmharic"
          value={formData.descriptionAmharic}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 font-amharic"
          placeholder="የቅጽ መግለጫ"
        />
      </div>

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
          <span>Description (Geez)</span>
          <button
            type="button"
            onClick={() => handleTranslate("description")}
            disabled={isTranslatingDesc || !formData.description}
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-gold/10 text-gold border border-gold/30 rounded-md hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isTranslatingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Auto-translate
          </button>
        </label>
        <textarea
          name="descriptionGeez"
          value={formData.descriptionGeez}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 font-geez"
          placeholder="መግለጫ ዘበልሳነ ግዕዝ"
        />
      </div>

      <div className="flex items-center gap-3 pt-4 sticky bottom-0 bg-primary-dark/95 py-2">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gold text-primary-dark rounded-lg font-semibold hover:bg-gold/90 transition-colors"
        >
          {volume ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
