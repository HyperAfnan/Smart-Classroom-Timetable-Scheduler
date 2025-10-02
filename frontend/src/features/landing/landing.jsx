import React from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "./header";
import Hero from "./hero";
import Features from "./features";
import Footer from "./footer";

// import Header from "../components/landing/Header";
// import Hero from "../components/landing/Hero";
// import Features from "../components/landing/Features";
// import Footer from "../components/landing/Footer";

export default function Landing() {
  const handleGetStarted = () => {
    // This is a dummy function now, the navigation is handled by the Link component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <Header onSignUp={handleGetStarted} />
      <Hero onGetStarted={handleGetStarted} />
      <Features />
      <Footer />
    </div>
  );
}
