import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApprovedDermatologists } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Languages, Calendar } from 'lucide-react';

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    const data = await getApprovedDermatologists();
    setDoctors(data);
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">UAE Dermatologists</h1>
        <p className="text-muted-foreground">Book consultations with licensed professionals</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 w-20 rounded-full bg-muted mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No dermatologists available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.photo_url || ''} />
                    <AvatarFallback>{doctor.profile?.full_name?.[0] || 'D'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doctor.profile?.full_name || 'Doctor'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {doctor.years_experience && (
                  <p className="text-sm">
                    <span className="font-medium">{doctor.years_experience}</span> years experience
                  </p>
                )}
                {doctor.clinic_emirate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {doctor.clinic_emirate}
                  </div>
                )}
                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Languages className="h-4 w-4" />
                    {doctor.languages.join(', ')}
                  </div>
                )}
                {doctor.consultation_fee && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Consultation Fee</span>
                    <span className="font-bold text-primary">{doctor.consultation_fee} AED</span>
                  </div>
                )}
                <Button className="w-full" onClick={() => navigate(`/doctors/${doctor.id}/book`)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
