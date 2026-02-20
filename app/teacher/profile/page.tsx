"use client";

import { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile } from "@/actions";
import { User, Mail, Shield, Calendar, Loader2, CheckCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";

export default function TeacherProfilePage() {
  const { dict } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getMyProfile();
    if (result.success && result.data) {
      setProfile(result.data);
      setName(result.data.name || "");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: "", text: "" });

    const result = await updateMyProfile({ name });
    if (result.success) {
      setMessage({ type: "success", text: (dict as any).profile.success });
      setProfile({ ...profile, name });
    } else {
      setMessage({ type: "error", text: result.error || (dict as any).common.error });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-4xl font-serif font-bold text-gold mb-2">{(dict as any).profile.title}</h1>
        <p className="text-gray-300">{(dict as any).teacher.teacherInfo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 border-2 border-gold/30">
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="w-full h-full rounded-full" />
              ) : (
                <User className="w-12 h-12 text-gold" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{profile.name || (dict as any).profile.unnamedUser}</h2>
            <p className="text-gray-400 text-sm mb-4">{profile.email}</p>
            <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-bold uppercase tracking-wider">
              {profile.role}
            </span>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <Shield className="w-5 h-5 text-gold" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">{(dict as any).profile.editProfile}</p>
                <p className="text-sm font-medium">{(dict as any).teacher.teacherRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-5 h-5 text-gold" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">{(dict as any).teacher.joinedLabel}</p>
                <p className="text-sm font-medium">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <CheckCircle className="w-5 h-5 text-gold" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">{(dict as any).teacher.answersLabel}</p>
                <p className="text-sm font-medium">{profile._count.answers} {(dict as any).teacher.answersProvided}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-8">
            <h3 className="text-2xl font-serif font-bold text-gold mb-6">{(dict as any).teacher.accountSettings}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {message.text && (
                <div className={`p-4 rounded-lg text-sm font-medium ${
                  message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{(dict as any).profile.fullName}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold/50"
                  placeholder={(dict as any).auth.namePlaceholder}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{(dict as any).auth.email}</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-500">
                  <Mail className="w-5 h-5" />
                  <span>{profile.email}</span>
                </div>
                <p className="text-[10px] text-gray-500 italic">{(dict as any).profile.emailCannotChange}</p>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-gold text-primary-dark rounded-lg font-bold hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {(dict as any).profile.saving}
                  </>
                ) : (
                  (dict as any).common.save
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
