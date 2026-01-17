import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

export default function Testimonials() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">What People Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-brand-primary/35 via-brand-secondary/25 to-brand-accent/25 ring-1 ring-white/15" />
            <div className="mt-4 text-sm font-extrabold">Thomas</div>
            <div className="mt-2 flex items-center justify-center gap-1 text-brand-hot">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-base">
                  ★
                </span>
              ))}
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              “PS24 made it effortless to manage registrations and publish recordings. The premium interface helped our team deliver a conference-level experience online.”
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
