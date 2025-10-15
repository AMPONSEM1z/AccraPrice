"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AvatarUploadProps = {
  userId: string;
  currentAvatar?: string | null;
};

export default function AvatarUpload({
  userId,
  currentAvatar,
}: AvatarUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>(
    currentAvatar || "/avatar-placeholder.png"
  );
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAvatarUrl(URL.createObjectURL(selectedFile)); // show preview immediately
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;

    setUploading(true);
    setProgress(0);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `avatars/${userId}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setFile(null);
      alert("✅ Avatar uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed — check console for details.");
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 border">
          <Image
            src={avatarUrl}
            alt="Avatar"
            fill
            className="object-cover"
            sizes="80px"
            priority
          />
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {file ? "Change File" : "Choose File"}
          </Button>
        </div>
      </div>

      {file && (
        <div className="flex gap-2 items-center">
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload & Save"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setFile(null)}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      )}

      {progress !== null && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
