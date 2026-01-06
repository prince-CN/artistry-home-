import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';
import { ProductCard } from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { products, categories } from '@/data/products';

const Index = () => {
  // ✅ SHOW ALL PRODUCTS (no slice)
  const featuredProducts = products;

  return (
    <Layout>
      <Helmet>
        <title>Artistry Home - Premium Home Decor | Canvas Paintings, Crystal Art, Wallpapers</title>
        <meta
          name="description"
          content="Shop premium home decor at Artistry Home. Discover beautiful canvas paintings, crystal glass art, moving gear clocks, and designer wallpapers."
        />
      </Helmet>

      <HeroSection />

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse our Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of home decor items
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products (NOW ALL PRODUCTS) */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <div className="mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Our best-selling home decor pieces
            </p>
          </div>

          {/* ✅ ALL PHOTOS ON SAME PAGE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
