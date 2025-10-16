import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AuthSlider from "./authSlider";
import RegistrationForm from "./registrationpage";
import LoginForm from "./loginpage";

// import AuthSlider from "../components/auth/AuthSlider";
// import RegistrationForm from "../components/auth/RegistrationForm";
// import LoginForm from "../components/auth/LoginForm";

export default function Auth() {
  const [activeMode, setActiveMode] = useState("register"); // "register" or "login"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-background dark:via-background dark:to-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link to={"/"}>
            <Button
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/80 dark:bg-background/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/0 px-8 py-6 border-b border-slate-200/50 dark:border-white/10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Welcome to Calvio
              </h1>
              <p className="text-slate-600 dark:text-muted-foreground">
                Get started with intelligent university scheduling
              </p>
            </motion.div>
          </div>

          {/* Mode Slider */}
          <div className="p-8 pb-4">
            <AuthSlider activeMode={activeMode} setActiveMode={setActiveMode} />
          </div>

          {/* Forms */}
          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              {activeMode === "register" ? (
                <RegistrationForm key="register" />
              ) : (
                <LoginForm key="login" />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
