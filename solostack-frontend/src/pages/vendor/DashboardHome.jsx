import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, Star, Eye } from 'lucide-react'; // Ajout Eye
import { motion } from 'framer-motion';
import api from '../../api/axios';
import StarRating from '../../components/ui/StarRating';
// Import Recharts (laisse tes imports graphiques ici)
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
  >
    <div className={`p-4 rounded-xl ${color} text-white shadow-lg shadow-gray-200`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const [stats, setStats] = useState({
    total_revenue: 0, total_orders: 0, total_products: 0, average_rating: 0, total_views: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
            api.get('/stores/stats'),
            api.get('/stores/chart')
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 animate-pulse">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
      <p className="text-gray-500 mb-8">Aperçu de vos performances</p>
      
      {/* GRILLE DE 5 STATS MAINTENANT */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Revenus" value={`${parseFloat(stats.total_revenue).toFixed(2)} €`} color="bg-green-500" delay={0} />
        <StatCard icon={ShoppingBag} label="Ventes" value={stats.total_orders} color="bg-blue-500" delay={0.1} />
        <StatCard icon={Package} label="Produits" value={stats.total_products} color="bg-purple-500" delay={0.2} />
        <StatCard icon={Eye} label="Visites" value={stats.total_views || 0} color="bg-cyan-500" delay={0.3} />
        <StatCard 
          icon={Star} 
          label="Avis" 
          value={<div className="flex items-center gap-1"><span>{parseFloat(stats.average_rating || 0).toFixed(1)}</span><StarRating rating={Math.round(stats.average_rating)} size={12}/></div>} 
          color="bg-yellow-400" 
          delay={0.4} 
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 h-80">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Revenus de la semaine</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="day_name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
            <Tooltip />
            <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardHome;