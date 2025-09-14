import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Setup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link to={"Auth"}>
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 p-2">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-2xl p-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
              University Setup
            </h1>
            <p className="text-slate-600 text-lg">
              This is where we'll collect information about departments and other details.
            </p>
            <p className="text-slate-500 mt-4">
              (Coming soon - will be implemented in the next step)
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}