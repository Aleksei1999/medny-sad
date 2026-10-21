import { About } from '@/components/About';
import { FlightHero } from '@/components/FlightHero';
import { Header } from '@/components/Header';
import { SmoothScroll } from '@/components/SmoothScroll';

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <SmoothScroll />
      <Header />
      <FlightHero />
      <About />
    </main>
  );
}
