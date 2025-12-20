import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles, ArrowRight, Star, Store,
  Filter, ChevronLeft, ChevronRight, Zap, Award,
  Shield, Truck, ShoppingBag, Tag, Flame, Mail,
  Instagram, Twitter, Facebook, Youtube, CheckCircle, MapPin, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import useAuthStore from '../store/authStore';

// ==========================================
// 0. CONFIGURATION & UTILS
// ==========================================

const CATEGORY_IMAGES = {
  default: "https://images.unsplash.com/photo-1531297461136-82lw9z0u8e?q=80&w=1200&auto=format&fit=crop",
  tech: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1200&auto=format&fit=crop",
  mode: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
  maison: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1200&auto=format&fit=crop",
  art: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
  beaute: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1200&auto=format&fit=crop",
};

const resolveImage = (url, cat = 'default') => {
  if (!url) {
    const key = Object.keys(CATEGORY_IMAGES).find(k => cat?.toLowerCase().includes(k)) || 'default';
    return CATEGORY_IMAGES[key];
  }
  return url;
};

// ==========================================
// 1. ANIMATIONS
// ==========================================

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// ==========================================
// 2. SOUS-COMPOSANTS UI
// ==========================================

const SectionHeader = ({ title, subtitle, centered, action }) => (
  <motion.div
    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
    className={`mb-12 md:mb-20 px-4 ${centered ? 'text-center' : 'flex flex-col md:flex-row md:items-end justify-between gap-6'}`}
  >
    <div className="max-w-2xl">
      <span className="text-primary-600 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block flex items-center gap-2 justify-start">
        <Sparkles size={14} /> {subtitle}
      </span>
      {/* Responsive Typography: 4xl on mobile, 7xl on desktop */}
      <h2 className="text-4xl md:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight">{title}</h2>
    </div>
    {action && <motion.div variants={fadeInUp} className="self-start md:self-end">{action}</motion.div>}
  </motion.div>
);

