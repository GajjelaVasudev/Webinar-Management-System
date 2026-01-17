import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type Tier = {
  name: string;
  price: string;
  desc: string;
  highlight?: boolean;
};

const tiers: Tier[] = [
  {
    name: 'Basic Pass',
    price: '$39.00',
    desc: 'Browse events, register for a session, and access post-event recordings.',
  },
  {
    name: 'Standard Pass',
    price: '$39.00',
    desc: 'Priority registration, speaker Q&A access, and full recordings library.',
    highlight: true,
  },
  {
    name: 'Premium Pass',
    price: '$39.00',
    desc: 'Admin-friendly workshop access and extended on-demand resources.',
  },
];

export default function Tickets() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">Ticket Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.highlight
                  ? 'relative overflow-hidden rounded-3xl p-0 ring-1 ring-brand-hot/35'
                  : 'relative overflow-hidden rounded-3xl p-0'
              }
            >
              <div
                className={
                  tier.highlight
                    ? 'absolute inset-0 bg-gradient-to-br from-brand-hot/35 via-brand-secondary/25 to-brand-primary/25'
                    : 'absolute inset-0 bg-gradient-to-br from-brand-accent/25 via-brand-secondary/15 to-brand-primary/15'
                }
              />
              <div className="relative p-7">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold">{tier.name}</div>
                  {tier.highlight ? (
                    <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white ring-1 ring-white/15">
                      Popular
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 text-4xl font-extrabold tracking-tight">
                  {tier.price}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{tier.desc}</p>

                <div className="mt-7">
                  <Button
                    className="w-full"
                    variant={tier.highlight ? 'primary' : 'secondary'}
                    onClick={() => {
                      // Placeholder for future auth/checkout integration
                    }}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
