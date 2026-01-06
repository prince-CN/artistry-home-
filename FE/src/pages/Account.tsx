import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '@/redux/profile/action';
import { fetchUserOrders } from '@/redux/order/action';
import { fetchAddresses, addAddress, updateAddress, deleteAddress } from '@/redux/address/action';

const Account = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile, loading: profileLoading } = useSelector((state: any) => state.profile);
  const { orders, loading: ordersLoading } = useSelector((state: any) => state.order);
  const { addresses, loading: addressLoading } = useSelector((state: any) => state.address);
  // Using Redux Wishlist if available
  const wishlist = useSelector((state: any) => state.wishlist?.wishlist || []);
  const wishlistLoading = useSelector((state: any) => state.wishlist?.loading);

  const [activeTab, setActiveTab] = useState('profile');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      dispatch(fetchProfile() as any);
      dispatch(fetchUserOrders() as any);
      dispatch(fetchAddresses() as any);
    }
  }, [user, dispatch]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await dispatch(updateAddress(editingAddressId, addressFormData) as any);
        toast.success("Address updated successfully");
      } else {
        await dispatch(addAddress(addressFormData) as any);
        toast.success("Address added successfully");
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddressId(address.id);
    setAddressFormData({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'India',
      isDefault: address.isDefault || false
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await dispatch(deleteAddress(id) as any);
        toast.success("Address deleted");
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center font-display">
          <div className="animate-pulse text-muted-foreground">Loading your account details...</div>
        </div>
      </Layout>
    );
  }

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'DELIVERED': return 'text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold';
      case 'SHIPPED': return 'text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-bold';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full text-xs font-bold';
      case 'CANCELLED': return 'text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold';
      default: return 'text-muted-foreground bg-muted px-2.5 py-1 rounded-full text-xs font-bold';
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>My Account | Artistry Home</title>
      </Helmet>

      <div className="container py-8 max-w-7xl animate-in fade-in duration-500">
        <h1 className="text-3xl font-display font-bold mb-8 tracking-tight border-b pb-4">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border shadow-lg p-5 sticky top-24">
              <div className="flex items-center gap-4 pb-6 border-b border-border/50 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-lg truncate leading-tight">{profile?.firstName} {profile?.lastName || 'Decor User'}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowAddressForm(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'text-foreground hover:bg-muted hover:translate-x-1'
                      }`}
                  >
                    <span className="flex items-center gap-3 font-semibold text-sm">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${activeTab === item.id ? 'rotate-90 scale-125' : 'opacity-40'}`} />
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-red-600 hover:bg-red-50 rounded-xl font-bold py-6 transition-all active:scale-95"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout Session
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border shadow-xl min-h-[600px] overflow-hidden">
              <div className="p-8">
                {activeTab === 'profile' && (
                  <div className="animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-center mb-10 pb-4 border-b">
                      <div>
                        <h2 className="text-2xl font-bold font-display">Profile Details</h2>
                        <p className="text-sm text-muted-foreground mt-1">Manage your identity and contact info.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-1.5 p-4 rounded-xl bg-muted/20">
                        <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/70">First Name</label>
                        <p className="font-bold text-xl">{profile?.firstName || '-'}</p>
                      </div>
                      <div className="space-y-1.5 p-4 rounded-xl bg-muted/20">
                        <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/70">Last Name</label>
                        <p className="font-bold text-xl">{profile?.lastName || '-'}</p>
                      </div>
                      <div className="space-y-1.5 p-4 rounded-xl bg-muted/20 group cursor-default">
                        <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/70">Email Balance</label>
                        <p className="font-bold text-xl text-primary transition-colors">{user?.email}</p>
                      </div>
                      <div className="space-y-1.5 p-4 rounded-xl bg-muted/20">
                        <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/70">Contact Number</label>
                        <p className="font-bold text-xl">{profile?.mobile || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="animate-in slide-in-from-right-4 duration-500">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold font-display">Transaction History</h2>
                      <p className="text-sm text-muted-foreground mt-1">Review your past and current orders.</p>
                    </div>

                    {ordersLoading ? (
                      <div className="py-20 text-center text-muted-foreground font-display animate-pulse">Retreiving Orders...</div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                        <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-foreground">No Orders Found</h3>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Looks like you haven't indulged in our luxury collection yet.</p>
                        <Button
                          className="mt-8 btn-gold px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-transform"
                          onClick={() => navigate('/shop')}
                        >
                          Discover Shop
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: any) => (
                          <div
                            key={order.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border border-border rounded-2xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300 bg-card group relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                            <div className="space-y-1.5 flex-1 mb-4 sm:mb-0">
                              <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors uppercase">#ID {order.orderNumber}</p>
                              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Items</span>
                                <span>•</span>
                                <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </div>
                            <div className="text-left sm:text-right space-y-2 w-full sm:w-auto">
                              <p className="font-black text-2xl tracking-tighter">₹{(order.totalAmount + order.deliveryCharge).toLocaleString()}</p>
                              <div className="flex sm:justify-end">
                                <span className={getStatusColor(order.status)}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="animate-in slide-in-from-right-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                      <div>
                        <h2 className="text-2xl font-bold font-display">Manage Addresses</h2>
                        <p className="text-sm text-muted-foreground mt-1">Add or update your delivery destinations.</p>
                      </div>
                      {!showAddressForm && (
                        <Button size="lg" className="btn-gold rounded-xl shadow-lg font-bold px-6 py-6 transition-all hover:scale-105 active:scale-95" onClick={() => { setEditingAddressId(null); resetAddressForm(); setShowAddressForm(true); }}>
                          <Plus className="h-5 w-5 mr-2 stroke-[3px]" />
                          NEW ADDRESS
                        </Button>
                      )}
                    </div>

                    {showAddressForm ? (
                      <div className="p-8 border border-primary/20 rounded-2xl bg-primary/5 mb-10 shadow-inner animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-primary">
                            {editingAddressId ? 'REVISE LOCATION' : 'ENLIST NEW LOCATION'}
                          </h3>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Full Identity *</label>
                              <input
                                type="text"
                                name="name"
                                required
                                value={addressFormData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3.5 bg-background border-2 border-border/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                                placeholder="Recipient Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Mobile Access *</label>
                              <input
                                type="tel"
                                name="phone"
                                required
                                value={addressFormData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3.5 bg-background border-2 border-border/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                                placeholder="10-digit number"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Primary Landmark *</label>
                            <input
                              type="text"
                              name="addressLine1"
                              required
                              value={addressFormData.addressLine1}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-background border-2 border-border/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                              placeholder="Building, Suite, Street"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Extended Region (Optional)</label>
                            <input
                              type="text"
                              name="addressLine2"
                              value={addressFormData.addressLine2}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3.5 bg-background border-2 border-border/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                              placeholder="Area, Sector, Proximity"
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Metropolis *</label>
                              <input
                                type="text"
                                name="city"
                                required
                                value={addressFormData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3.5 bg-background border-2 border-border/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Province *</label>
                              <input
                                type="text"
                                name="state"
                                required
                                value={addressFormData.state}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3.5 bg-background border-2 border-border/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Pincode *</label>
                              <input
                                type="text"
                                name="zipCode"
                                required
                                value={addressFormData.zipCode}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3.5 bg-background border-2 border-border/50 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 pt-4">
                            <div className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                id="isDefault"
                                name="isDefault"
                                checked={addressFormData.isDefault}
                                onChange={handleInputChange}
                                className="h-6 w-6 rounded-lg border-2 border-border text-primary focus:ring-offset-2 focus:ring-primary cursor-pointer transition-all"
                              />
                              <label htmlFor="isDefault" className="ml-3 text-sm font-bold text-foreground cursor-pointer select-none">DESIGNATE AS PREFERRED DELIVERY DESTINATION</label>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-primary/10">
                            <Button type="submit" className="flex-1 btn-gold py-7 text-lg rounded-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                              {editingAddressId ? 'SAVE REVISIONS' : 'CONFIRM ADDRESS'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="flex-1 py-7 text-lg rounded-xl font-bold bg-muted/50 hover:bg-muted text-muted-foreground"
                              onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                            >
                              DISCARD
                            </Button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {addressLoading && addresses.length === 0 ? (
                          <div className="text-center py-20 text-muted-foreground font-display animate-pulse">Scanning Addresses...</div>
                        ) : addresses.length === 0 ? (
                          <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                            <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-foreground">No Locations Saved</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Store your delivery destinations for a seamless checkout experience.</p>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-6">
                            {addresses.map((addr: any) => (
                              <div key={addr.id} className="p-6 border border-border/60 rounded-2xl bg-card shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-500 relative group flex flex-col h-full">
                                {addr.isDefault && (
                                  <div className="absolute -top-3 left-6 flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                    PREFERRED
                                  </div>
                                )}

                                <div className="flex justify-between items-start pt-2">
                                  <div className="mb-6">
                                    <h4 className="font-black text-xl mb-1 tracking-tight text-foreground uppercase">{addr.name}</h4>
                                    <p className="text-xs font-black text-primary/80 flex items-center gap-2">
                                      <Phone className="h-3 w-3" /> {addr.phone}
                                    </p>
                                  </div>
                                  <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                    <MapPin className="h-5 w-5" />
                                  </div>
                                </div>

                                <div className="text-sm font-medium space-y-1 mb-10 text-muted-foreground/90 flex-1">
                                  <p className="text-foreground font-bold">{addr.addressLine1}</p>
                                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                  <p>{addr.city}, {addr.state}</p>
                                  <p className="font-black text-foreground">{addr.zipCode}</p>
                                  <p className="text-[10px] uppercase font-black tracking-tighter pt-3 opacity-60">{addr.country || 'INDIA Territory'}</p>
                                </div>

                                <div className="flex gap-6 border-t border-border/50 pt-6 mt-auto">
                                  <button
                                    onClick={() => handleEditAddress(addr)}
                                    className="text-[10px] font-black tracking-widest text-primary flex items-center gap-2 hover:scale-110 active:scale-95 transition-all"
                                  >
                                    <Edit className="h-4 w-4" />
                                    RE-LOCATE
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="text-[10px] font-black tracking-widest text-destructive flex items-center gap-2 hover:scale-110 active:scale-95 transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    ERASE
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="animate-in slide-in-from-right-4 duration-500">
                    <div className="mb-10">
                      <h2 className="text-2xl font-bold font-display">Luxury Wishlist</h2>
                      <p className="text-sm text-muted-foreground mt-1">Curation of your favorite items.</p>
                    </div>

                    {wishlistLoading ? (
                      <div className="py-20 text-center text-muted-foreground font-display animate-pulse">Synchronizing Favorites...</div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                        <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-foreground">Wishlist is Vacant</h3>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Personalize your collection by hearting the art you adore.</p>
                        <Button className="mt-8 btn-gold px-10 py-6 text-lg rounded-xl shadow-xl hover:scale-105 transition-transform" onClick={() => navigate('/shop')}>
                          Browse Collection
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {wishlist.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-6 p-5 border border-border/60 rounded-2xl hover:shadow-2xl hover:border-primary/40 transition-all duration-500 bg-card group relative"
                          >
                            <div className="relative overflow-hidden rounded-xl shadow-lg border border-border shrink-0 font-display">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-24 h-24 object-cover transform transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                                onClick={() => navigate(`/product/${item.product.id}`)}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-black text-lg truncate hover:text-primary cursor-pointer transition-colors uppercase tracking-tight"
                                onClick={() => navigate(`/product/${item.product.id}`)}
                              >
                                {item.product.name}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium leading-relaxed">
                                {item.product.description}
                              </p>
                              <div className="flex items-center gap-3 mt-4">
                                <span className="font-black text-xl text-primary tracking-tighter">
                                  ₹{item.product.price.toLocaleString()}
                                </span>
                                <div className="h-1 w-1 bg-border rounded-full"></div>
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{item.product.category?.name || 'GENERIC'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              <Button
                                size="sm"
                                className="btn-gold rounded-lg font-black text-[10px] tracking-widest uppercase hover:scale-105 transition-all"
                                onClick={() => navigate(`/product/${item.product.id}`)}
                              >
                                ACQUIRE
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
