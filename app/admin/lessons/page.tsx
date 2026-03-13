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
  uploadFile,
  uploadMultipleImages,
  CreateLessonInput,
  UpdateLessonInput,
} from "@/actions";
import { FormModal } from "@/components/admin/FormModal";
import { Edit, Trash2, Plus, Video, Book, Eye, EyeOff, CheckCircle, ImagePlus, Loader2, Sparkles, X, Clock } from "lucide-react";
import Link from "next/link";

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
    if (result.success && result.data) {
      setCategories(result.data);
      if (result.data.length > 0) {
        setSelectedCategoryId(result.data[0].id);
      }
    }
    setLoading(false);
  };

  const loadVolumes = async (categoryId: string) => {
    const result = await getVolumesByCategory(categoryId);
    if (result.success && result.data) {
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
    if (result.success && result.data) {
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
          {volumes.length === 0 ? (
            <>
              <p className="text-gray-400 text-lg">No volumes found in this category</p>
              <p className="text-gray-500 text-sm mt-2">
                You must create a volume first before you can add lessons.
              </p>
              <Link 
                href="/admin/volumes"
                className="inline-flex items-center gap-2 mt-4 text-gold hover:underline"
              >
                Go to Volumes <Plus className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <p className="text-gray-400 text-lg">Select a volume to view lessons</p>
          )}
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
                    {lesson.type === "BOOK" ? (
                      <div className="bg-gold/10 p-1.5 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-gold" />
                      </div>
                    ) : lesson.published ? (
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
    titleGeez: lesson?.titleGeez || "",
    description: lesson?.description || "",
    descriptionAmharic: lesson?.descriptionAmharic || "",
    descriptionGeez: lesson?.descriptionGeez || "",
    type: lesson?.type || "VIDEO",
    youtubeUrl: lesson?.youtubeUrl || "",
    pdfUrl: lesson?.pdfUrl || "",
    content: lesson?.content || "",
    contentImages: lesson?.contentImages || [],
    thumbnailUrl: lesson?.thumbnailUrl || "",
    lessonNumber: lesson?.lessonNumber || 1,
    duration: lesson?.duration || 0,
    volumeId: lesson?.volumeId || volumeId,
    published: lesson?.published || false,
  });

  const [isTranslatingTitle, setIsTranslatingTitle] = useState(false);
  const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "pdfUrl" | "thumbnailUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (field === "pdfUrl") setIsUploading(true);
    else setIsUploadingThumbnail(true);

    try {
      const formUploadData = new FormData();
      formUploadData.append("file", file);
      formUploadData.append("type", field === "pdfUrl" ? "document" : "image");
      formUploadData.append("folder", field === "pdfUrl" ? "orthodox-learning-hub/documents" : "orthodox-learning-hub/lessons");

      const result = await uploadFile(formUploadData);
      if (result.success && result.data && 'url' in result.data) {
        setFormData(prev => ({ ...prev, [field]: result.data.url as string }));
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err) {
      alert("An error occurred during upload");
    } finally {
      if (field === "pdfUrl") setIsUploading(false);
      else setIsUploadingThumbnail(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsUploadingImages(true);
    try {
      const formUploadData = new FormData();
      files.forEach(file => formUploadData.append("files", file));
      formUploadData.append("folder", "orthodox-learning-hub/books");

      const result = await uploadMultipleImages(formUploadData);
      if (result.success && result.data) {
        const urls = result.data.map((r: any) => r.url);
        setFormData(prev => ({ 
          ...prev, 
          contentImages: [...(prev.contentImages || []), ...urls] 
        }));
      } else {
        alert(result.error || "Upload failed");
      }
    } catch (err) {
      alert("An error occurred during upload");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contentImages: (prev.contentImages || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Explicitly handle select element type changes to ensure state updates
    if (name === "type") {
      setFormData((prev) => ({ ...prev, type: value as "VIDEO" | "BOOK" }));
      return;
    }
    
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
    if (formData.type === "VIDEO" && !formData.youtubeUrl) {
      alert("YouTube URL is required for video lessons");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lesson Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-gold/50"
          >
            <option value="VIDEO" className="bg-primary-dark">Video Lesson</option>
            <option value="BOOK" className="bg-primary-dark">Book / Digital Content</option>
          </select>
        </div>

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

      {formData.type === "VIDEO" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail (Cover Image)
            </label>
            <div className="flex gap-4 items-center mb-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium text-sm border border-white/20">
                 {isUploadingThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                 {formData.thumbnailUrl ? "Change Thumbnail" : "Upload Thumbnail"}
                 <input
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={(e) => handleFileUpload(e, "thumbnailUrl")}
                   disabled={isUploadingThumbnail}
                 />
              </label>
              {formData.thumbnailUrl && (
                <div className="relative w-16 h-10 rounded border border-white/10 overflow-hidden">
                  <img src={formData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: "" }))}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl hover:bg-red-600"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              )}
            </div>
            {formData.type === "VIDEO" && !formData.thumbnailUrl && (
              <p className="text-[10px] text-gray-500">Auto-generation from YouTube is enabled if left blank.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDF / Document
            </label>
            <div className="flex gap-4 items-center mb-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium text-sm border border-white/20">
                 {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload PDF"}
                 <input
                   type="file"
                   accept="application/pdf"
                   className="hidden"
                   onChange={(e) => handleFileUpload(e, "pdfUrl")}
                   disabled={isUploading}
                 />
              </label>
              {formData.pdfUrl && (
                <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> PDF Ready</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Book Pages (Images for carousel)
            </label>
            <div className="flex gap-4 items-center mb-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium text-sm border border-white/20">
                 {isUploadingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Pages"}
                 <input
                   type="file"
                   multiple
                   accept="image/*"
                   className="hidden"
                   onChange={handleImagesUpload}
                   disabled={isUploadingImages}
                 />
              </label>
              {(formData.contentImages?.length || 0) > 0 && (
                <span className="text-sm text-gold flex items-center gap-1">
                  <Book className="w-4 h-4"/> {formData.contentImages?.length} Pages Uploaded
                </span>
              )}
            </div>

            {/* Image Preview Grid */}
            {(formData.contentImages?.length || 0) > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2 p-2 bg-black/20 rounded-lg max-h-40 overflow-y-auto">
                {formData.contentImages?.map((url: string, index: number) => (
                  <div key={index} className="relative group aspect-[3/4]">
                    <img src={url} alt={`Page ${index + 1}`} className="w-full h-full object-cover rounded shadow-sm" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                      P{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Book Text Content (Optional)
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 font-serif"
              placeholder="Full content of the book if not using images/PDF..."
            />
          </div>
        </div>
      )}

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
          placeholder="Brief description of the lesson"
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
          placeholder="የትምህርት መግለጫ"
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

      <div className="flex items-center gap-3 pt-4 sticky bottom-0 bg-primary-dark/95 py-2">
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
