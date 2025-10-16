import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, ArrowRight } from "lucide-react";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    universityName: "",
    universityLocation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.universityName.trim() || !formData.universityLocation.trim()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    localStorage.setItem("universityData", JSON.stringify(formData));
    setIsSubmitting(false);
  };

  const isFormValid =
    formData.universityName.trim() && formData.universityLocation.trim();

  return (
    <motion.div
      initial={{ opacity: 0, x: -25 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 25 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Register Your University
        </h2>
        <p className="text-slate-600 dark:text-muted-foreground">
          Let's start by collecting some basic information about your institution
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* University Name */}
        <div className="space-y-2">
          <Label
            htmlFor="universityName"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            University Name *
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <Input
              id="universityName"
              type="text"
              placeholder="Enter your university name"
              value={formData.universityName}
              onChange={(e) => handleInputChange("universityName", e.target.value)}
              className="pl-12 py-3 text-base border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 
                         dark:bg-background dark:text-foreground dark:border-white/10 
                         dark:placeholder:text-slate-500 dark:focus:border-purple-500 dark:focus:ring-purple-500/30"
            />
          </div>
        </div>

        {/* University Location */}
        <div className="space-y-2">
          <Label
            htmlFor="universityLocation"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            University Location *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <Input
              id="universityLocation"
              type="text"
              placeholder="City, State/Province, Country"
              value={formData.universityLocation}
              onChange={(e) => handleInputChange("universityLocation", e.target.value)}
              className="pl-12 py-3 text-base border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 
                         dark:bg-background dark:text-foreground dark:border-white/10 
                         dark:placeholder:text-slate-500 dark:focus:border-purple-500 dark:focus:ring-purple-500/30"
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.div
          whileHover={{ scale: isFormValid ? 1.02 : 1 }}
          whileTap={{ scale: isFormValid ? 0.98 : 1 }}
          className="pt-4"
        >
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 
                       hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg 
                       font-semibold rounded-xl shadow-lg hover:shadow-xl 
                       transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                Continue Setup
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Terms */}
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          By registering, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
            Privacy Policy
          </span>
          .
        </p>
      </form>
    </motion.div>
  );
}
