import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCartItems } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { Loader2 } from 'lucide-react';
import type { CartItem } from '@/types';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    emirate: '',
    area: '',
    building: '',
    flat: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    const items = await getCartItems(user.id);
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(items);
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price_aed || 0) * item.quantity;
    }, 0);
    const vat = subtotal * 0.05;
    const delivery = 25;
    return { subtotal, vat, delivery, total: subtotal + vat + delivery };
  };

  const handleCheckout = async () => {
    if (!address.emirate || !address.area || !address.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        name: item.product?.name || '',
        brand: item.product?.brand || '',
        price_aed: item.product?.price_aed || 0,
        quantity: item.quantity,
        image_url: item.product?.image_urls?.[0],
      }));

      const { data, error } = await supabase.functions.invoke('create_stripe_checkout', {
        body: { items },
      });

      if (error) {
        const errorMsg = await error?.context?.text();
        throw new Error(errorMsg || error.message);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emirate">Emirate *</Label>
                <Input
                  id="emirate"
                  value={address.emirate}
                  onChange={(e) => setAddress({ ...address, emirate: e.target.value })}
                  placeholder="e.g., Dubai, Abu Dhabi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area *</Label>
                <Input
                  id="area"
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  placeholder="Area name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="building">Building</Label>
                <Input
                  id="building"
                  value={address.building}
                  onChange={(e) => setAddress({ ...address, building: e.target.value })}
                  placeholder="Building name/number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flat">Flat/Unit</Label>
                <Input
                  id="flat"
                  value={address.flat}
                  onChange={(e) => setAddress({ ...address, flat: e.target.value })}
                  placeholder="Flat/Unit number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+971 XX XXX XXXX"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product?.name} x{item.quantity}
                    </span>
                    <span>{((item.product?.price_aed || 0) * item.quantity).toFixed(2)} AED</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{totals.subtotal.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (5%)</span>
                  <span>{totals.vat.toFixed(2)} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{totals.delivery.toFixed(2)} AED</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{totals.total.toFixed(2)} AED</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Proceed to Payment
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You will be redirected to Stripe for secure payment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
