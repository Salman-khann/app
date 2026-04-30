import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDermatologistProfile, createConsultation, getSkinAnalyses } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Calendar as CalendarIcon, Clock, Video, Home, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function BookingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    type: 'video',
    date: '',
    time: '',
    analysisId: '',
  });

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [docData, analysesData] = await Promise.all([
        getDermatologistProfile(id),
        user ? getSkinAnalyses(user.id) : Promise.resolve([])
      ]);
      
      setDoctor(docData);
      setAnalyses(analysesData || []);
    } catch (error) {
      console.error('Error loading booking data:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a consultation');
      navigate('/login');
      return;
    }

    if (!bookingData.date || !bookingData.time) {
      toast.error('Please select a date and time');
      return;
    }

    setSubmitting(true);
    try {
      const scheduledTime = new Date(`${bookingData.date}T${bookingData.time}`).toISOString();
      
      const resultId = await createConsultation({
        user_id: user.id,
        dermatologist_id: id,
        analysis_id: bookingData.analysisId || null,
        consultation_type: bookingData.type as any,
        scheduled_time: scheduledTime,
        fee_aed: doctor?.consultation_fee || 0,
        status: 'scheduled'
      });

      if (resultId || id?.startsWith('mock-')) {
        toast.success('Consultation booked successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Failed to book consultation. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      // Fallback for mock environment
      if (id?.startsWith('mock-')) {
        toast.success('Consultation booked successfully (Demo Mode)!');
        navigate('/dashboard');
      } else {
        toast.error('Failed to book consultation');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold mb-4">Doctor Not Found</h2>
        <Button onClick={() => navigate('/doctors')}>Back to Doctors</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/doctors')}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Doctors
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Doctor Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-lg">
            <div className="aspect-square bg-muted">
              <img 
                src={doctor.photo_url || 'https://images.unsplash.com/photo-1559839734-2b71f153678f?q=80&w=400&auto=format&fit=crop'} 
                alt={doctor.profile?.full_name} 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold">{doctor.profile?.full_name}</h2>
              <p className="text-primary font-medium text-sm mb-4">{doctor.specialization}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-semibold">{doctor.years_experience} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-bold text-foreground">{doctor.consultation_fee} AED</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {doctor.languages?.map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="text-[10px]">{lang}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4 text-sm">
              <p className="font-semibold text-primary mb-1">Clinic Location</p>
              <p className="text-muted-foreground">{doctor.clinic_address || 'Address provided after booking'}</p>
              <p className="text-muted-foreground font-medium">{doctor.clinic_emirate}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Booking Form */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl border-none">
              <CardHeader>
                <CardTitle>Schedule Consultation</CardTitle>
                <CardDescription>Select your preferred time and consultation type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Consultation Type */}
                <div className="space-y-3">
                  <Label className="text-base">Consultation Type</Label>
                  <RadioGroup 
                    defaultValue="video" 
                    className="grid grid-cols-2 gap-4"
                    onValueChange={(val) => setBookingData({...bookingData, type: val})}
                  >
                    <div>
                      <RadioGroupItem value="video" id="video" className="peer sr-only" />
                      <Label
                        htmlFor="video"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Video className="mb-2 h-6 w-6 text-primary" />
                        <span className="font-semibold">Video Call</span>
                        <span className="text-[10px] text-muted-foreground text-center mt-1">Perfect for follow-ups and initial reviews</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="in_clinic" id="clinic" className="peer sr-only" />
                      <Label
                        htmlFor="clinic"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Home className="mb-2 h-6 w-6 text-primary" />
                        <span className="font-semibold">In-Clinic</span>
                        <span className="text-[10px] text-muted-foreground text-center mt-1">Best for physical procedures and testing</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" /> Select Date
                    </Label>
                    <input 
                      type="date" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Select Time
                    </Label>
                    <Select onValueChange={(val) => setBookingData({...bookingData, time: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Available slots" />
                      </SelectTrigger>
                      <SelectContent>
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Analysis Selection */}
                {analyses.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base">Share Analysis Result (Optional)</Label>
                    <Select onValueChange={(val) => setBookingData({...bookingData, analysisId: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an analysis to share" />
                      </SelectTrigger>
                      <SelectContent>
                        {analyses.map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            Analysis from {new Date(a.created_at).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">Sharing your analysis helps the doctor prepare for your consultation.</p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Fee (incl. VAT)</span>
                    <span className="text-2xl font-bold text-foreground">{(doctor.consultation_fee * 1.05).toFixed(2)} AED</span>
                  </div>
                  <Button 
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                    onClick={handleBooking}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Confirm Booking'}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">By confirming, you agree to our terms and cancellation policy.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
