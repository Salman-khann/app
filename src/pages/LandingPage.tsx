import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Users, ShoppingBag, Video, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Skin Analysis',
      description: 'Upload your photo and get instant AI-powered skin analysis with personalized insights.',
    },
    {
      icon: Video,
      title: 'Expert Consultations',
      description: 'Book video or in-clinic consultations with UAE-licensed dermatologists.',
    },
    {
      icon: ShoppingBag,
      title: 'Curated Products',
      description: 'Shop personalized skincare products matched to your unique skin profile.',
    },
    {
      icon: Users,
      title: 'Personalized Routines',
      description: 'Get customized morning and evening skincare routines tailored to UAE climate.',
    },
  ];

  const testimonials = [
    {
      name: 'Fatima Al-Mansouri',
      location: 'Dubai',
      text: 'DermAI helped me understand my skin concerns and connected me with an amazing dermatologist. My skin has never looked better!',
    },
    {
      name: 'Ahmed Hassan',
      location: 'Abu Dhabi',
      text: 'The AI analysis was surprisingly accurate. The personalized routine recommendations work perfectly for the UAE climate.',
    },
    {
      name: 'Sara Al-Zaabi',
      location: 'Sharjah',
      text: 'Booking a consultation was so easy, and the product recommendations are spot-on. Highly recommend!',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              AI-Powered Skincare for{' '}
              <span className="text-primary">UAE</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Get personalized skin analysis, expert dermatologist consultations, and curated product recommendations — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/analysis">Start Free Analysis</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/doctors">Book a Dermatologist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Healthy Skin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete ecosystem designed specifically for the UAE market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Complete Your Skin Analysis',
                  description: 'Upload a photo or answer our questionnaire to get a comprehensive AI-powered skin assessment.',
                },
                {
                  step: '2',
                  title: 'Get Personalized Recommendations',
                  description: 'Receive a customized skincare routine and product suggestions based on your unique skin profile.',
                },
                {
                  step: '3',
                  title: 'Consult with Experts',
                  description: 'Book a consultation with UAE-licensed dermatologists for professional guidance.',
                },
                {
                  step: '4',
                  title: 'Shop & Track Progress',
                  description: 'Purchase recommended products and monitor your skin health journey over time.',
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by UAE Residents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle key={i} className="h-4 w-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of UAE residents who trust DermAI for their skincare journey
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 DermAI UAE. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
