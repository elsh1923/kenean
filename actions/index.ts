// Categories
export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories";
export type { CreateCategoryInput, UpdateCategoryInput } from "./categories";

// Volumes
export {
  getVolumesByCategory,
  getVolume,
  getVolumeAdmin,
  createVolume,
  updateVolume,
  deleteVolume,
} from "./volumes";
export type { CreateVolumeInput, UpdateVolumeInput } from "./volumes";

// Lessons
export {
  getPublishedLessons,
  getLessonsByVolume,
  getLessonsByVolumeAdmin,
  getLesson,
  getLessonAdmin,
  createLesson,
  updateLesson,
  toggleLessonPublished,
  deleteLesson,
} from "./lessons";
export type { CreateLessonInput, UpdateLessonInput } from "./lessons";

// Questions
export {
  getAnsweredQuestions,
  getAllQuestions,
  getPendingQuestionsCount,
  getQuestion,
  submitQuestion,
  claimQuestion,
  unclaimQuestion,
  markQuestionDiscussing,
  deleteQuestion,
  getMyQuestions,
} from "./questions";
export type { SubmitQuestionInput } from "./questions";

// Answers
export {
  submitAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswerByQuestion,
  addAttachmentToAnswer,
  removeAttachmentFromAnswer,
} from "./answers";
export type { SubmitAnswerInput, UpdateAnswerInput } from "./answers";

// Discussions
export {
  getDiscussions,
  addDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getDiscussionsCount,
} from "./discussions";
export type { AddDiscussionInput } from "./discussions";

// Uploads
export {
  uploadFile,
  removeFile,
  uploadMultipleImages,
} from "./uploads";

// Users
export {
  getAllUsers,
  getUserById,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUser,
  getAdminStats,
  getMyProfile,
  updateMyProfile,
} from "./users";
