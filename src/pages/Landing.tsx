import { Header } from '../components/layout/Header';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';

export const LandingPage = () => (
  <div className="min-h-screen">
    <Header />
    <Hero />
    <Features />
  </div>
);