import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSkinAnalysis } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import type { SkinAnalysis } from '@/types';

export default function AnalysisResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    if (!id) return;
    const data = await getSkinAnalysis(id);
    setAnalysis(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p className="text-muted-foreground mb-4">Analysis not found</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Skin Analysis Report</h1>
        <p className="text-muted-foreground">
          {new Date(analysis.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Skin Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-primary">{analysis.skin_score}/100</span>
                <Badge variant={analysis.skin_score && analysis.skin_score > 70 ? 'default' : 'secondary'}>
                  {analysis.skin_score && analysis.skin_score > 70 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <Progress value={analysis.skin_score || 0} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skin Type & Concerns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Detected Skin Type</p>
              <Badge variant="outline" className="text-base">{analysis.skin_type || 'Unknown'}</Badge>
            </div>
            {analysis.concerns && analysis.concerns.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Primary Concerns</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.concerns.map((concern: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {concern.type} ({concern.severity})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {analysis.ai_summary && (
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{analysis.ai_summary}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button onClick={() => navigate('/recommendations', { state: { analysisId: analysis.id } })}>
            View Recommendations
          </Button>
          <Button variant="outline" onClick={() => navigate('/doctors')}>
            Consult a Dermatologist
          </Button>
        </div>
      </div>
    </div>
  );
}
