import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Loader2, Check, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import useTeacherProfile from "../../shared/hooks/useTeacherProfile.js";
import useTeachers from "@/features/admin-role/teachers/hooks/useTeachers.js";
import useTeacherProfileMutations from "../../shared/hooks/useTeacherProfileMutations.js";

export default function ProfileHeader(user) {
  const { teachers } = useTeachers();
  const { uploadProfilePicAsync, uploadProfilePicStatus: isUploading } =
    useTeacherProfileMutations();
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      const file_url = e.target.files?.[0];
      await uploadProfilePicAsync(teachers.id, file_url);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    }
  };

  const getInitials = () => {
    if (!user?.full_name) return "T";
    return user?.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8 bg-gradient-to-br from-indigo-50 to-white border-none shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
              <AvatarImage
                src={user?.profile_picture_url}
                alt={user?.full_name}
              />
              <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <motion.button
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading.isPending}
              whileTap={{ scale: 0.95 }}
            >
              {isUploading.isPending ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : isUploading.isPending ? (
                <Check className="w-8 h-8 text-green-400" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </motion.button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {user?.full_name}
            </motion.h1>
            <motion.p
              className="text-lg text-indigo-600 font-medium mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {user?.position || "Teacher"}
            </motion.p>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {user?.email}
            </motion.p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading.isPending}
            className="gap-2"
          >
            {isUploading.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Change Photo
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
