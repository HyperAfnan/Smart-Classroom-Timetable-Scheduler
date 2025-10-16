import React from "react";
import { Calendar, Clock, Users, BookOpen, Zap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Genetic Algorithm Engine",
    description:
      "Harness the power of advanced genetic algorithms to create conflict-free, optimized timetables in minutes, not days.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: BookOpen,
    title: "NEP 2020 Compliant",
    description:
      "Built from the ground up to support the National Education Policy, enabling flexible curriculum structures and credit systems.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description:
      "Instant notifications for schedule changes, ensuring everyone stays informed about timetable modifications.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Multi-User Access",
    description:
      "Role-based access control for administrators, faculty, and students with customized dashboard views.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Calendar,
    title: "Resource Management",
    description:
      "Comprehensive tracking of classrooms, equipment, and faculty availability for optimal resource allocation.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Detailed insights on scheduling efficiency, room utilization, and faculty workload distribution.",
    color: "from-amber-500 to-amber-600",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 px-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-background dark:to-background"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Everything You Need for
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Perfect Scheduling
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive suite of tools makes university timetable
            management effortless, intelligent, and incredibly efficient.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-200/50 hover:border-slate-300/50 shadow-sm hover:shadow-xl transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/10">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32"
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </h3>
            <p className="text-lg text-slate-600 dark:text-muted-foreground max-w-2xl mx-auto">
              Get your perfect timetable in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Import Your Data",
                description:
                  "Upload course information, faculty details, and room availability through our intuitive interface.",
              },
              {
                step: "02",
                title: "Configure Preferences",
                description:
                  "Set scheduling rules, time preferences, and constraints specific to your institution's needs.",
              },
              {
                step: "03",
                title: "Generate & Optimize",
                description:
                  "Our AI creates optimized timetables instantly, resolving conflicts and maximizing efficiency.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-500/20 dark:to-blue-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-white/10 shadow-lg">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {step.step}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
