import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import Showcase from '../components/Showcase';
import { Motivation } from '../components/Motivation';
import { Header } from '../components/Header';
import { SmartScreen } from '../components/SmartScreen';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 pt-16">
      <Header />

      <Hero />
      <FeatureGrid />
      <Showcase />
      <Motivation />
      <SmartScreen />
      <Footer />
    </main>
  );
}
