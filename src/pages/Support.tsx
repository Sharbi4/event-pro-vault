import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Wallet, 
  User, 
  List,
  Clock,
  Shield,
  ArrowRight,
  X
} from 'lucide-react';

const helpTopics = [
  { icon: Calendar, label: 'Booking a package', anchor: 'booking-packages' },
  { icon: MapPin, label: 'Reserving a market spot', anchor: 'markets' },
  { icon: X, label: 'Cancellations & changes', anchor: 'cancellations-refunds' },
  { icon: CreditCard, label: 'Payments & fees', anchor: 'paying-fees' },
  { icon: Wallet, label: 'Payouts (Stripe)', anchor: 'event-pros' },
  { icon: User, label: 'Account & login', anchor: 'account-profile' },
  { icon: List, label: 'Listings & availability', anchor: 'event-pros' },
];

export default function Support() {
  const [chatModalOpen, setChatModalOpen] = useState(false);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Support
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Get help fast—bookings, listings, payouts, or account questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="darkShine" 
                size="lg" 
                className="gap-2"
                onClick={() => setChatModalOpen(true)}
              >
                <MessageCircle className="w-5 h-5" />
                Chat now
              </Button>
              <Link to="/faq">
                <Button variant="outline" size="lg">
                  Browse FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Email Card */}
            <Card variant="glass" className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email support</h3>
                <a 
                  href="mailto:support@vendibook.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors block mb-4"
                >
                  support@vendibook.com
                </a>
                <a href="mailto:support@vendibook.com">
                  <Button variant="outline" className="w-full">
                    Email support
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card variant="glass" className="border-border/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Call support</h3>
                <a 
                  href="tel:18778836342" 
                  className="text-lg font-medium text-foreground block"
                >
                  1-877-883-6342
                </a>
                <p className="text-sm text-muted-foreground mb-4">(1-877-8-VENDI-2)</p>
                <a href="tel:18778836342">
                  <Button variant="outline" className="w-full">
                    Call now
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Response time note */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>We respond as quickly as possible. For urgent booking issues, include your booking ID.</span>
          </div>
        </div>
      </section>

      {/* What do you need help with? */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground text-center mb-8">
            What do you need help with?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {helpTopics.map((topic) => (
              <Link 
                key={topic.label}
                to={`/faq#${topic.anchor}`}
                className="group"
              >
                <Card className="h-full border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <topic.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{topic.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Speed up support */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-6">
              Speed up support
            </h2>
            <Card variant="glass" className="border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  Include any of the following (if you have it) to help us resolve your issue faster:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-foreground"><strong>Booking ID</strong> (best)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-foreground">Package or market link</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-foreground">Event date/time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-foreground">Email on the account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span className="text-foreground">Screenshots (if something looks wrong)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety strip */}
      <section className="py-8 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span>
              <strong className="text-foreground">Payments & payouts</strong> — Online payments are processed through Stripe. We never store your card or bank details.
            </span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-6">
            Want the fastest answers?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/faq">
              <Button variant="darkShine" size="lg">
                Browse FAQs
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg">
                Create free profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Chat Coming Soon Modal */}
      <Dialog open={chatModalOpen} onOpenChange={setChatModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Chat is coming soon
            </DialogTitle>
            <DialogDescription>
              We'll be adding live chat shortly. For now, email or call support.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a href="mailto:support@vendibook.com" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Mail className="w-4 h-4" />
                Email support
              </Button>
            </a>
            <a href="tel:18778836342" className="flex-1">
              <Button variant="darkShine" className="w-full gap-2">
                <Phone className="w-4 h-4" />
                Call now
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Zendesk chat integration will be added later.
          </p>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
