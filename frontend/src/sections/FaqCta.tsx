import * as React from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: 'How do I register for a webinar?',
    a: 'Choose a ticket option, then register. Your registration will appear in your dashboard once backend auth is connected.',
  },
  {
    q: 'Can admins manage registrations?',
    a: 'Yes. Admins can review registrations per event and manage attendee participation from the admin tools.',
  },
  {
    q: 'Where do recordings appear?',
    a: 'After the session ends, admins can publish recordings and users can watch them on-demand.',
  },
  {
    q: 'Do events support multiple sessions?',
    a: 'PS24 is structured to support multiple workshops per event and map speakers to sessions.',
  },
];

export default function FaqCta() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section className="py-16 px-4 bg-blue-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">FAQ & Call to Action</h2>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-start">
          <div>
            <Badge tone="cool" className="tracking-[0.18em] uppercase">
              Ready to Get Started
            </Badge>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Start your next webinar
              <span className="block text-white/80">with PS24</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
              Join upcoming sessions, receive reminders, and access recordings after each live event.
            </p>

            <div className="mt-6">
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    className="h-12 w-full bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <Button size="lg" className="h-12 px-6">
                    →
                  </Button>
                </div>
              </Card>
              <div className="mt-4 flex items-center gap-3 text-white/60">
                <span className="text-xs">Follow:</span>
                <span className="text-xs">f</span>
                <span className="text-xs">x</span>
                <span className="text-xs">in</span>
              </div>
            </div>
          </div>

          <div>
            <Badge tone="neutral" className="tracking-[0.18em] uppercase">
              Frequently Asked Question
            </Badge>

            <div className="mt-6 grid gap-4">
              {faqs.map((item, idx) => {
                const isOpen = open === idx;
                return (
                  <Card key={item.q} className="p-5">
                    <button
                      className="flex w-full items-center justify-between gap-4 text-left"
                      onClick={() => setOpen(isOpen ? null : idx)}
                      type="button"
                    >
                      <div className="text-sm font-extrabold">{item.q}</div>
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
                        <span className="text-lg leading-none text-white/80">
                          {isOpen ? '–' : '+'}
                        </span>
                      </div>
                    </button>

                    {isOpen ? (
                      <p className="mt-3 text-sm leading-relaxed text-white/70">{item.a}</p>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
