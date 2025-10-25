import { CallToAction } from "@/components/CallToAction";
import { FeatureMatrix } from "@/components/FeatureMatrix";
import { Footer } from "@/components/Footer";
import { GridBackground } from "@/components/GridBackground";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { IntegrityPanel } from "@/components/IntegrityPanel";
import { ProcessTimeline } from "@/components/ProcessTimeline";

export default function Home() {
  return (
    <GridBackground>
      <Header />
      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-28 px-6 py-16">
  <Hero />
  <ProcessTimeline />
  <FeatureMatrix />
        <IntegrityPanel />
        <CallToAction />
      </main>
      <Footer />
    </GridBackground>
  );
}
