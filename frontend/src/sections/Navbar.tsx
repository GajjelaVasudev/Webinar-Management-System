import Button from '../components/ui/Button';
import Logo from '../components/Logo';

const navItems: Array<{ label: string; href: string }> = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Events', href: '#schedule' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Contact', href: '#faq' },
];

export default function Navbar() {
  return (
    <nav className="bg-bg border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold">PFSD Project</h1>
      </div>
    </nav>
  );
}
