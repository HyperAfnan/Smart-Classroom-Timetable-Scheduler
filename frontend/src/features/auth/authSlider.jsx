import React from "react";
import { motion } from "framer-motion";
import { Building2, LogIn } from "lucide-react";

export default function AuthSlider({ activeMode, setActiveMode }) {
  return (
    <div className="relative bg-slate-100 dark:bg-[#12121a] rounded-2xl p-2 mb-8">
      {/* Sliding Background */}
      <motion.div
        className="absolute top-2 bottom-2 bg-white dark:bg-[#1e1e29] rounded-xl shadow-lg border border-slate-200/50 dark:border-[#2a2a36]"
        animate={{
          left: activeMode === "register" ? "0.5rem" : "50%",
          right: activeMode === "register" ? "50%" : "0.5rem",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Options */}
      <div className="relative grid grid-cols-2 gap-2">
        <motion.button
          onClick={() => setActiveMode("register")}
          className={`relative z-10 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-colors duration-300 ${
            activeMode === "register"
              ? "text-purple-700 dark:text-[#a78bfa]"
              : "text-slate-600 hover:text-slate-800 dark:text-[#c0c0c9] dark:hover:text-[#f4f4f5]"
          }`}
          whileHover={{ scale: activeMode !== "register" ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Building2 className="w-5 h-5" />
          Register as University
        </motion.button>

        <motion.button
          onClick={() => setActiveMode("login")}
          className={`relative z-10 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-colors duration-300 ${
            activeMode === "login"
              ? "text-purple-700 dark:text-[#a78bfa]"
              : "text-slate-600 hover:text-slate-800 dark:text-[#c0c0c9] dark:hover:text-[#f4f4f5]"
          }`}
          whileHover={{ scale: activeMode !== "login" ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogIn className="w-5 h-5" />
          Login
        </motion.button>
      </div>
    </div>
  );
}
