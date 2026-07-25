import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Phone, Mail, ArrowRight, Menu, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicNavbar() {
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/notices', label: 'নোটিশ বোর্ড' },
    { href: '/#contact', label: 'যোগাযোগ' },
  ];

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <>
      {/* ─── Top Contact Bar ─── */}
      <div className="bg-slate-950 text-slate-400 text-xs py-2 px-4 border-b border-slate-800 relative z-50">
        <div className="container mx-auto max-w-7xl flex justify-between items-center gap-2 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{settings.phone}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{settings.email}</span>
            </span>
          </div>
          <span className="text-emerald-400 font-semibold text-[11px] sm:text-xs whitespace-nowrap">
            ভর্তি সেশন {settings.currentSession} চলমান
          </span>
        </div>
      </div>

      {/* ─── Header / Navbar ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-900/30">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-white leading-tight truncate">
                {settings.madrasaNameBn}
              </h1>
              <p className="text-[10px] sm:text-xs text-emerald-400 font-medium hidden xs:block">মাদ্রাসা ব্যবস্থাপনা ইআরপি</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-300">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return link.href.startsWith('/#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-emerald-400 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`hover:text-emerald-400 transition-colors whitespace-nowrap ${
                    isActive ? 'text-emerald-400' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-900/40 px-5 h-10 rounded-xl text-sm">
                পোর্টালে প্রবেশ করুন <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile: Login + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link to="/login">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg h-8 px-3 text-xs">
                লগইন
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-md"
            >
              <nav className="px-4 py-3 space-y-1">
                {navLinks.map((link) =>
                  link.href.startsWith('/#') ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={handleNavClick}
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors font-medium text-sm"
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleNavClick}
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors font-medium text-sm"
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  )
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
