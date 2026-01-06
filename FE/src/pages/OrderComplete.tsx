import React from "react";
import { useLocation, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import CheckoutStepper from "@/components/CheckoutStepper";
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag } from "lucide-react";

const OrderComplete = () => {
    const location = useLocation();
    const order = location.state?.order;

    return (
        <Layout>
            <Helmet>
                <title>Order Complete | Artistry Home</title>
            </Helmet>

            <CheckoutStepper activeStep={3} />

            <div className="container mx-auto py-16 px-4 max-w-4xl">
                <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
                    {/* Decorative background elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-in fade-in zoom-in duration-700">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
                            {order ? "Order Confirmed!" : "No Recent Order Found"}
                        </h1>
                        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                            {order
                                ? "Thank you for choosing Artistry Home. Your luxury pieces are being prepared for delivery."
                                : "It seems you haven't placed an order recently or your session has expired."}
                        </p>

                        {order && (
                            <div className="bg-secondary/40 backdrop-blur-md rounded-2xl p-6 mb-10 w-full max-w-md border border-border/40">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Order Number</span>
                                    <span className="font-bold text-primary">#{order.orderNumber || order.id}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Amount Paid</span>
                                    <span className="font-bold text-foreground">₹{order.totalAmount?.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-border/20 flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4 text-primary" />
                                        <span>Items: {order.items?.length || 0} pieces of luxury decor</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span>Estimated Delivery: {new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <Link to="/" className="w-full sm:w-auto">
                                <Button className="btn-gold w-full px-10 py-7 text-lg rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    {order ? "Continue Shopping" : "Start Shopping Now"}
                                </Button>
                            </Link>
                            {order && (
                                <Link to="/account" className="w-full sm:w-auto">
                                    <Button variant="outline" className="w-full px-10 py-7 text-lg rounded-2xl font-bold border-border/60 hover:bg-secondary transition-all">
                                        Track Order
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="mt-12 text-center">
                    <p className="text-muted-foreground mb-6">Need help with your order?</p>
                    <div className="flex justify-center gap-8">
                        <div className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors cursor-pointer">
                            <ShoppingBag className="h-4 w-4" />
                            <span>Contact Support</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors cursor-pointer">
                            <ArrowRight className="h-4 w-4" />
                            <span>Shipping Policy</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OrderComplete;
