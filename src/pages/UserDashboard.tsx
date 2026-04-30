import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getSkinAnalyses, getActiveRoutine, updateProfile } from '@/db/api';
import { toast } from 'sonner';
import { Calendar, TrendingUp, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SkinAnalysis, SkincareRoutine } from '@/types';

export default function UserDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [allergies, setAllergies] = useState(
    Array.isArray(profile?.known_allergies) ? profile.known_allergies.join(', ') : ''
  );

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const analysesData = await getSkinAnalyses(user.id);
    setAnalyses(analysesData);
    const routineData = await getActiveRoutine(user.id);
    setRoutine(routineData);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    const result = await updateProfile(user.id, {
      full_name: fullName || null,
      age: age ? parseInt(age) : null,
      location: location || null,
      known_allergies: allergies ? allergies.split(',').map((a: string) => a.trim()) : null,
    });

    if (result.success) {
      toast.success('Profile updated successfully');
      await refreshProfile();
    } else {
      toast.error(result.errorMessage || 'Failed to update profile');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your skin profile and track your progress</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Skin Profile</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
          <TabsTrigger value="routines">My Routines</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Emirate)</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Dubai, Abu Dhabi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Input
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Separate with commas"
                  />
                </div>
              </div>
              <Button onClick={handleUpdateProfile}>Save Changes</Button>
            </CardContent>
          </Card>

          {analyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Skin Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Skin Score</p>
                      <p className="text-3xl font-bold text-primary">{analyses[0].skin_score}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Skin Type</p>
                      <Badge variant="secondary" className="mt-1">{analyses[0].skin_type || 'Unknown'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-sm">{new Date(analyses[0].created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate(`/analysis/${analyses[0].id}`)}>
                    View Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No analyses yet</p>
                <Button onClick={() => navigate('/analysis')}>Start Your First Analysis</Button>
              </CardContent>
            </Card>
          ) : (
            analyses.map((analysis) => (
              <Card key={analysis.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Skin Score: {analysis.skin_score}/100</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString()} • {analysis.skin_type || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => navigate(`/analysis/${analysis.id}`)}>View Report</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="routines" className="space-y-4">
          {!routine ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No routine yet</p>
                <Button onClick={() => navigate('/analysis')}>Get Your Personalized Routine</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Morning Routine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {routine.morning_routine?.map((step: any, index: number) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">{step.step}</span>
                        </div>
                        <div>
                          <p className="font-medium">{step.category}</p>
                          <p className="text-sm text-muted-foreground">{step.product_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{step.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Evening Routine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {routine.evening_routine?.map((step: any, index: number) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">{step.step}</span>
                        </div>
                        <div>
                          <p className="font-medium">{step.category}</p>
                          <p className="text-sm text-muted-foreground">{step.product_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{step.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
