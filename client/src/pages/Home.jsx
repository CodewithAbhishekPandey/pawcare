import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';

const FEATURES = [
  { icon: '🏥', title: 'Verified Clinics', desc: 'Browse 50+ trusted vet clinics across Gurugram.' },
  { icon: '📅', title: 'Instant Booking', desc: 'Book appointments in seconds. Get confirmed slots.' },
  { icon: '🛒', title: 'Premium Pet Shop', desc: 'Shop top brands for food, medicine, and toys.' },
  { icon: '🐾', title: 'Pet Profiles', desc: 'Keep track of your pet\'s health history and meds.' },
];

const STATS = [
  { value: '50+', label: 'Verified Clinics' },
  { value: '500+', label: 'Pet Owners' },
  { value: '1200+', label: 'Appointments' },
  { value: '4.8★', label: 'Avg. Rating' },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring', bounce: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const Home = ({ settings = {} }) => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-[3rem] bg-[#FFF3B0] dark:bg-[#2D6A4F] transition-colors duration-500 shadow-2xl shadow-slate-200/50 dark:shadow-none mb-10 pb-20">
      
      {/* Decorative Blob */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FF9F1C]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/20 dark:bg-black/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-32 lg:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Typography */}
        <motion.div 
          className="z-10 text-center lg:text-left"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-5 py-2 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-full text-[#2D6A4F] dark:text-[#FFF3B0] text-sm font-black mb-6 uppercase tracking-wider">
            🐾 Gurugram's #1 Pet Platform
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-7xl lg:text-8xl font-black text-[#2D6A4F] dark:text-[#FFF3B0] mb-8 leading-[1.1] tracking-tight">
            {settings.homepage_banner_text ? (
              <span dangerouslySetInnerHTML={{ __html: settings.homepage_banner_text.replace('\n', '<br/>') }} />
            ) : (
              <>Premium Pet Care,<br />Delivered Daily.</>
            )}
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[#2D6A4F]/80 dark:text-[#FFF3B0]/80 font-bold max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
            {settings.homepage_banner_subtext || "Your pets deserve the best. Book vetted clinics, track appointments, and shop premium products."}
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link
              to="/vets"
              className="px-8 py-4 bg-[#FF9F1C] hover:bg-[#ff8c00] text-white font-black text-xl rounded-2xl shadow-xl shadow-[#FF9F1C]/40 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Find a Vet Clinic →
            </Link>
            <Link
              to="/shop"
              className="px-8 py-4 bg-white/60 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 text-[#2D6A4F] dark:text-[#FFF3B0] font-black text-xl rounded-2xl border-2 border-[#2D6A4F]/10 dark:border-[#FFF3B0]/10 backdrop-blur-md transition-all transform hover:-translate-y-1 active:scale-95"
            >
              🛒 Browse Shop
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: 3D Spline Scene */}
        <motion.div 
          className="relative h-[400px] lg:h-[600px] w-full z-0 cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring' }}
        >
          {/* We use a well-known lightweight interactive Spline 3D Dog scene */}
          <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" className="w-full h-full object-cover" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {STATS.map((s) => (
            <motion.div 
              key={s.label} 
              variants={fadeInUp}
              className="bg-white/60 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-[2rem] p-8 text-center shadow-xl shadow-[#2D6A4F]/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-white dark:hover:bg-black/30"
            >
              <p className="text-4xl lg:text-5xl font-black text-[#FF9F1C] mb-2">{s.value}</p>
              <p className="text-[#2D6A4F] dark:text-[#FFF3B0] text-sm lg:text-base font-bold uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-black text-[#2D6A4F] dark:text-[#FFF3B0] text-center mb-4">Everything Your Pet Needs</motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-[#2D6A4F]/70 dark:text-[#FFF3B0]/70 font-bold text-center mb-16">One platform for all your pet care needs in Gurugram</motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {FEATURES.map((f) => (
              <motion.div 
                key={f.title} 
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="bg-white/60 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-[#2D6A4F]/5 dark:shadow-none transition-all duration-300 backdrop-blur-md group"
              >
                <div className="text-5xl mb-6 inline-block p-4 bg-[#FFF3B0] dark:bg-[#2D6A4F] rounded-3xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">{f.icon}</div>
                <h3 className="text-2xl font-black text-[#2D6A4F] dark:text-[#FFF3B0] mb-3">{f.title}</h3>
                <p className="text-[#2D6A4F]/80 dark:text-[#FFF3B0]/80 text-lg font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-center bg-[#FF9F1C] rounded-[3rem] p-16 shadow-2xl shadow-[#FF9F1C]/30 relative overflow-hidden"
          >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent bg-[length:20px_20px]" />
            
            <div className="relative z-10">
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">Ready to join the pack?</h2>
              <p className="text-white/90 text-xl font-bold mb-10 max-w-lg mx-auto">Join thousands of pet owners across Gurugram giving their pets the best care.</p>
              <Link
                to="/register"
                className="px-12 py-5 bg-white text-[#FF9F1C] font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 inline-block"
              >
                Create Free Account 🐾
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default Home;
