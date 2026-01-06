import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/redux/product/action';
import { fetchCategories } from '@/redux/category/action';

import ShopSidebar from '@/components/ShopSidebar';
import { Button } from '@/components/ui/button';
import { products as mockProducts, categories as mockCategories } from '@/data/products';

const Shop = () => {
  const { category } = useParams();
  const [sortBy, setSortBy] = useState('default');
  const dispatch = useDispatch();

  // Extremely defensive selectors
  const productState = useSelector((state: any) => state?.product) || {};
  console.log("Shop.tsx render - productState:", productState);
  const categoryState = useSelector((state: any) => state?.category) || {};

  const apiProducts = Array.isArray(productState.products) ? productState.products : [];
  const apiCategories = Array.isArray(categoryState.categories) ? categoryState.categories : [];
  const loading = !!productState.loading || !!categoryState.loading;

  useEffect(() => {
    try {
      dispatch(fetchCategories());
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  }, [dispatch]);

  useEffect(() => {
    try {
      dispatch(fetchProducts({ category }));
    } catch (e) {
      console.error("Failed to fetch products", e);
    }
  }, [dispatch, category]);

  try {
    // Use API categories if available, else fallback to mocks
    const activeCategories = apiCategories.length > 0 ? apiCategories : mockCategories;

    const currentCategory = category
      ? activeCategories.find((c: any) => c?.slug === category)
      : null;

    // FALLBACK LOGIC: If API returns empty, use Mock Products filtered by category
    let displayProducts = apiProducts.length > 0 ? apiProducts : [];

    if (!loading && displayProducts.length === 0) {
      if (category) {
        displayProducts = mockProducts.filter((p: any) => p.categorySlug === category);
      } else {
        displayProducts = mockProducts;
      }
    }

    // Final safety check
    const safeProducts = Array.isArray(displayProducts) ? displayProducts : [];

    // SORTING
    let sortedProducts = [...safeProducts];
    try {
      switch (sortBy) {
        case 'price-low':
          sortedProducts.sort((a: any, b: any) => (a?.price || 0) - (b?.price || 0));
          break;
        case 'price-high':
          sortedProducts.sort((a: any, b: any) => (b?.price || 0) - (a?.price || 0));
          break;
        case 'rating':
          sortedProducts.sort((a: any, b: any) => (b?.rating || 0) - (a?.rating || 0));
          break;
      }
    } catch (sortErr) {
      sortedProducts = safeProducts;
    }

    return (
      <Layout>
        <Helmet>
          <title>
            {currentCategory?.name
              ? `${currentCategory.name} | Artistry Home`
              : category ? `${category.replace(/-/g, ' ').toUpperCase()} | Artistry Home` : 'Shop | Artistry Home'}
          </title>
        </Helmet>

        {/* BREADCRUMB header */}
        <section className="bg-secondary/30 py-8 border-b border-border">
          <div className="container px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">HOME</Link>
              <ChevronRight className="h-4 w-4" />
              {category ? (
                <>
                  <Link to="/shop" className="hover:text-primary">SHOP</Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground font-medium uppercase">
                    {currentCategory?.name || category.replace(/-/g, ' ')}
                  </span>
                </>
              ) : (
                <span className="text-foreground font-medium">SHOP</span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {currentCategory?.name || (category ? category.replace(/-/g, ' ').toUpperCase() : 'Shop Online')}
            </h1>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <section className="py-12 bg-background">
          <div className="container px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

              {/* SIDEBAR */}
              <aside className="hidden lg:block col-span-1">
                <ShopSidebar />
              </aside>

              {/* PRODUCT GRID */}
              <main className="col-span-1 lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <p className="text-muted-foreground">
                    Showing {sortedProducts.length} results
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 bg-card border-border">
                      <SelectValue placeholder="Default sorting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default sorting</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">By Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-80 bg-secondary animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : sortedProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {sortedProducts.map((product: any) => (
                      <ProductCard key={product.id || Math.random()} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border rounded-lg">
                    <p className="text-lg mb-4 text-muted-foreground">No products found.</p>
                    <Link to="/shop"><Button variant="outline">View All Products</Button></Link>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>
      </Layout>
    );
  } catch (err) {
    console.error("Shop Component Crash:", err);
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong loading the shop.</h2>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </Layout>
    );
  }
};

export default Shop;
