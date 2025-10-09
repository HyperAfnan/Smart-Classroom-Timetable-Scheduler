import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Save, X, Edit2 } from "lucide-react";
// import { User } from "@/entities/User";

export default function ContactInfoSection({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    secondary_email: user?.secondary_email || ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        phone: formData.phone,
        secondary_email: formData.secondary_email
      });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating contact info:', error);
      alert('Failed to update contact information. Please try again.');
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      phone: user?.phone || '',
      secondary_email: user?.secondary_email || ''
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Phone className="w-5 h-5 text-indigo-600" />
              Contact Information
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
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Primary Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Your primary email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50 pl-10" : "pl-10"}
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Secondary Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={formData.secondary_email}
                  onChange={(e) => setFormData({...formData, secondary_email: e.target.value})}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50 pl-10" : "pl-10"}
                  placeholder="alternate@email.com"
                  type="email"
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
