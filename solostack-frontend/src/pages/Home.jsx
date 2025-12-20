import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useAnimation } from 'framer-motion';
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
// 1. ANIMATIONS AMÉLIORÉES
// ==========================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1 
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

// ==========================================
// 2. SOUS-COMPOSANTS UI OPTIMISÉS
// ==========================================

const SectionHeader = ({ title, subtitle, centered, action }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className={`mb-10 md:mb-16 px-4 ${
        centered 
          ? 'text-center mx-auto max-w-4xl' 
          : 'flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8'
      }`}
    >
      <motion.div 
        variants={fadeInUp}
        className={`${centered ? 'mx-auto' : 'flex-1'}`}
      >
        <motion.span 
          variants={fadeInUp}
          className="text-primary-600 font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 md:mb-4 block flex items-center gap-2 justify-center md:justify-start"
        >
          <Sparkles size={14} className="animate-pulse" /> {subtitle}
        </motion.span>
        <motion.h2 
          variants={fadeInUp}
          className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.1] md:leading-[0.95] tracking-tight"
        >
          {title}
        </motion.h2>
      </motion.div>
      {action && (
        <motion.div 
          variants={fadeInUp}
          className={`mt-6 md:mt-0 ${centered ? 'mx-auto' : 'self-start md:self-end'}`}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

const LazyImage = ({ src, alt, className, fallbackCategory }) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    setImgSrc(resolveImage(src, fallbackCategory));
  }, [src, fallbackCategory]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}
    >
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <motion.img
        src={imgSrc} 
        alt={alt} 
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImgSrc(CATEGORY_IMAGES.default)}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={loaded ? { 
          scale: 1, 
          opacity: 1,
          transition: { duration: 0.7, ease: "easeOut" }
        } : {}}
        className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </motion.div>
  );
};

// ==========================================
// 3. BLOCS DE CONTENU OPTIMISÉS
// ==========================================

const HeroSection = ({ isAuthenticated }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.05]);

  return (
    <div className="relative min-h-[85vh] md:min-h-screen w-full overflow-hidden bg-black rounded-b-[30px] md:rounded-b-[60px] lg:rounded-b-[80px] z-0">
      <motion.div 
        style={{ y, opacity, scale }} 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2400&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-80"
          alt="Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col justify-end md:justify-center px-4 sm:px-6 lg:px-8 pb-16 md:pb-0 container mx-auto">
        <div className="max-w-6xl mx-auto text-center md:text-left pt-24 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-lg mb-6 md:mb-8"
          >
            <motion.span 
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-white font-bold text-xs tracking-[0.2em] uppercase">
              Nouvelle Collection 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[9rem] leading-[0.9] font-black text-white mb-6 md:mb-8 tracking-tighter"
          >
            <span className="block">SOLO</span>
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-purple-500 to-primary-400"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              STACK.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 max-w-lg md:max-w-xl lg:max-w-2xl font-light mb-8 md:mb-12 leading-relaxed md:ml-1"
          >
            La marketplace premium pour les créateurs indépendants. Découvrez l'excellence artisanale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto md:mx-0"
          >
            <Link 
              to="/search" 
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-bold text-base md:text-lg hover:scale-105 transition-all flex justify-center items-center gap-2 group shadow-2xl"
            >
              <span>Explorer</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to={isAuthenticated ? "/vendor/dashboard" : "/register"} 
              className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-white/30 bg-white/10 backdrop-blur-md text-white rounded-full font-bold text-base md:text-lg hover:bg-white/20 transition-all flex justify-center items-center gap-2 group"
            >
              <Store size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Espace Créateur</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </div>
  );
};

