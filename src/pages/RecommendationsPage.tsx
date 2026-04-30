import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSkinAnalysis, getRoutineByAnalysis, getProducts, addToCart, getActiveRoutine } from '@/db/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Sun, Moon, CheckCircle2, ShoppingCart, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { SkinAnalysis, SkincareRoutine, Product } from '@/types';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [routine, setRoutine] = useState<SkincareRoutine | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const analysisId = location.state?.analysisId;

  useEffect(() => {
    loadData();
  }, [analysisId, user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let targetAnalysisId = analysisId;
      
      // If no analysisId from state, get the latest one
      if (!targetAnalysisId) {
        const analyses = await getSkinAnalysis(user.id); // This actually fetches by ID in api.ts, wait
        // Check api.ts again: getSkinAnalyses(userId)
        const userAnalyses = await (await import('@/db/api')).getSkinAnalyses(user.id);
        if (userAnalyses && userAnalyses.length > 0) {
          targetAnalysisId = userAnalyses[0].id;
        }
      }

      if (targetAnalysisId) {
        const [analysisData, routineData] = await Promise.all([
          getSkinAnalysis(targetAnalysisId),
          getRoutineByAnalysis(targetAnalysisId)
        ]);

        setAnalysis(analysisData);
        setRoutine(routineData);

        if (analysisData?.skin_type) {
          const { products } = await getProducts({ 
            skinType: analysisData.skin_type.toLowerCase() 
          });
          setRecommendedProducts(products.slice(0, 4));
        }
      } else {
        // Try to get active routine if no analysis
        const activeRoutine = await getActiveRoutine(user.id);
        setRoutine(activeRoutine);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }

    const success = await addToCart(user.id, productId);
    if (success) {
      toast.success('Added to cart');
    } else {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Personalizing your recommendations...</p>
      </div>
    );
  }

  if (!routine && !analysis) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12">
            <h2 className="text-xl font-bold mb-4">No Recommendations Yet</h2>
            <p className="text-muted-foreground mb-6">Complete a skin analysis to get personalized routines and products.</p>
            <Button onClick={() => navigate('/analysis')}>Start Analysis</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center md:text-left"
      >
        <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight">Your Skin Prescription</h1>
        <p className="text-lg text-muted-foreground">
          Tailored for <span className="font-semibold text-primary">{analysis?.skin_type || 'your skin'}</span> type in the UAE climate.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Routine */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="border-b bg-muted/20 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Daily Routine</CardTitle>
                  <CardDescription>Follow these steps for optimal results</CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-background">
                  {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="morning" className="w-full">
                <TabsList className="w-full grid grid-cols-2 rounded-none h-16 bg-muted/10">
                  <TabsTrigger value="morning" className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
                    <Sun className="mr-2 h-5 w-5 text-amber-500" />
                    Morning
                  </TabsTrigger>
                  <TabsTrigger value="evening" className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
                    <Moon className="mr-2 h-5 w-5 text-indigo-500" />
                    Evening
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="morning" className="p-6 focus-visible:outline-none">
                  <div className="space-y-6">
                    {routine?.morning_routine?.map((step: any, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 group"
                      >
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border-2 border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {step.step}
                          </div>
                          {index < (routine?.morning_routine?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-muted mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{step.category}</span>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{step.product_name}</h4>
                          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.instructions}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="evening" className="p-6 focus-visible:outline-none">
                  <div className="space-y-6">
                    {routine?.evening_routine?.map((step: any, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 group"
                      >
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border-2 border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {step.step}
                          </div>
                          {index < (routine?.evening_routine?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-muted mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{step.category}</span>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{step.product_name}</h4>
                          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.instructions}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Insights & Products */}
        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                AI Skin Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 border">
                <p className="text-sm font-medium mb-1">Detected Skin Type</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground capitalize">
                    {analysis?.skin_type || 'Loading...'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{analysis?.confidence_score ? `${(analysis.confidence_score * 100).toFixed(0)}% confidence` : ''}</span>
                </div>
              </div>
              
              {analysis?.concerns && analysis.concerns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Top Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.concerns.map((concern: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {concern.type} • {concern.severity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center justify-between">
              Recommended Products
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => navigate('/products')}>
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </h3>
            
            <div className="space-y-4">
              {recommendedProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-muted hover:border-primary/30 transition-all duration-300">
                    <div className="flex h-24">
                      <div 
                        className="w-24 bg-muted overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {product.image_urls?.[0] ? (
                          <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <ShoppingCart className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h5 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{product.name}</h5>
                          <p className="text-[10px] text-muted-foreground">{product.brand}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">{product.price_aed} AED</span>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary hover:bg-primary/10 rounded-full" onClick={() => handleAddToCart(product.id)}>
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center mx-auto shadow-sm">
                <Star className="h-6 w-6 text-primary fill-primary" />
              </div>
              <div>
                <h4 className="font-bold">Need expert advice?</h4>
                <p className="text-xs text-muted-foreground mt-1">Our dermatologists can review your results and provide a professional medical opinion.</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => navigate('/doctors')}>
                Book a Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
