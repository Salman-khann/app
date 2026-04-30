import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Loader2, Camera } from 'lucide-react';
import { supabase } from '@/db/supabase';

const skinAnalysisBucket = import.meta.env.VITE_SUPABASE_SKIN_ANALYSIS_BUCKET || 'skin_analysis_images';

export default function AIAnalysisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  const [questionnaire, setQuestionnaire] = useState({
    skinType: '',
    concerns: [] as string[],
    sunExposure: '',
    waterIntake: '',
    currentProducts: '',
    lifestyle: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }

    if (!photoFile && !questionnaire.skinType) {
      toast.error('Please upload a photo or complete the questionnaire');
      return;
    }

    setLoading(true);

    try {
      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from(skinAnalysisBucket)
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(skinAnalysisBucket)
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      const response = await supabase.functions.invoke('analyze_skin', {
        body: {
          photoUrl,
          questionnaire: questionnaire.skinType ? questionnaire : null,
        },
      });

      if (response.error) {
        const errorContext = response.error.context;
        const errorMsg =
          typeof errorContext?.text === 'function'
            ? await errorContext.text()
            : response.error.message;
        throw new Error(errorMsg || 'Failed to analyze skin');
      }

      toast.success('Analysis complete!');
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (error: any) {
      console.error('Analysis error:', error);
      const message = String(error?.message || 'Failed to analyze skin');
      if (message.toLowerCase().includes('bucket') || message.toLowerCase().includes('storage')) {
        toast.error(
          `Upload failed because the Supabase bucket "${skinAnalysisBucket}" does not exist or is not accessible. Create the bucket in Supabase Storage and try again.`,
        );
      } else if (
        message.toLowerCase().includes('edge function') ||
        message.toLowerCase().includes('failed to send a req') ||
        message.toLowerCase().includes('fetch')
      ) {
        toast.error(
          'The analyze_skin edge function is not reachable. Deploy the function to the new Supabase project and make sure SUPABASE_SERVICE_ROLE_KEY is configured in the function secrets.',
        );
      } else {
        toast.error(message || 'Failed to analyze skin');
      }
    } finally {
      setLoading(false);
    }
  };

  const concernOptions = [
    'Acne',
    'Dark Spots',
    'Wrinkles',
    'Redness',
    'Large Pores',
    'Uneven Tone',
    'Dryness',
    'Oiliness',
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Skin Analysis</h1>
        <p className="text-muted-foreground">
          Upload a photo or answer questions to get your personalized skin analysis
        </p>
      </div>

      <Tabs defaultValue="photo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photo">Photo Upload</TabsTrigger>
          <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
        </TabsList>

        <TabsContent value="photo">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Photo</CardTitle>
              <CardDescription>
                Take a clear frontal photo in good lighting for best results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview('');
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">JPG or PNG (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questionnaire">
          <Card>
            <CardHeader>
              <CardTitle>Skin Questionnaire</CardTitle>
              <CardDescription>Help us understand your skin better</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>What is your skin type?</Label>
                <RadioGroup
                  value={questionnaire.skinType}
                  onValueChange={(value) =>
                    setQuestionnaire({ ...questionnaire, skinType: value })
                  }
                >
                  {['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.toLowerCase()} id={type} />
                      <Label htmlFor={type} className="font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>What are your main skin concerns? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {concernOptions.map((concern) => (
                    <label key={concern} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionnaire.concerns.includes(concern)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setQuestionnaire({
                              ...questionnaire,
                              concerns: [...questionnaire.concerns, concern],
                            });
                          } else {
                            setQuestionnaire({
                              ...questionnaire,
                              concerns: questionnaire.concerns.filter((c) => c !== concern),
                            });
                          }
                        }}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{concern}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sun exposure (UAE climate)</Label>
                <RadioGroup
                  value={questionnaire.sunExposure}
                  onValueChange={(value) =>
                    setQuestionnaire({ ...questionnaire, sunExposure: value })
                  }
                >
                  {['Minimal', 'Moderate', 'High'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.toLowerCase()} id={`sun-${level}`} />
                      <Label htmlFor={`sun-${level}`} className="font-normal cursor-pointer">
                        {level}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Daily water intake</Label>
                <RadioGroup
                  value={questionnaire.waterIntake}
                  onValueChange={(value) =>
                    setQuestionnaire({ ...questionnaire, waterIntake: value })
                  }
                >
                  {['Less than 1L', '1-2L', 'More than 2L'].map((amount) => (
                    <div key={amount} className="flex items-center space-x-2">
                      <RadioGroupItem value={amount} id={`water-${amount}`} />
                      <Label htmlFor={`water-${amount}`} className="font-normal cursor-pointer">
                        {amount}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentProducts">Current skincare products</Label>
                <Input
                  id="currentProducts"
                  placeholder="List your current products"
                  value={questionnaire.currentProducts}
                  onChange={(e) =>
                    setQuestionnaire({ ...questionnaire, currentProducts: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-center">
        <Button size="lg" onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Analyze My Skin
        </Button>
      </div>
    </div>
  );
}
