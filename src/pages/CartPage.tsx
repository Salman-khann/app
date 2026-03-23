import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '@/db/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '@/types';

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    const items = await getCartItems(user.id);
    setCartItems(items);
    setLoading(false);
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    const success = await updateCartItemQuantity(itemId, quantity);
    if (success) {
      await loadCart();
    } else {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: string) => {
    const success = await removeFromCart(itemId);
    if (success) {
      toast.success('Removed from cart');
      await loadCart();
    } else {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.product?.price_aed || 0) * item.quantity;
    }, 0);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Please sign in to view your cart</p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => navigate('/products')}>Shop Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-muted rounded flex-shrink-0">
                  {item.product?.image_urls?.[0] && (
                    <img
                      src={item.product.image_urls[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product?.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.product?.brand}</p>
                  <p className="text-primary font-bold mt-1">{item.product?.price_aed} AED</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{calculateTotal().toFixed(2)} AED</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (5%)</span>
            <span>{(calculateTotal() * 0.05).toFixed(2)} AED</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>25.00 AED</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{(calculateTotal() * 1.05 + 25).toFixed(2)} AED</span>
          </div>
          <Button className="w-full mt-4" size="lg" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
