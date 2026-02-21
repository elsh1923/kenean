"use client";

import { useState, useTransition } from "react";
import { updateMyProfile, uploadFile } from "@/actions";
import { ImageCropper } from "./ImageCropper";
import { Loader2, Save, CheckCircle2, AlertCircle, LogOut, User, Camera, Trash2 } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageContext";

interface ProfileClientProps {
  initialName: string;
  userEmail: string;
  initialImage: string | null;
}

export function ProfileClient({ initialName, userEmail, initialImage }: ProfileClientProps) {
  const { dict } = useLanguage();
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState<string | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
   const [isPending, startTransition] = useTransition();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const result = await updateMyProfile({ name, image });
      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || (dict as any).common.error);
      }
    });
  };

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setSelectedImage(null);
    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", croppedBlob, "profile.jpg");
      formData.append("type", "image");
      formData.append("folder", "canaan/profiles");

      const result = await uploadFile(formData);
      if (result.success) {
        setImage(result.data.url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || (dict as any).common.error);
      }
    } catch (err) {
      setError((dict as any).common.error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Profile Photo Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <Camera className="w-5 h-5 text-accent" />
          {(dict as any).profile.changePhoto || "Profile Photo"}
        </h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={name || "Avatar"}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-accent/30 transition-all group-hover:ring-accent/50"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold ring-4 ring-accent/30">
                {name?.charAt(0).toUpperCase() || userEmail.charAt(0).toUpperCase()}
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all font-medium text-sm">
                <Camera className="w-4 h-4" />
                {isUploading ? (dict as any).profile.uploading : (dict as any).profile.changePhoto}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading || isPending}
                />
              </label>
              
              {image && (
                <button
                  onClick={handleRemoveImage}
                  disabled={isUploading || isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-red-500 hover:text-white transition-all font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {(dict as any).profile.removePhoto || "Remove"}
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              JPEG, PNG or WebP. Max 10MB.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          {(dict as any).profile.editProfile}
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm font-sans">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600 text-sm font-sans">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {(dict as any).profile.success}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-widest font-sans" htmlFor="profile-name">
              {(dict as any).profile.fullName}
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-sans"
              placeholder={(dict as any).auth.namePlaceholder}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-primary uppercase tracking-widest font-sans">
              {(dict as any).auth.email}
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed opacity-70 font-sans"
            />
            <p className="text-xs text-muted-foreground font-sans">{(dict as any).profile.emailCannotChange}</p>
          </div>

          <button
            type="submit"
            disabled={isPending || (name === initialName && image === initialImage)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {(dict as any).profile.updateProfile}
          </button>
        </form>
      </div>

      {/* Sign Out */}
      <div className="bg-card border border-red-500/20 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-2">{(dict as any).profile.signOut}</h3>
        <p className="text-muted-foreground text-sm mb-4 font-sans">
          {(dict as any).profile.signOutConfirm}
        </p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          {(dict as any).profile.signOut}
        </button>
       </div>

      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setSelectedImage(null)}
          aspect={1}
        />
      )}
    </div>
  );
}
