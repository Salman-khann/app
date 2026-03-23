import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ConsultationRoomPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">ConsultationRoomPage</h1>
          <p className="text-muted-foreground mb-6">This page is under construction</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </CardContent>
      </Card>
    </div>
  );
}
