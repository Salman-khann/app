import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProduct, addToCart } from '@/db/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, Star, ArrowLeft, ShieldCheck, Zap, Info } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getProduct(id);
    setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    const success = await addToCart(user.id, product.id);
    setAddingToCart(false);
    
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
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/products')}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden shadow-inner">
            <img 
              src={product.image_urls?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop'} 
              alt={product.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.image_urls?.slice(0, 4).map((url, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
                <img src={url} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3">
                {product.category}
              </Badge>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
                <span className="text-sm font-bold">{product.rating || 4.8}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{product.name}</h1>
            <p className="text-xl font-medium text-muted-foreground">{product.brand}</p>
            
            <div className="text-3xl font-bold text-primary">
              {product.price_aed} AED
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold w-full mb-1">Suitable For:</span>
              {product.suitable_skin_types?.map(type => (
                <Badge key={type} variant="outline" className="capitalize px-4 py-1">{type} Skin</Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              size="lg" 
              className="flex-1 h-14 text-lg font-bold shadow-xl shadow-primary/20"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8">
              Wishlist
            </Button>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
              <ShieldCheck className="h-5 w-5 text-emerald-500 mt-1" />
              <div>
                <p className="text-sm font-bold">Dermatologist Approved</p>
                <p className="text-xs text-muted-foreground">Tested in clinical environments</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
              <Zap className="h-5 w-5 text-amber-500 mt-1" />
              <div>
                <p className="text-sm font-bold">UAE Climate Ready</p>
                <p className="text-xs text-muted-foreground">Specifically for high heat & humidity</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs for detailed info */}
      <div className="mt-16 space-y-8">
        <h3 className="text-2xl font-bold border-b pb-4">Detailed Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Info className="h-5 w-5 text-primary" /> Key Ingredients
            </div>
            <div className="flex flex-wrap gap-2">
              {product.key_ingredients?.map(ingredient => (
                <Badge key={ingredient} variant="secondary" className="bg-background border px-3 py-1">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Zap className="h-5 w-5 text-primary" /> Usage Instructions
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {product.usage_instructions || 'Apply a small amount to the fingertips and gently massage onto clean, dry skin. Use morning and night for best results. Always follow with SPF during the day.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
