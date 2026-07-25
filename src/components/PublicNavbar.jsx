import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '../lib/supabaseClient';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Phone, Mail, ArrowRight, Menu, X, ChevronRight, Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicNavbar() {
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchLatestNotices();
  }, []);

  const fetchLatestNotices = async () => {
    try {
      const { data } = await supabase
        .from('notices')
        .select('title, content')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setNotices(data);
      }
    } catch (e) {
      console.error('Error fetching notices for marquee:', e);
    }
  };

  const navLinks = [
    { href: '/notices', label: 'নোটিশ বোর্ড' },
    { href: '/#contact', label: 'যোগাযোগ' },
  ];

  const handleNavClick = () => setMobileMenuOpen(false);

  const marqueeText = notices.length > 0 
    ? notices.map(n => `📢 ${n.title}${n.content ? ' — ' + n.content : ''}`).join('   ✦   ')
    : `📢 ভর্তি সেশন ${settings.currentSession} চলমান! সকল শ্রেণিতে নতুন শিক্ষার্থী ভর্তি চলছে।`;

  return (
    <>
      {/* ─── Top Notice Marquee Bar ─── */}
      <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800 relative z-50 overflow-hidden">
        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3 px-4 py-1.5">
          
          {/* Latest Notice Badge & Marquee */}
          <div className="flex items-center gap-2.5 w-full overflow-hidden">
            <div className="bg-emerald-600 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md tracking-wide flex items-center gap-1.5 flex-shrink-0 animate-pulse shadow-sm">
              <Megaphone className="w-3.5 h-3.5 text-white" /> সর্বশেষ নোটিশ:
            </div>

            <div className="relative overflow-hidden w-full whitespace-nowrap">
              <marquee className="font-semibold text-emerald-300 text-xs tracking-wide">
                {marqueeText}
              </marquee>
            </div>
          </div>

          {/* Contact & Admission Info */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400 font-medium flex-shrink-0">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              {settings.phone}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold text-[10px]">
              সেশন {settings.currentSession}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Header / Navbar ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full bg-white p-0.5 shadow-md flex-shrink-0" 
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-white leading-tight truncate">
                {settings.madrasaNameBn}
              </h1>
              <p className="text-[10px] sm:text-xs text-emerald-400 font-medium hidden xs:block">মাদ্রাসা ব্যবস্থাপনা ইআরপি</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-300">
            <Link
              to="/"
              className={`transition-colors hover:text-emerald-400 ${
                location.pathname === '/' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              হোম
            </Link>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-emerald-400"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl px-5 h-10 shadow-lg shadow-emerald-900/20 text-xs">
                লগইন প্যানেল <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-slate-800 bg-slate-900 px-4 py-4 space-y-3 z-40 sticky top-[64px]"
          >
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={handleNavClick}
                className="px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 rounded-lg flex items-center justify-between"
              >
                <span>হোম</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link to="/login" onClick={handleNavClick}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-10 text-xs">
                  লগইন প্যানেল
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
