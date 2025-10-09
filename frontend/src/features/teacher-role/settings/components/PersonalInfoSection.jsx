import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Briefcase, Building2, Save, X, Edit2 } from "lucide-react";
// import { User } from "@/entities/User";

export default function PersonalInfoSection({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    position: user?.position || '',
    department: user?.department || '',
    bio: user?.bio || ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        position: formData.position,
        department: formData.department,
        bio: formData.bio
      });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert('Failed to update information. Please try again.');
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      position: user?.position || '',
      department: user?.department || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              Personal Information
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Full Name</Label>
                <Input
                  value={formData.full_name}
                  disabled
                  className="bg-gray-50"
                  icon={<UserIcon className="w-4 h-4 text-gray-400" />}
                />
                <p className="text-xs text-gray-500">Contact support to change your name</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Position / Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50 pl-10" : "pl-10"}
                    placeholder="e.g., Senior Mathematics Teacher"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">Department</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50 pl-10" : "pl-10"}
                    placeholder="e.g., Mathematics & Science"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-gray-700 font-medium">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>

            {isEditing && (
              <motion.div 
                className="flex justify-end gap-3 pt-4 border-t"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                      </motion.div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
