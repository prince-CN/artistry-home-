import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { createOrder } from "@/redux/order/action";
import { addAddress } from "@/redux/address/action";
import { toast } from "sonner";
import CheckoutStepper from "@/components/CheckoutStepper";
import { Helmet } from "react-helmet-async";
import { ShoppingBag, MapPin, CreditCard, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!user && !storedUser) {
      toast.info("Please login to proceed to checkout");
      navigate("/login?redirect=checkout");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleCheckout = async () => {
    if (!formData.firstName || !formData.addressLine1 || !formData.phoneNumber) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;

      if (!userId) {
        toast.error("User session expired. Please login again.");
        navigate("/login");
        return;
      }

      const addressRequest = {
        userId: userId,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phoneNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        country: "India",
        zipCode: formData.zipCode,
        isDefault: true
      };

      // Step 1: Add Address
      const savedAddress = await dispatch(addAddress(addressRequest) as any);

      if (!savedAddress || !savedAddress.id) {
        throw new Error("Failed to save address");
      }

      // Step 2: Create Order
      const orderRequest = {
        userId: userId,
        addressId: savedAddress.id
      };

      const order = await dispatch(createOrder(orderRequest) as any);

      clearCart();
      navigate("/order-complete", { state: { order } });
    } catch (error: any) {
      const backendError = error.response?.data?.error || error.message;
      toast.error(`Failed to place order: ${backendError}`);
      console.error("Checkout full error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Checkout | Artistry Home</title>
      </Helmet>

      <CheckoutStepper activeStep={2} />

      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-display font-bold tracking-tight">Checkout Details</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-12 text-center space-y-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground">You need to add some luxury pieces to your cart before checking out.</p>
            </div>
            <Button onClick={() => navigate("/shop")} className="btn-gold px-8 rounded-xl font-bold">
              Explore Collections
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-10">
              {/* Shipping Address */}
              <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">First Name *</label>
                    <Input name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Last Name</label>
                    <Input name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Phone Number *</label>
                    <Input name="phoneNumber" placeholder="Enter phone number" value={formData.phoneNumber} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Address Line 1 *</label>
                    <Input name="addressLine1" placeholder="House/Flat No, Apartment, Street" value={formData.addressLine1} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Address Line 2 (Optional)</label>
                    <Input name="addressLine2" placeholder="Landmark, Area" value={formData.addressLine2} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">City *</label>
                    <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">State *</label>
                    <Input name="state" placeholder="State" value={formData.state} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Pincode *</label>
                    <Input name="zipCode" placeholder="Pincode" value={formData.zipCode} onChange={handleChange} className="bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl h-12" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="group border border-primary/30 p-5 rounded-2xl flex items-center space-x-4 cursor-pointer bg-primary/5 transition-all hover:border-primary/60">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Cash on Delivery (COD)</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-tight">Pay when you receive your luxury decor</p>
                    </div>
                  </div>

                  <div className="border border-border/40 p-5 rounded-2xl flex items-center space-x-4 cursor-not-allowed opacity-50 bg-secondary/20">
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-muted-foreground">Online Payment</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-tight">Credit Card, UPI, NetBanking (Coming Soon)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-card border border-border/50 rounded-2xl p-8 sticky top-28 shadow-lg">
                <h2 className="font-display text-xl font-bold mb-6 border-b border-border/40 pb-4">Order Summary</h2>

                <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-secondary" />
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-border/40">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span className="text-sm font-semibold text-foreground">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span className="text-sm font-medium">Shipping</span>
                    <span className="text-xs font-bold text-green-500 uppercase">Free</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-border/40">
                    <span className="font-bold text-lg">Total</span>
                    <div className="text-right">
                      <span className="font-bold text-2xl text-primary">₹{totalPrice.toLocaleString()}</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-8 btn-gold py-7 text-lg rounded-2xl font-bold shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Placing Order...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Complete Purchase
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>

                <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-medium">
                  🔒 Secure Checkout & Authenticity Guaranteed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;