const LazyImage = ({ src, alt, className, fallbackCategory }) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    setImgSrc(resolveImage(src, fallbackCategory));
  }, [src, fallbackCategory]);

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <div className={`absolute inset-0 bg-gray-300 animate-pulse transition-opacity duration-700 ${loaded ? 'opacity-0' : 'opacity-100'}`} />
      <img
        src={imgSrc} alt={alt} loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImgSrc(CATEGORY_IMAGES.default)}
        className={`w-full h-full object-cover transition-all duration-1000 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
      />
    </div>
  );
};

// ==========================================
// 3. BLOCS DE CONTENU (SECTIONS)
// ==========================================

const HeroSection = ({ isAuthenticated }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="relative min-h-[90vh] md:h-screen w-full overflow-hidden bg-black rounded-b-[40px] md:rounded-b-[80px] z-0">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2400&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col justify-end md:justify-center px-6 pb-20 md:pb-0 container mx-auto">
        <div className="max-w-5xl mx-auto text-center md:text-left pt-32 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-white font-bold text-xs tracking-[0.2em] uppercase">Nouvelle Collection 2025</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-[9rem] leading-[0.9] font-black text-white mb-8 tracking-tighter"
          >
            SOLO<br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">STACK.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-gray-300 max-w-xl md:max-w-2xl font-light mb-12 leading-relaxed md:ml-2"
          >
            La marketplace premium pour les créateurs indépendants. Découvrez l'excellence artisanale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link to="/search" className="w-full sm:w-auto px-8 py-4 md:py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all flex justify-center items-center gap-2">
              Explorer <ArrowRight size={20} />
            </Link>
            <Link to={isAuthenticated ? "/vendor/dashboard" : "/register"} className="w-full sm:w-auto px-8 py-4 md:py-5 border border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full font-bold text-lg hover:bg-white/10 transition flex justify-center items-center gap-2">
              <Store size={20} /> Espace Créateur
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const VisualCategoryGrid = ({ categories }) => {
  if (!categories?.length) return null;
  const cats = [{ id: 'all', name: 'Tout Voir', icon: Filter }, ...categories.slice(0, 4)];

  return (
    <div className="container mx-auto px-4 -mt-16 md:-mt-32 relative z-20 mb-24 md:mb-40">
      {/* Mobile: Horizontal Scroll (Snap) */}
      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }} 
        className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory hide-scrollbar"
      >
        {cats.map((cat, i) => (
          <motion.div
            key={cat.id}
            variants={fadeInUp}
            className={`min-w-[85vw] md:min-w-0 h-64 md:h-80 relative group rounded-[2rem] overflow-hidden cursor-pointer shadow-xl md:shadow-2xl snap-center ${i === 0 ? 'bg-gray-900' : ''}`}
          >
            <Link to={cat.id === 'all' ? '/search' : `/search?category=${cat.id}`} className="block h-full w-full relative">
              {cat.id !== 'all' && <LazyImage src={null} alt={cat.name} fallbackCategory={cat.name} className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" />}
              <div className={`absolute inset-0 transition-opacity duration-300 ${cat.id === 'all' ? 'bg-gray-900' : 'bg-black/30 group-hover:bg-black/50'}`} />

              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  {cat.id === 'all' ? <Filter size={20} /> : <Tag size={20} />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-2xl md:text-3xl mb-2">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                    Explorer <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const PromoBanner = () => (
  <section className="container mx-auto px-4 mb-24 md:mb-40">
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-20 gap-10 md:gap-0">
        <div className="text-white max-w-xl text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-white/20 mx-auto md:mx-0"
          >
            <Zap size={14} className="text-yellow-300 fill-yellow-300" /> Vente Flash
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black mb-6 leading-tight"
          >
            GRANDE <br /><span className="text-yellow-300">BRADERIE.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="text-lg md:text-xl text-red-50 mb-8 font-medium"
          >
            Jusqu'à <span className="font-black bg-white text-red-600 px-2 rounded">-70%</span> sur les pièces uniques.
          </motion.p>

          <Link
            to="/promotions"
            className="inline-flex w-full md:w-auto justify-center items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-red-700 transition-all shadow-lg"
          >
            Accéder aux offres <ArrowRight size={20} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          className="relative w-full md:w-auto flex justify-center"
        >
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop"
            alt="Soldes"
            className="relative w-64 md:w-96 rounded-3xl border-4 border-white/20 shadow-2xl rotate-3 md:rotate-6"
          />
          <div className="absolute bottom-4 -left-2 md:-left-6 bg-yellow-400 text-red-900 font-black text-lg md:text-xl px-6 py-3 rounded-xl shadow-lg -rotate-3 md:-rotate-6">
            Prix Cassés !
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const TrendingShowcase = ({ products }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!products?.length) return;
    const interval = setInterval(() => setIdx(i => (i + 1) % products.length), 5000);
    return () => clearInterval(interval);
  }, [products]);

  const next = () => setIdx((i) => (i + 1) % products.length);
  const prev = () => setIdx((i) => (i - 1 + products.length) % products.length);

  if (!products?.length) return null;
  const product = products[idx];

  return (
    <section className="container mx-auto px-4 mb-24 md:mb-40">
      <SectionHeader 
        title="La Sélection" 
        subtitle="Trending Now" 
        action={
          <Link to="/search?sort=trending" className="hidden md:flex group text-gray-900 font-bold gap-2 items-center hover:text-primary-600 transition">
            Voir tout <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-100 transition"><ArrowRight size={16} /></div>
          </Link>
        } 
      />

      <div className="bg-black text-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden min-h-[700px] md:min-h-[600px] flex flex-col lg:flex-row relative shadow-2xl">
        {/* Mobile: Image on TOP */}
        <div className="relative w-full h-[400px] lg:w-1/2 lg:h-auto bg-gray-900/50 order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full">
              <LazyImage src={product.image_url} alt={product.title} fallbackCategory={product.category_name} className="w-full h-full object-cover opacity-90" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-6 right-6 flex gap-3 z-10">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur flex items-center justify-center active:scale-90 transition"><ChevronLeft size={20}/></button>
            <button onClick={next} className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur flex items-center justify-center active:scale-90 transition"><ChevronRight size={20}/></button>
          </div>
        </div>

        {/* Content Bottom (Mobile) / Left (Desktop) */}
        <div className="relative z-10 w-full lg:w-1/2 p-8 md:p-20 flex flex-col justify-center order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div key={product.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Flame size={10}/> #1 Trending
                </span>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight truncate">{product.title}</h2>
              <p className="text-gray-400 text-lg md:text-xl mb-10 line-clamp-3 font-light leading-relaxed">{product.description}</p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">{product.base_price} €</span>
                <Link to={`/product/${product.id}`} className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-primary-500 hover:text-white transition-all flex justify-center items-center gap-3">
                  <ShoppingBag size={20} /> Acheter
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile only Link */}
      <div className="mt-8 text-center md:hidden">
         <Link to="/search?sort=trending" className="inline-flex items-center gap-2 font-bold underline">Tout voir <ArrowRight size={16}/></Link>
      </div>
    </section>
  );
};

const BenefitsSection = () => (
  <div className="container mx-auto px-4 mb-24 md:mb-40">
    <SectionHeader title="Nos Engagements" subtitle="Why SoloStack?" centered />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {[
        { icon: Shield, title: "Sécurité", desc: "Paiements cryptés et protection acheteur.", color: "text-emerald-500" },
        { icon: Truck, title: "Livraison", desc: "Expédition suivie sous 24/48h.", color: "text-blue-500" },
        { icon: Award, title: "Qualité", desc: "Produits vérifiés par nos experts.", color: "text-purple-500" },
      ].map((b, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -5 }}
          className="bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50"
        >
          <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 ${b.color}`}>
            <b.icon size={28} />
          </div>
          <h3 className="font-bold text-2xl mb-3 text-gray-900">{b.title}</h3>
          <p className="text-gray-500 text-lg leading-relaxed">{b.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const NewsletterSection = () => (
  <section className="container mx-auto px-4 mb-24">
    <div className="relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-black py-20 md:py-32 px-6 text-center text-white shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/50 to-purple-900/50 opacity-60" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <Mail className="w-12 h-12 mx-auto mb-6 text-primary-500" />
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Rejoignez le Club.</h2>
        <p className="text-lg md:text-xl text-gray-400 mb-10 font-light">Accès anticipé aux nouvelles collections.</p>

        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="votre@email.com" className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/10 backdrop-blur text-white placeholder-gray-500 focus:outline-none focus:bg-white/20 transition-all text-center sm:text-left" required />
          <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-primary-500 hover:text-white transition-all w-full sm:w-auto">
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  </section>
);

// ==========================================
// 4. MAIN COMPONENT (HOME)
// ==========================================

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState({ newArrivals: [], trending: [], topStores: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [home, prods, cats] = await Promise.all([
          api.get('/products/home-data'),
          api.get('/products?limit=20'),
          api.get('/products/categories'),
        ]);

        // Sécurité maximale pour éviter les crashs
        setData({
          newArrivals: Array.isArray(home?.data?.newArrivals) ? home.data.newArrivals : [],
          trending: Array.isArray(home?.data?.trending) ? home.data.trending : [],
          topStores: Array.isArray(home?.data?.topStores) ? home.data.topStores : [],
        });
        setCategories(Array.isArray(cats?.data) ? cats.data : []);
      } catch (err) {
        console.error('Erreur API:', err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-100 rounded-full border-t-black animate-spin"></div>
        <p className="text-sm font-bold tracking-widest uppercase">Chargement</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 overflow-x-hidden">
      <HeroSection isAuthenticated={isAuthenticated} />
      <VisualCategoryGrid categories={categories} />
      <PromoBanner />

      <TrendingShowcase products={data.trending} />

      {/* SECTION NOUVEAUTES */}
      <div className="container mx-auto px-4 mb-24 md:mb-40">
        <SectionHeader 
          title="Nouveautés" 
          subtitle="Fresh Drops" 
          action={<Link to="/search?sort=newest" className="hidden md:flex items-center gap-2 font-bold hover:text-primary-600 transition">Voir tout <ArrowRight size={16} /></Link>} 
        />
        
        {/* Grid Responsive : 1 col (Mobile) -> 2 cols (Tablet) -> 4 cols (Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-y-16">
          {(data?.newArrivals || []).slice(0, 8).map(p => (
            <motion.div key={p.id} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
             <Link to="/search?sort=newest" className="btn-secondary px-8 py-3 rounded-full border border-gray-300 font-bold">Voir tout le catalogue</Link>
        </div>
      </div>

      {/* SECTION BOUTIQUES */}
      <section className="container mx-auto px-4 mb-24 md:mb-40">
        <SectionHeader title="Créateurs Elite" subtitle="Certified Pros" centered />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(data?.topStores || []).slice(0, 4).map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
              <Link to={`/store/${s.id}`} className="block bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-100 hover:shadow-2xl transition-all border border-gray-50 group text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full border-4 border-gray-50 shadow-inner overflow-hidden mb-6">
                  <LazyImage src={s.logo_url} alt={s.name} className="w-full h-full" />
                </div>
                <h3 className="font-bold text-xl mb-1 text-gray-900 group-hover:text-primary-600 transition-colors">{s.name}</h3>
                <div className="flex justify-center gap-1 text-yellow-400 text-sm mb-4">
                    {[...Array(5)].map((_, x) => <Star key={x} size={12} fill="currentColor" />)}
                </div>
                <div className="inline-block px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-600">
                  {s.sales_count || 0} Ventes
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <BenefitsSection />
      <NewsletterSection />

      {/* FOOTER */}
      <footer className="bg-black text-white pt-20 pb-10 rounded-t-[3rem] md:rounded-t-[5rem]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-black">SOLO<span className="text-gray-500">STACK.</span></h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                La référence pour l'achat de créations uniques et indépendantes.
              </p>
              <div className="flex gap-4">
                {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Mobile: Stacked Links */}
            <div className="grid grid-cols-2 gap-8 md:contents">
                <div>
                  <h4 className="font-bold text-lg mb-6">Explorer</h4>
                  <ul className="space-y-4 text-gray-400 text-sm">
                    {['Nouveautés', 'Meilleures Ventes', 'Catégories', 'Créateurs'].map(item => (
                      <li key={item}><Link to="#" className="hover:text-white transition">{item}</Link></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-6">Aide</h4>
                  <ul className="space-y-4 text-gray-400 text-sm">
                    {['Commandes', 'Livraison', 'Retours', 'Contact'].map(item => (
                      <li key={item}><Link to="#" className="hover:text-white transition">{item}</Link></li>
                    ))}
                  </ul>
                </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-center gap-3"><MapPin size={16} /> Paris, France</li>
                <li className="flex items-center gap-3"><Mail size={16} /> hello@solostack.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs md:text-sm gap-4">
            <p>&copy; 2025 SoloStack. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link to="#">Confidentialité</Link>
              <Link to="#">CGV</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;