const VisualCategoryGrid = ({ categories }) => {
  if (!categories?.length) return null;
  const cats = [{ id: 'all', name: 'Tout Voir', icon: Filter }, ...categories.slice(0, 4)];

  return (
    <div className="container mx-auto px-4 -mt-12 md:-mt-24 lg:-mt-32 relative z-20 mb-16 md:mb-32">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6"
      >
        {cats.map((cat, i) => (
          <motion.div
            key={cat.id}
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={`relative group rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-lg md:shadow-xl h-48 md:h-64 lg:h-72 ${
              i === 0 ? 'sm:col-span-2 lg:col-span-1 xl:col-span-1' : ''
            }`}
          >
            <Link 
              to={cat.id === 'all' ? '/search' : `/search?category=${cat.id}`} 
              className="block h-full w-full relative"
            >
              {cat.id !== 'all' && (
                <LazyImage 
                  src={null} 
                  alt={cat.name} 
                  fallbackCategory={cat.name} 
                  className="absolute inset-0"
                />
              )}
              <div className={`absolute inset-0 transition-all duration-300 ${
                cat.id === 'all' 
                  ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
                  : 'bg-gradient-to-t from-black/70 via-black/40 to-transparent group-hover:from-black/80'
              }`} />

              <div className="absolute inset-0 p-4 md:p-6 lg:p-8 flex flex-col justify-between">
                <motion.div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {cat.id === 'all' ? <Filter size={18} /> : <Tag size={18} />}
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-xl md:text-2xl lg:text-3xl mb-2">
                    {cat.name}
                  </h3>
                  <motion.div 
                    className="flex items-center gap-2 text-white/80 text-sm md:text-base font-medium"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Explorer <ArrowRight size={16} />
                  </motion.div>
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
  <section className="container mx-auto px-4 mb-16 md:mb-32">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 shadow-xl md:shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-yellow-300/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-6 md:p-8 lg:p-12 xl:p-20 gap-8 lg:gap-12">
        <div className="text-white text-center lg:text-left max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider mb-4 md:mb-6 border border-white/20"
          >
            <Zap size={14} className="text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>Vente Flash</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 leading-tight"
          >
            GRANDE <br /><span className="text-yellow-300">BRADERIE</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-red-50 mb-6 md:mb-8 font-medium"
          >
            Jusqu'à <span className="font-black bg-white text-red-600 px-2 md:px-3 py-1 rounded">-70%</span> sur les pièces uniques
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/promotions"
              className="inline-flex w-full lg:w-auto justify-center items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-red-600 rounded-full font-bold text-base md:text-lg hover:bg-yellow-300 hover:text-red-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <span>Accéder aux offres</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full lg:w-auto flex justify-center lg:justify-end"
        >
          <div className="relative w-56 h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop"
              alt="Soldes"
              className="w-full h-full object-cover rounded-2xl md:rounded-3xl border-4 border-white/20 shadow-2xl"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-4 -right-4 bg-yellow-400 text-red-900 font-black text-lg md:text-xl px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-xl -rotate-3"
            >
              Prix Cassés !
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </section>
);

const TrendingShowcase = ({ products }) => {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!products?.length) return;
    const interval = setInterval(() => {
      setDirection(1);
      setIdx(i => (i + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  const next = () => {
    setDirection(1);
    setIdx((i) => (i + 1) % products.length);
  };
  
  const prev = () => {
    setDirection(-1);
    setIdx((i) => (i - 1 + products.length) % products.length);
  };

  if (!products?.length) return null;
  const product = products[idx];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <section className="container mx-auto px-4 mb-16 md:mb-32">
      <SectionHeader 
        title="La Sélection" 
        subtitle="Trending Now" 
        action={
          <Link to="/search?sort=trending" className="hidden md:flex group text-gray-900 font-bold gap-3 items-center hover:text-primary-600 transition">
            <span>Voir tout</span>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-100 transition group-hover:scale-110">
              <ArrowRight size={18} />
            </div>
          </Link>
        } 
      />

      <div className="bg-black text-white rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] overflow-hidden min-h-[500px] md:min-h-[600px] flex flex-col lg:flex-row relative shadow-2xl">
        {/* Image Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-auto lg:w-1/2 bg-gray-900/50 order-1 lg:order-2">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div 
              key={product.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <LazyImage 
                src={product.image_url} 
                alt={product.title} 
                fallbackCategory={product.category_name} 
                className="w-full h-full object-cover opacity-90"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-2 z-10">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur flex items-center justify-center hover:bg-white/20 transition"
            >
              <ChevronLeft size={20}/>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 bg-black/60 backdrop-blur flex items-center justify-center hover:bg-white/20 transition"
            >
              <ChevronRight size={20}/>
            </motion.button>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 w-full lg:w-1/2 p-6 md:p-8 lg:p-12 xl:p-16 flex flex-col justify-center order-2 lg:order-1">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div 
              key={product.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              className="max-w-lg"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Flame size={12}/> #1 Trending
                </motion.span>
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-4 md:mb-6 leading-tight line-clamp-2">
                {product.title}
              </h2>
              <p className="text-gray-400 text-sm md:text-base lg:text-lg mb-6 md:mb-8 line-clamp-3 font-light leading-relaxed">
                {product.description}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
                >
                  {product.base_price} €
                </motion.span>
                <Link 
                  to={`/product/${product.id}`}
                  className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-bold hover:bg-primary-500 hover:text-white transition-all flex justify-center items-center gap-3 group shadow-lg"
                >
                  <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                  <span>Acheter</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile Action Link */}
      <div className="mt-8 text-center md:hidden">
        <Link 
          to="/search?sort=trending" 
          className="inline-flex items-center gap-2 font-bold text-gray-700 hover:text-primary-600 transition px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          Tout voir <ArrowRight size={16}/>
        </Link>
      </div>
    </section>
  );
};

const BenefitsSection = () => (
  <div className="container mx-auto px-4 mb-16 md:mb-32">
    <SectionHeader title="Nos Engagements" subtitle="Why SoloStack?" centered />
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
    >
      {[
        { icon: Shield, title: "Sécurité", desc: "Paiements cryptés et protection acheteur.", color: "text-emerald-500", bg: "bg-emerald-50" },
        { icon: Truck, title: "Livraison", desc: "Expédition suivie sous 24/48h.", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Award, title: "Qualité", desc: "Produits vérifiés par nos experts.", color: "text-purple-500", bg: "bg-purple-50" },
      ].map((b, i) => (
        <motion.div
          key={i}
          variants={fadeInUp}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
        >
          <motion.div 
            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${b.bg} flex items-center justify-center mb-4 md:mb-6 ${b.color}`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <b.icon size={24} className="md:w-7 md:h-7" />
          </motion.div>
          <h3 className="font-bold text-xl md:text-2xl mb-2 md:mb-3 text-gray-900">{b.title}</h3>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">{b.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <section className="container mx-auto px-4 mb-16 md:mb-24">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-gray-900 to-black py-12 md:py-16 lg:py-20 px-6 md:px-8 text-center text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/30 to-purple-900/30 opacity-50" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Mail className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-4 md:mb-6 text-primary-400" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 tracking-tight"
          >
            Rejoignez le Club
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base lg:text-lg text-gray-400 mb-6 md:mb-8 font-light max-w-md mx-auto"
          >
            Accès anticipé aux nouvelles collections et offres exclusives
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto"
          >
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com" 
              className="flex-grow px-4 md:px-6 py-3 md:py-4 rounded-full bg-white/10 border border-white/10 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm md:text-base"
              required 
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-full font-bold hover:from-primary-600 hover:to-purple-700 transition-all text-sm md:text-base shadow-lg"
            >
              S'inscrire
            </motion.button>
          </motion.form>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xs text-gray-500 mt-4"
          >
            En vous inscrivant, vous acceptez notre politique de confidentialité
          </motion.p>
        </div>
      </motion.div>
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

        setData({
          newArrivals: Array.isArray(home?.data?.newArrivals) ? home.data.newArrivals : [],
          trending: Array.isArray(home?.data?.trending) ? home.data.trending : [],
          topStores: Array.isArray(home?.data?.topStores) ? home.data.topStores : [],
        });
        setCategories(Array.isArray(cats?.data) ? cats.data : []);
      } catch (err) {
        console.error('Erreur API:', err);
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-gray-50 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 md:w-16 md:h-16 border-3 md:border-4 border-gray-200 rounded-full border-t-primary-500"
        />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-bold tracking-widest uppercase text-gray-600"
        >
          Chargement
        </motion.p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 font-sans text-gray-900 overflow-x-hidden">
      <HeroSection isAuthenticated={isAuthenticated} />
      <VisualCategoryGrid categories={categories} />
      <PromoBanner />

      <TrendingShowcase products={data.trending} />

      {/* SECTION NOUVEAUTES */}
      <div className="container mx-auto px-4 mb-16 md:mb-32">
        <SectionHeader 
          title="Nouveautés" 
          subtitle="Fresh Drops" 
          action={
            <Link to="/search?sort=newest" className="hidden md:flex items-center gap-3 font-bold text-gray-700 hover:text-primary-600 transition group">
              <span>Voir tout</span>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary-100 transition group-hover:scale-110">
                <ArrowRight size={18} />
              </div>
            </Link>
          } 
        />
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
        >
          {(data?.newArrivals || []).slice(0, 8).map((p, i) => (
            <motion.div 
              key={p.id} 
              variants={fadeInUp}
              custom={i}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-8 text-center md:hidden">
          <Link 
            to="/search?sort=newest" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 font-bold text-gray-700 hover:border-primary-500 hover:text-primary-600 transition"
          >
            Voir tout le catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* SECTION BOUTIQUES */}
      <section className="container mx-auto px-4 mb-16 md:mb-32">
        <SectionHeader title="Créateurs Elite" subtitle="Certified Pros" centered />
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {(data?.topStores || []).slice(0, 4).map((s, i) => (
            <motion.div 
              key={s.id} 
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link 
                to={`/store/${s.id}`} 
                className="block bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-all border border-gray-100 group text-center h-full"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full blur opacity-50 group-hover:opacity-70 transition-opacity" />
                  <div className="relative w-full h-full rounded-full border-3 border-white shadow-inner overflow-hidden">
                    <LazyImage src={s.logo_url} alt={s.name} className="w-full h-full" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-1 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {s.name}
                </h3>
                <div className="flex justify-center gap-0.5 text-yellow-400 text-sm mb-3">
                  {[...Array(5)].map((_, x) => (
                    <Star key={x} size={12} fill="currentColor" />
                  ))}
                </div>
                <div className="inline-block px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  {s.sales_count || 0} Ventes
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <BenefitsSection />
      <NewsletterSection />

      {/* FOOTER RESPONSIVE */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white pt-12 md:pt-16 lg:pt-20 pb-8 md:pb-10 rounded-t-2xl md:rounded-t-3xl lg:rounded-t-[3rem]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12 md:mb-16">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <h3 className="text-2xl md:text-3xl font-black">
                SOLO<span className="text-gray-400">STACK.</span>
              </h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">
                La référence pour l'achat de créations uniques et indépendantes. Excellence artisanale depuis 2023.
              </p>
              <div className="flex gap-3 md:gap-4">
                {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                  >
                    <Icon size={16} className="md:w-5 md:h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
            
            {/* Navigation Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 md:mb-6">Explorer</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                {['Nouveautés', 'Meilleures Ventes', 'Catégories', 'Créateurs'].map(item => (
                  <motion.li 
                    key={item}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Link to="#" className="hover:text-white transition">{item}</Link>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4 md:mb-6">Aide</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                {['Commandes', 'Livraison', 'Retours', 'Contact'].map(item => (
                  <motion.li 
                    key={item}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Link to="#" className="hover:text-white transition">{item}</Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 md:mb-6">Contact</h4>
              <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                <li className="flex items-center gap-3">
                  <MapPin size={16} />
                  <span>Paris, France</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} />
                  <span>hello@solostack.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs md:text-sm gap-4">
            <p>&copy; 2025 SoloStack. Tous droits réservés.</p>
            <div className="flex gap-4 md:gap-6">
              <Link to="#" className="hover:text-white transition">Confidentialité</Link>
              <Link to="#" className="hover:text-white transition">CGV</Link>
              <Link to="#" className="hover:text-white transition">Mentions légales</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;