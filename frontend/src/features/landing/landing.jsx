import Header from "./header";
import Hero from "./hero";
import Features from "./features";
import Footer from "./footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:bg-black dark:bg-none">
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
