import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import CategoryCard from '@/components/CategoryCard';
import { categories } from '@/data/products';
import CheckoutStepper from '@/components/CheckoutStepper';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <Layout>
      <Helmet>
        <title>Shopping Cart | Artistry Home</title>
        <meta name="description" content="Review your shopping cart and proceed to checkout at Artistry Home." />
      </Helmet>

      {/* Cart Steps */}
      <CheckoutStepper activeStep={1} />

      <section className="py-12 bg-background min-h-[60vh]">
        <div className="container">
          {items.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Your cart is currently empty.
              </h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/shop">
                <Button className="btn-gold px-8">Return to Shop</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-border items-center"
                    >
                      <div className="md:col-span-6 flex items-center gap-4">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg" />
                        <div>
                          <Link to={`/product/${item.id}`} className="font-medium">
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>

                      <div className="md:col-span-2 text-center">
                        ₹{item.price.toLocaleString()}
                      </div>

                      <div className="md:col-span-2 flex justify-center items-center">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus />
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus />
                        </button>
                      </div>

                      <div className="md:col-span-2 text-right font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <div className="p-4 flex justify-between">
                    <Link to="/shop">
                      <Button variant="outline">Continue Shopping</Button>
                    </Link>
                    <Button variant="outline" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <div className="bg-card border border-border p-6 sticky top-24">
                  <div className="flex justify-between mb-4 font-display">
                    <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Estimated Total</span>
                    <span className="font-bold text-xl text-primary">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <Button
                    className="w-full btn-gold py-6 text-lg rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={() => {
                      const user = localStorage.getItem('user');
                      if (!user) {
                        toast.info("Please login to proceed to checkout", {
                          description: "We need your details to deliver your luxury decor."
                        });
                        navigate('/login?redirect=checkout');
                      } else {
                        navigate('/checkout');
                      }
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Explore Categories — SHOW ALL */}
      <section className="py-12 bg-secondary border-t border-border">
        <div className="container">
          <h2 className="text-2xl font-semibold text-center mb-8">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
