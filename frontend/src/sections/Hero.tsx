import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { IconPlay, IconSparkle } from '../components/ui/Icon';

export default function Hero() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="container mx-auto text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Welcome to PFSD</h1>
        <p className="text-xl mb-8">Your event management platform</p>
      </div>
    </section>
  );
}
