import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8"
          >
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Smart Timetable
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Scheduling
            </span>
            <br />
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-600 dark:text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto"
          >
            Revolutionize university scheduling with our intelligent system,
            powered by advanced genetic algorithms. Fully compliant with NEP
            2020 guidelines, we create perfect schedules in minutes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to={"auth"}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/5 px-8 py-4 rounded-xl font-semibold text-lg"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-lg mx-auto"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-gray-950/70 dark:to-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                95%
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Scheduling Efficiency
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-950/70 dark:to-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                80%
              </h3>
              <p className="text-slate-600 dark:text-slate-300">Time Saved</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Illustration */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="mt-20 relative"
        >
          <div className="bg-white/60 dark:bg-gray-950/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-gray-800 shadow-2xl overflow-hidden max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/0 px-6 py-4 border-b border-slate-200/50 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  University Timetable Dashboard
                </span>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-950/80 dark:to-gray-900/60 rounded-2xl p-6 border border-purple-200/50 dark:border-gray-800">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">
                    Computer Science
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    45 courses scheduled
                  </p>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-purple-200/30 dark:border-gray-800">
                      <p className="text-xs font-medium text-purple-700 dark:text-gray-200">
                        CS101 - Intro to Programming
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mon 9:00 AM - Room A101
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-purple-200/30 dark:border-gray-800">
                      <p className="text-xs font-medium text-purple-700 dark:text-gray-200">
                        CS201 - Data Structures
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tue 11:00 AM - Room B205
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950/80 dark:to-gray-900/60 rounded-2xl p-6 border border-blue-200/50 dark:border-gray-800">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">
                    Mathematics
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    32 courses scheduled
                  </p>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-blue-200/30 dark:border-gray-800">
                      <p className="text-xs font-medium text-blue-700 dark:text-gray-200">
                        MATH101 - Calculus I
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Wed 10:00 AM - Room C301
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-blue-200/30 dark:border-gray-800">
                      <p className="text-xs font-medium text-blue-700 dark:text-gray-200">
                        MATH201 - Linear Algebra
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Thu 2:00 PM - Room D402
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-950/80 dark:to-gray-900/60 rounded-2xl p-6 border border-indigo-200/50 dark:border-gray-800">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">
                    Physics
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    28 courses scheduled
                  </p>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-indigo-200/30 dark:border-gray-800">
                      <p className="text-xs font-medium text-indigo-700 dark:text-gray-200">
                        PHY101 - Mechanics
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Fri 9:00 AM - Room E101
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-indigo-200/30 dark:border-gray-800">
                      <p className="text-xs font-medium text-indigo-700 dark:text-gray-200">
                        PHY201 - Electromagnetism
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mon 3:00 PM - Room F201
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
