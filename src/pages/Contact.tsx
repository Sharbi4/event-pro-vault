import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Send,
  CheckCircle,
  HelpCircle,
  Clock,
  MapPin,
  Shield,
  Zap,
  Copy,
  Check,
  Instagram,
  Linkedin,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { generatePageSEO } from '@/lib/seoConfig';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email').max(255, 'Email must be less than 255 characters'),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Contact() {
  const seo = generatePageSEO('contact');
  
  useSEO({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    type: 'website',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      });

      if (error) {
        console.error('Error sending contact form:', error);
        toast.error('Failed to send message. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Message sent! We\'ll get back to you soon.');
    } catch (err) {
      console.error('Error sending contact form:', err);
      toast.error('Failed to send message. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Message Sent!
              </h1>
              <p className="text-muted-foreground mb-8">
                Thanks for reaching out. We typically respond within 24 hours during business days.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/">
                  <Button variant="darkShine">Back to Home</Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline">Browse FAQs</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

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
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[{ label: 'Contact' }]} 
            className="mb-6"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a question or need help? We're here for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid lg:grid-cols-5 gap-8 lg:gap-12"
            >
              {/* Contact Form */}
              <motion.div variants={itemVariants} className="lg:col-span-3">
                <Card variant="glass" className="border-border/50">
                  <CardContent className="p-6 lg:p-8">
                    <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                      Send us a message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? 'border-destructive' : ''}
                          />
                          {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={handleChange}
                          className={errors.subject ? 'border-destructive' : ''}
                        />
                        {errors.subject && (
                          <p className="text-xs text-destructive">{errors.subject}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your question or issue..."
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className={errors.message ? 'border-destructive' : ''}
                        />
                        {errors.message && (
                          <p className="text-xs text-destructive">{errors.message}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        variant="darkShine" 
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Info Sidebar */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
                {/* Trust strip */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                    <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg reply</p>
                    <p className="text-xs font-semibold text-foreground">&lt; 2 hrs</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                    <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</p>
                    <p className="text-xs font-semibold text-foreground">24 / 7</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                    <Shield className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Secure</p>
                    <p className="text-xs font-semibold text-foreground">Encrypted</p>
                  </div>
                </div>

                {/* Phone — primary */}
                <Card variant="glass" className="border-border/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-primary to-accent" />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">Call us</h3>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                            24/7 LIVE
                          </span>
                        </div>
                        <a
                          href="tel:+17257559598"
                          className="text-base font-semibold text-foreground hover:text-primary transition-colors block"
                        >
                          +1 (725) 755-9598
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">Toll-free in US & Canada · No hold queue</p>
                        <div className="flex gap-2 mt-3">
                          <a href="tel:+17257559598" className="flex-1">
                            <Button size="sm" variant="darkShine" className="w-full gap-1.5">
                              <Phone className="w-3.5 h-3.5" /> Call
                            </Button>
                          </a>
                          <a href="sms:+17257559598" className="flex-1">
                            <Button size="sm" variant="outline" className="w-full gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" /> Text
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card variant="glass" className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <a
                          href="mailto:support@vendibook.com"
                          className="text-sm text-foreground hover:text-primary transition-colors break-all block"
                        >
                          support@vendibook.com
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">Replies typically within 2 hours</p>
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText('support@vendibook.com');
                            toast.success('Email copied');
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                        >
                          <Copy className="w-3 h-3" /> Copy address
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Chat */}
                <Card variant="glass" className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Live chat</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Instant answers from our Event Pro concierge.
                        </p>
                        <Button
                          size="sm"
                          variant="darkShine"
                          onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                          className="gap-2 w-full"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Start chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* HQ / Service area */}
                <Card variant="glass" className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Headquarters</h3>
                        <p className="text-sm text-foreground">Las Vegas, NV</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Serving event hosts & pros nationwide across the US & Canada.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social */}
                <div className="pt-2">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Follow & message us</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-border/50 bg-card/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-border/50 bg-card/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="pt-2">
                  <h3 className="font-semibold text-foreground mb-3 text-sm">Quick links</h3>
                  <div className="space-y-2">
                    <Link
                      to="/faq"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Browse FAQs
                    </Link>
                    <Link
                      to="/support"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Support Center
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
