import { motion } from "framer-motion";
import { Loader2, Settings as SettingsIcon } from "lucide-react";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfoSection from "./components/PersonalInfoSection";
import ContactInfoSection from "./components/ContactInfoSection";
import SecuritySection from "./components/SecuritySection";
import useTeacherProfile from "../shared/hooks/useTeacherProfile.js";

export default function Settings() {
   const { isLoading } = useTeacherProfile();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Account Settings
            </h1>
          </div>
          <p className="text-gray-600">
            Manage your profile, contact information, and security preferences
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          <ProfileHeader />
          
          <div className="grid lg:grid-cols-2 gap-6">
            <PersonalInfoSection />
            <ContactInfoSection />
          </div>

          <SecuritySection />
        </div>
      </div>
    </div>
  );
}
