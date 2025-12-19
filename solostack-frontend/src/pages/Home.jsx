import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Search, Sparkles, TrendingUp, ArrowRight, Star, Store,
  Filter, ChevronLeft, ChevronRight, Zap, Award,
  Shield, Truck, Heart, ShoppingBag, Tag, Flame, Mail,
  Instagram, Twitter, Facebook, Youtube, CheckCircle, MapPin, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import useAuthStore from '../store/authStore';

// ==========================================
// 0. CONFIGURATION
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
// 1. ANIMATIONS & UTILITAIRES
// ==========================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
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
    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
    className={`mb-16 ${centered ? 'text-center' : 'flex flex-col md:flex-row justify-between items-end gap-4'}`}
  >
    <div>
      <span className="text-primary-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block flex items-center gap-2 justify-center md:justify-start">
        <Sparkles size={12} /> {subtitle}
      </span>
      <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">{title}</h2>
    </div>
    {action && <motion.div variants={fadeInUp}>{action}</motion.div>}
  </motion.div>
);

const LazyImage = ({ src, alt, className, fallbackCategory }) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    setImgSrc(resolveImage(src, fallbackCategory));
  }, [src, fallbackCategory]);

  return (
    <div className={`relative overflow-hidden ${className} bg-gray-100`}>
      <div className={`absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-700 ${loaded ? 'opacity-0' : 'opacity-100'}`} />
      <img
        src={imgSrc} alt={alt} loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImgSrc(CATEGORY_IMAGES.default)}
        className={`w-full h-full object-cover transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
      />
    </div>
  );
};

// ==========================================
// 3. BLOCS DE CONTENU (SECTIONS)
// ==========================================

const HeroSection = ({ isAuthenticated }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.5]);

  return (
    <div className="relative h-[95vh] w-full overflow-hidden bg-gray-900 rounded-b-[60px] shadow-2xl z-0">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8 shadow-lg"
        >
          <Sparkles className="text-yellow-400 fill-yellow-400 animate-pulse" size={14} />
          <span className="font-bold text-xs tracking-[0.2em] uppercase">Collection 2025</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-7xl md:text-[10rem] font-black mb-8 leading-[0.85] tracking-tighter"
        >
          SOLO<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500">STACK.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-200 max-w-2xl font-light mb-12 leading-relaxed"
        >
          L'excellence artisanale rencontre le digital. Découvrez des créations uniques.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/search" className="group px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] flex items-center gap-2">
            Explorer <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          <Link to={isAuthenticated ? "/vendor/dashboard" : "/register"} className="px-10 py-5 border border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full font-bold text-lg hover:bg-white/10 transition flex items-center gap-2">
            <Store size={20} /> Espace Créateur
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

const VisualCategoryGrid = ({ categories }) => {
  if (!categories?.length) return null;
  const cats = [{ id: 'all', name: 'Tout Voir', icon: Filter }, ...categories.slice(0, 4)];

  return (
    <div className="container mx-auto px-4 -mt-32 relative z-20 mb-32">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {cats.map((cat, i) => (
          <motion.div
            key={cat.id}
            variants={fadeInUp}
            className={`h-72 relative group rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl ${i === 0 ? 'md:col-span-1 bg-gray-900' : ''}`}
          >
            <Link to={cat.id === 'all' ? '/search' : `/search?category=${cat.id}`} className="block h-full w-full relative">
              {cat.id !== 'all' && <LazyImage src={null} alt={cat.name} fallbackCategory={cat.name} className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" />}
              <div className={`absolute inset-0 transition-opacity duration-300 ${cat.id === 'all' ? 'bg-gray-900' : 'bg-black/30 group-hover:bg-black/50'}`} />

              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  {cat.id === 'all' ? <Filter size={20} /> : <Tag size={20} />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-2xl mb-2">{cat.name}</h3>
                  <div className="flex items-center gap-2 text-white/70 text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
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
  <section className="container mx-auto px-4 mb-40">
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-red-600 to-orange-600 shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 md:p-20">
        <div className="text-white max-w-xl text-center md:text-left mb-10 md:mb-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6 border border-white/20"
          >
            <Zap size={16} className="text-yellow-300 fill-yellow-300" /> Offres Limitées
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            GRANDE <br /><span className="text-yellow-300">BRADERIE.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xl text-red-100 mb-8 font-medium"
          >
            Jusqu'à <span className="font-black bg-white text-red-600 px-2 rounded">-70%</span> sur une sélection de produits uniques.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link
              to="/promotions"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Voir les Promotions <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, rotate: 0, x: 50 }} whileInView={{ opacity: 1, rotate: 6, x: 0 }} transition={{ delay: 0.4, type: "spring" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-black/20 blur-xl rounded-full scale-90"></div>
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
            alt="Soldes"
            className="relative w-80 md:w-96 rounded-3xl border-4 border-white/20 shadow-2xl"
          />
          <div className="absolute -bottom-6 -left-6 bg-yellow-400 text-red-900 font-black text-xl px-6 py-3 rounded-xl shadow-lg -rotate-6 animate-bounce">
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
    const interval = setInterval(() => setIdx(i => (i + 1) % products.length), 6000);
    return () => clearInterval(interval);
  }, [products]);

  const next = () => setIdx((i) => (i + 1) % products.length);
  const prev = () => setIdx((i) => (i - 1 + products.length) % products.length);

  if (!products?.length) return null;
  const product = products[idx];

  return (
    <section className="container mx-auto px-4 mb-40">
      <SectionHeader title="La Sélection Hebdo" subtitle="Trending" action={<Link to="/search?sort=trending" className="group text-gray-900 font-bold flex gap-2 items-center hover:text-primary-600 transition">Voir tout <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-100 transition"><ArrowRight size={14} /></div></Link>} />

      <div className="bg-black text-white rounded-[3rem] overflow-hidden min-h-[600px] flex flex-col lg:flex-row relative shadow-2xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 w-full lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={product.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/30">
                  <Flame size={12} /> #1 Trending
                </span>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </div>

              <h2 className="text-5xl lg:text-7xl font-black mb-6 leading-[0.9]">{product.title}</h2>
              <p className="text-gray-400 text-xl mb-10 line-clamp-3 font-light leading-relaxed">{product.description}</p>

              <div className="flex flex-wrap items-center gap-8">
                <span className="text-5xl font-bold tracking-tight">{product.base_price} €</span>
                <Link to={`/product/${product.id}`} className="px-10 py-5 bg-white text-black rounded-full font-bold hover:bg-primary-500 hover:text-white transition-all shadow-xl hover:shadow-primary-500/30 flex items-center gap-3 group">
                  <ShoppingBag size={20} className="group-hover:animate-bounce" /> Acheter maintenant
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative w-full lg:w-1/2 h-[500px] lg:h-auto bg-gray-900/50">
          <AnimatePresence mode="wait">
            <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full">
              <LazyImage src={product.image_url} alt={product.title} fallbackCategory={product.category_name} className="w-full h-full object-cover opacity-90" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-10 right-10 flex gap-4">
            <button onClick={prev} className="w-14 h-14 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all"><ChevronLeft size={24} /></button>
            <button onClick={next} className="w-14 h-14 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all"><ChevronRight size={24} /></button>
          </div>
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => (
  <div className="container mx-auto px-4 mb-40">
    <SectionHeader title="Pourquoi SoloStack ?" subtitle="Engagements" centered />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { icon: Shield, title: "Sécurité Totale", desc: "Transactions cryptées de bout en bout.", color: "text-emerald-500" },
        { icon: Truck, title: "Livraison Express", desc: "Expédition suivie sous 24h.", color: "text-blue-500" },
        { icon: Award, title: "Qualité Premium", desc: "Chaque produit est vérifié.", color: "text-purple-500" },
      ].map((b, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -10 }}
          className="bg-white p-10 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 hover:border-primary-100 transition-all group"
        >
          <div className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${b.color}`}>
            <b.icon size={32} />
          </div>
          <h3 className="font-bold text-2xl mb-3 text-gray-900">{b.title}</h3>
          <p className="text-gray-500 leading-relaxed text-lg">{b.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const NewsletterSection = () => {
  const [status, setStatus] = useState('idle');
  const handleSubmit = (e) => { e.preventDefault(); setStatus('loading'); setTimeout(() => setStatus('success'), 1500); };

  return (
    <section className="container mx-auto px-4 mb-32">
      <div className="relative rounded-[3rem] overflow-hidden bg-black py-24 px-6 text-center text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 to-purple-900/40" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <Mail className="w-12 h-12 mx-auto mb-6 text-primary-500" />
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Le Club Privé.</h2>
          <p className="text-xl text-gray-400 mb-10 font-light">Accédez aux ventes privées et découvrez les créateurs de demain avant tout le monde.</p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="votre@email.com" className="flex-grow px-8 py-4 rounded-full bg-white/10 border border-white/10 backdrop-blur text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:bg-white/20 transition-all" required />
            <button className="px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-primary-500 hover:text-white transition-all flex justify-center items-center gap-2 shadow-lg shadow-white/10">
              {status === 'loading' ? '...' : status === 'success' ? <CheckCircle size={20} /> : 'Rejoindre'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

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
        setData(home.data || { newArrivals: [], trending: [], topStores: [] });
        setCategories(cats.data || []);
      } catch (err) {
        console.error('Erreur API:', err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
        <div className="w-20 h-20 border-4 border-primary-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 selection:bg-primary-500 selection:text-white overflow-x-hidden">
      <HeroSection isAuthenticated={isAuthenticated} />
      <VisualCategoryGrid categories={categories} />
      <PromoBanner />

      {/* 1. Correction Trending (Sécurisé) */}
      <TrendingShowcase products={data?.trending || []} />

      {/* 2. Correction Nouveautés (Sécurisé) */}
      <div className="container mx-auto px-4 mb-40">
        <SectionHeader title="Nouveautés" subtitle="Fresh Drops" action={<Link to="/search?sort=newest" className="group flex items-center gap-2 font-bold hover:text-primary-600 transition">Catalogue complet <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></Link>} />
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {(data?.newArrivals || []).slice(0, 8).map(p => (
            <motion.div key={p.id} variants={fadeInUp}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 3. Correction Boutiques VIP (Sécurisé) */}
      <section className="container mx-auto px-4 mb-40">
        <SectionHeader title="Créateurs Certifiés" subtitle="Elite" centered action={<Link to="/stores" className="text-primary-600 font-bold flex gap-2 justify-center mt-6">Voir les boutiques <ArrowRight size={16} /></Link>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(data?.topStores || []).slice(0, 4).map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -8 }}>
              <Link to={`/store/${s.id}`} className="block bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all border border-gray-100 group text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gray-50" />
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-lg overflow-hidden mb-6 bg-white">
                    <LazyImage src={s.logo_url} alt={s.name} className="w-full h-full" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">{s.name}</h3>
                  <div className="flex justify-center gap-1 text-yellow-400 text-sm mb-6">{[...Array(5)].map((_, x) => <Star key={x} size={14} fill="currentColor" />)}</div>
                  <div className="flex justify-between items-center text-xs font-bold bg-gray-50 p-4 rounded-xl text-gray-600">
                    <span>{s.sales_count || 0} Ventes</span>
                    <span className="text-primary-600 flex items-center gap-1">Visiter <ArrowRight size={12} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <BenefitsSection />
      <NewsletterSection />

      <footer className="bg-black text-white pt-24 pb-12 rounded-t-[4rem]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <h3 className="text-3xl font-black tracking-tighter">SOLO<span className="text-primary-500">STACK.</span></h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                La première marketplace dédiée aux créateurs indépendants. Qualité, authenticité et passion.
              </p>
              <div className="flex gap-4">
                {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Explorer</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                {['Nouveautés', 'Meilleures Ventes', 'Toutes les catégories', 'Créateurs'].map(item => (
                  <li key={item}><Link to="/search" className="hover:text-white hover:translate-x-1 transition-all inline-block">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Aide</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                {['Centre d\'aide', 'Suivre ma commande', 'Retours & Remboursements', 'Nous contacter'].map(item => (
                  <li key={item}><Link to="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-center gap-3"><MapPin size={18} className="text-primary-500" /> Paris, France</li>
                <li className="flex items-center gap-3"><Phone size={18} className="text-primary-500" /> +33 1 23 45 67 89</li>
                <li className="flex items-center gap-3"><Mail size={18} className="text-primary-500" /> hello@solostack.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>&copy; 2025 SoloStack Market. Tous droits réservés.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link to="#" className="hover:text-white transition">Confidentialité</Link>
              <Link to="#" className="hover:text-white transition">CGV</Link>
              <Link to="#" className="hover:text-white transition">Mentions Légales</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;