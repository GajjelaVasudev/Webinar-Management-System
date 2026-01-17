import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { IconPlay } from '../components/ui/Icon';

export default function About() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">About Us</h2>
        <p className="text-lg">Learn more about our platform and mission.</p>
      </div>
    </section>
  );
}
