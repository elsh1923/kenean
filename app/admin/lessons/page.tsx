"use client";

import { useState, useEffect } from "react";
import {
  getCategories,
  getVolumesByCategory,
  getLessonsByVolumeAdmin,
  createLesson,
  updateLesson,
  deleteLesson,
  toggleLessonPublished,
  CreateLessonInput,
  UpdateLessonInput,
} from "@/actions";
import { FormModal } from "@/components/admin/FormModal";
import { Edit, Trash2, Plus, Video, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function LessonsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedVolumeId, setSelectedVolumeId] = useState<string>("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadVolumes(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedVolumeId) {
      loadLessons(selectedVolumeId);
    } else {
      setLessons([]);
    }
  }, [selectedVolumeId]);

  const loadCategories = async () => {
    setLoading(true);
    const result = await getCategories();
    if (result.success) {
      setCategories(result.data);
      if (result.data.length > 0) {
        setSelectedCategoryId(result.data[0].id);
      }
    }
    setLoading(false);
  };

  const loadVolumes = async (categoryId: string) => {
    const result = await getVolumesByCategory(categoryId);
    if (result.success) {
      setVolumes(result.data);
      if (result.data.length > 0) {
        setSelectedVolumeId(result.data[0].id);
      } else {
        setSelectedVolumeId("");
      }
    }
  };

  const loadLessons = async (volumeId: string) => {
    const result = await getLessonsByVolumeAdmin(volumeId);
    if (result.success) {
      setLessons(result.data);
    }
  };

  const handleCreate = () => {
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const result = await deleteLesson(id);
    if (result.success) {
      if (selectedVolumeId) {
        await loadLessons(selectedVolumeId);
      }
    } else {
      alert(result.error);
    }
  };

  const handleTogglePublish = async (id: string) => {
    const result = await toggleLessonPublished(id);
    if (result.success) {
      if (selectedVolumeId) {
        await loadLessons(selectedVolumeId);
      }
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (data: CreateLessonInput | UpdateLessonInput) => {
    let result;
    if (editingLesson) {
      result = await updateLesson(editingLesson.id, data);
    } else {
      result = await createLesson(data as CreateLessonInput);
    }

    if (result.success) {
      setIsModalOpen(false);
      if (selectedVolumeId) {
        await loadLessons(selectedVolumeId);
      }
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
            Lessons
          </h1>
          <p className="text-gray-300">
            Manage video lessons for each volume
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={!selectedVolumeId}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-primary-dark rounded-lg font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Lesson
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
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
            Volume
          </label>
          <select
            value={selectedVolumeId}
            onChange={(e) => setSelectedVolumeId(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold/50"
            disabled={volumes.length === 0}
          >
            {volumes.length === 0 ? (
              <option className="bg-primary-dark">No volumes available</option>
            ) : (
              volumes.map((vol) => (
                <option key={vol.id} value={vol.id} className="bg-primary-dark">
                  Volume {vol.volumeNumber}: {vol.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Lessons List */}
      {!selectedVolumeId ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/20">
          <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Select a volume to view lessons</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/20">
          <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No lessons in this volume</p>
          <p className="text-gray-500 text-sm mt-2">
            Create your first lesson to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:border-gold/50 transition-all duration-300"
            >
              {/* Thumbnail */}
              {lesson.thumbnailUrl && (
                <div className="aspect-video bg-black/50">
                  <img
                    src={lesson.thumbnailUrl}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">
                      Lesson {lesson.lessonNumber}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white">
                      {lesson.title}
                    </h3>
                    {lesson.titleAmharic && (
                      <p className="text-sm text-gray-400 mt-1">
                        {lesson.titleAmharic}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {lesson.published ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {lesson.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                {lesson.duration && (
                  <div className="text-sm text-gray-400 mb-4">
                    Duration: {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleTogglePublish(lesson.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                      lesson.published
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                    }`}
                  >
                    {lesson.published ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Draft
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
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

      {/* Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLesson ? "Edit Lesson" : "Create Lesson"}
        size="lg"
      >
        <LessonForm
          lesson={editingLesson}
          volumeId={selectedVolumeId}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </FormModal>
    </div>
  );
}

function LessonForm({
  lesson,
  volumeId,
  onSubmit,
  onCancel,
}: {
  lesson?: any;
  volumeId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: lesson?.title || "",
    titleAmharic: lesson?.titleAmharic || "",
    description: lesson?.description || "",
    youtubeUrl: lesson?.youtubeUrl || "",
    lessonNumber: lesson?.lessonNumber || 1,
    duration: lesson?.duration || 0,
    volumeId: lesson?.volumeId || volumeId,
    published: lesson?.published || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : ["lessonNumber", "duration"].includes(name)
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lesson Number *
          </label>
          <input
            type="number"
            name="lessonNumber"
            value={formData.lessonNumber}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duration (seconds)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          placeholder="e.g., Introduction to Genesis"
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
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          YouTube URL *
        </label>
        <input
          type="url"
          name="youtubeUrl"
          value={formData.youtubeUrl}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Full YouTube video URL (thumbnail will be extracted automatically)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
          placeholder="Brief description of the lesson"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          name="published"
          checked={formData.published}
          onChange={handleChange}
          className="w-4 h-4 rounded border-white/20 bg-white/10 text-gold focus:ring-gold"
        />
        <label htmlFor="published" className="text-sm text-gray-300">
          Publish immediately
        </label>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gold text-primary-dark rounded-lg font-semibold hover:bg-gold/90 transition-colors"
        >
          {lesson ? "Update" : "Create"}
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
