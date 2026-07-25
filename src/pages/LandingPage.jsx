import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ShieldCheck, UserCheck, Bell, ArrowRight,
  Building2, Users, HeartHandshake, Award, Phone, Mail, MapPin,
  CheckCircle2, GraduationCap, Star, Menu, X, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const { settings } = useSettings();
  const [notices, setNotices] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0 });
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPublicData();
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    const onScroll = () => { if (mobileMenuOpen) setMobileMenuOpen(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileMenuOpen]);

  const fetchPublicData = async () => {
    try {
      const { data: noticeData } = await supabase
        .from('notices').select('*').order('created_at', { ascending: false }).limit(5);
      if (noticeData) setNotices(noticeData);

      const { data: teacherData } = await supabase
        .from('profiles').select('*').eq('role', 'teacher');
      if (teacherData) setDbTeachers(teacherData);

      const { count: studentCount } = await supabase
        .from('students').select('*', { count: 'exact', head: true });
      const { count: teacherCount } = await supabase
        .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');

      setStats({ students: studentCount || 0, teachers: teacherCount || 0 });
    } catch (error) {
      console.error('Error fetching public data:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const navLinks = [
    { href: '#about',      label: 'পরিচিতি' },
    { href: '#programs',   label: 'শিক্ষা স্তর' },
    { href: '#teachers',   label: 'শিক্ষকমণ্ডলী' },
    { href: '#notices',    label: 'নোটিশ বোর্ড' },
    { href: '#facilities', label: 'সুবিধাসমূহ' },
    { href: '#contact',    label: 'যোগাযোগ' },
  ];

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* ─── Top Contact Bar ─── */}
      <div className="bg-slate-950 text-slate-400 text-xs py-2 px-4 border-b border-slate-800">
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

      {/* ─── Navbar ─── */}
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
            {navLinks.map(link => (
              <a key={link.href} href={link.href}
                className="hover:text-emerald-400 transition-colors whitespace-nowrap">
                {link.label}
              </a>
            ))}
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
                {navLinks.map(link => (
                  <a key={link.href} href={link.href} onClick={handleNavClick}
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors font-medium text-sm">
                    {link.label}
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <Badge variant="outline"
              className="mb-5 sm:mb-6 rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-emerald-300 backdrop-blur-md inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              অভিভাবক, শিক্ষক ও শিক্ষার্থীদের অনলাইন পোর্টাল
            </Badge>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              {settings.madrasaNameBn}
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                মাদ্রাসা এডুকেশন ম্যানেজমেন্ট
              </span>
            </h1>

            <p className="mx-auto mt-5 sm:mt-6 max-w-3xl text-sm sm:text-lg text-slate-300 leading-relaxed font-normal px-2">
              {settings.slogan || 'ইসলামী শিক্ষা ও সুন্নাহ চর্চার পাশাপাশি আধুনিক তথ্যপ্রযুক্তি, বিজ্ঞান ও গণিত শিক্ষার এক অনন্য সমন্বয়। শিক্ষার্থীদের দৈনিক উপস্থিতি, শ্রেণির সময়সূচি, পরীক্ষার ফলাফল এবং ফি রশিদ এখন অনলাইনে সহজলভ্য।'}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xl shadow-emerald-900/50 font-bold tracking-wide">
                  পোর্টালে প্রবেশ করুন <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <a href="#notices" className="w-full sm:w-auto">
                <Button variant="outline" size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl font-semibold">
                  নোটিশ বোর্ড দেখুন
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
            {[
              { value: `${stats.students}+`, label: 'ভর্তিষ্কৃত শিক্ষার্থী', icon: UserCheck, color: 'text-emerald-400' },
              { value: `${stats.teachers}+`, label: 'অভিজ্ঞ শিক্ষক মণ্ডলী', icon: BookOpen, color: 'text-teal-400' },
              { value: '১০০%',              label: 'সমাপনী পাসের হার',       icon: ShieldCheck, color: 'text-cyan-400' },
              { value: settings.establishedYear || '১৯৮৫', label: 'প্রতিষ্ঠার সন (Est.)', icon: Award, color: 'text-amber-400' },
            ].map((stat, i) => (
              <Card key={i} className="bg-slate-800/60 border-slate-700/60 backdrop-blur-md">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className={`text-2xl sm:text-4xl font-extrabold mb-1 ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-medium text-slate-300 flex items-center justify-center gap-1">
                    <stat.icon className={`h-3.5 w-3.5 flex-shrink-0 ${stat.color}`} />
                    <span className="leading-tight">{stat.label}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About Section ─── */}
      <section id="about" className="py-14 sm:py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">আমাদের পরিচিতি ও রূপকল্প</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">{settings.madrasaNameBn} সম্পর্কে</h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              {settings.establishedYear} সালে প্রতিষ্ঠিত {settings.madrasaNameBn} একটি ঐতিহ্যবাহী ইসলামী শিক্ষা প্রতিষ্ঠান। {settings.slogan}।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                icon: BookOpen, color: 'emerald',
                title: 'সহীহ দ্বীনি শিক্ষা',
                desc: 'তাজবীদসহ কুরআন তেলাওয়াত, মাসআলা-মাসায়েল, তাফসীর ও সাহাবিগণের আদর্শ অনুশীলনে সুদৃঢ় নৈতিক ভিত্তি তৈরি করা হয়।',
              },
              {
                icon: HeartHandshake, color: 'teal',
                title: 'অভিভাবকদের সরাসরি আপডেট',
                desc: 'অনলাইন পোর্টালের মাধ্যমে পিতা-মাতা যেকোনো স্থান থেকে সন্তানের ক্লাসে উপস্থিতি, মার্কশিট ও ফি সংক্রান্ত তথ্য জানতে পারেন।',
              },
              {
                icon: Award, color: 'cyan',
                title: 'জাতীয় ও আন্তর্জাতিক অর্জন',
                desc: 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড এবং জাতীয় ক্বিরাত ও হেফজ প্রতিযোগিতায় আমাদের শিক্ষার্থীরা প্রতি বছর মেধা তালিকায় শীর্ষ স্থান অধিকার করে।',
              },
            ].map(({ icon: Icon, color, title, desc }, i) => (
              <Card key={i} className="bg-slate-900/80 border-slate-800 p-5 sm:p-6 rounded-2xl">
                <div className={`p-3 bg-${color}-500/10 text-${color}-400 w-fit rounded-xl mb-4 border border-${color}-500/20`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Programs Section ─── */}
      <section id="programs" className="py-14 sm:py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">আমাদের একাডেমিক বিভাগ</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">শিক্ষা স্তরাবলী ও কোর্সসমূহ</h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">প্রাথমিক হিফজ থেকে শুরু করে উচ্চতর ফাজিল ও কামিল পর্যন্ত সার্বিক শিক্ষা কারিকুলাম</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { badge: 'হিফজুল কুরআন', badgeColor: 'emerald', title: 'হিফজ ও ক্বিরাত বিভাগ', desc: 'আন্তর্জাতিক মানের ক্বারী ও হাফেজ সাহেবদের তত্ত্বাবধানে হিফজ প্রদান।', meta: 'বয়স: ৬-১২ বছর', metaColor: 'emerald' },
              { badge: 'প্রাথমিক',     badgeColor: 'teal',    title: 'ইবতেদায়ী শাখা (১ম-৫ম)',    desc: 'মৌলিক কায়েদা, আমপারা, বাংলা, ইংরেজি, গণিত ও পরিবেশ পরিচিতি।',    meta: 'সরকারি সমাপনী সমমান', metaColor: 'teal' },
              { badge: 'মাধ্যমিক',    badgeColor: 'cyan',    title: 'দাখিল ও আলিম (৬ষ্ঠ-১২শ)', desc: 'আরবি সাহিত্য, ফিকাহ, বিজ্ঞান ও সাধারণ মানবিক শিক্ষা সমন্বিত শাখা।', meta: 'সাধারণ ও বিজ্ঞান বিভাগ', metaColor: 'cyan' },
              { badge: 'উচ্চতর',      badgeColor: 'purple',  title: 'ফাজিল ও ডিগ্রী',           desc: 'ইসলামিক তাফসীর, হাদীস গবেষণা ও আরবি ভাষায় উচ্চতর ডিগ্রি কারিকুলাম।', meta: 'ইসলামিক ইউনিভার্সিটি অধিভুক্ত', metaColor: 'purple' },
            ].map(({ badge, badgeColor, title, desc, meta, metaColor }, i) => (
              <Card key={i} className="bg-slate-800/80 border-slate-700/80 p-5 sm:p-6 rounded-2xl">
                <Badge className={`bg-${badgeColor}-500/20 text-${badgeColor}-300 border-${badgeColor}-500/30 mb-3 text-xs`}>{badge}</Badge>
                <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{desc}</p>
                <span className={`text-xs text-${metaColor}-400 font-semibold flex items-center gap-1`}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> {meta}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Teachers Section ─── */}
      <section id="teachers" className="py-14 sm:py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">আমাদের শিক্ষকমণ্ডলী</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">দক্ষ ও নিবেদিতপ্রাণ শিক্ষকবৃন্দ</h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              অভিজ্ঞ আলেম, মুহাদ্দিস ও আধুনিক বিশ্ববিদ্যালয়ের ডিগ্রিধারী শিক্ষকবৃন্দের তত্ত্বাবধানে পাঠদান
            </p>
          </div>

          {loadingTeachers ? (
            <div className="text-center py-12 text-slate-500">শিক্ষক তথ্য লোড হচ্ছে...</div>
          ) : dbTeachers.length === 0 ? (
            <div className="text-center py-12 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-lg mx-auto">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base">কোনো নিবন্ধিত শিক্ষক পাওয়া যায়নি</h4>
              <p className="text-slate-400 text-xs mt-1">অ্যাডমিন প্যানেল (ম্যানেজ শিক্ষক) থেকে নতুন শিক্ষক নিবন্ধন করলে তা এখানে সরাসরি প্রদর্শিত হবে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {dbTeachers.map((teacher, index) => (
                <Card key={teacher.id || index}
                  className="bg-slate-900/90 border-slate-800 p-5 sm:p-6 text-center rounded-2xl hover:border-emerald-500/50 transition-all shadow-xl group">
                  <Avatar className="h-20 w-20 sm:h-28 sm:w-28 mx-auto mb-4 border-2 border-emerald-500/40 shadow-xl group-hover:scale-105 transition-transform overflow-hidden">
                    <AvatarImage
                      src={teacher.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.full_name_en || teacher.full_name_bn || 'Teacher'}&style=circle`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-slate-800 text-emerald-400 font-bold text-xl">
                      {(teacher.full_name_bn || teacher.full_name_en || 'T')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-emerald-400 transition-colors">
                    {teacher.full_name_bn || teacher.full_name_en || 'সম্মানিত শিক্ষক'}
                  </h3>
                  <p className="text-emerald-400 text-xs font-semibold mt-1">
                    {teacher.designation || teacher.role || 'শিক্ষক'}
                  </p>
                  <div className="mt-3 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <p className="font-mono text-emerald-300 text-[11px]">{teacher.phone_primary || teacher.email || 'ইনস্টিটিউট শিক্ষক'}</p>
                    <Badge variant="outline" className="mt-2 border-emerald-500/20 text-emerald-300 text-[10px] bg-emerald-500/10">
                      সক্রিয় শিক্ষক
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Facilities Section ─── */}
      <section id="facilities" className="py-14 sm:py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">ক্যাম্পাস সুবিধাসমূহ</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">আধুনিক সুবিধা ও পরিকাঠামো</h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">শিক্ষার্থীদের পড়াশোনা ও সুস্বাস্থ্যের জন্য আমাদের বিশেষ উদ্যোগ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: 'আধুনিক হিফজ ল্যাব',      desc: 'সাউন্ড প্রুফ অডিও ল্যাব ও আন্তর্জাতিক কারীদের অডিও রেকর্ডিং শোনার আধুনিক ডিজিটাল অবকাঠামো।' },
              { title: 'কম্পিউটার ও আইসিটি ল্যাব', desc: '২৪ ঘণ্টা হাই স্পিড ইন্টারনেটসহ ৩০+ ব্র্যান্ডের আধুনিক কম্পিউটার সংবলিত প্র্যাকটিক্যাল ল্যাব।' },
              { title: 'ইসলামী কেন্দ্রীয় লাইব্রেরি', desc: '১০,০০০+ বিরল তাফসীর, হাদীসের কিতাব ও আধুনিক সাহিত্যের বিশাল কালেকশন সংবলিত লাইব্রেরি।' },
            ].map(({ title, desc }, i) => (
              <div key={i} className="bg-slate-800/80 border border-slate-700/80 p-5 sm:p-6 rounded-2xl">
                <h4 className="font-bold text-white text-base sm:text-lg mb-2">{title}</h4>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Notice Board ─── */}
      <section id="notices" className="py-14 sm:py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">অফিশিয়াল নোটিশ বোর্ড</h2>
                <p className="text-xs text-slate-400 mt-0.5">অভিভাবক ও শিক্ষার্থীদের জন্য সর্বশেষ বিজ্ঞপ্তি</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 self-start sm:self-auto">লাইভ আপডেট</Badge>
          </div>

          <Card className="bg-slate-900/90 border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              {notices.length === 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { title: 'পবিত্র ঈদুল ফিতর উপলক্ষে মাদ্রাসা ছুটির নোটিশ ২০২৬', date: '২০২৬-০৩-২০', desc: 'সকল ছাত্র ও অভিভাবকদের অবগতির জন্য জানানো যাচ্ছে যে আগামী ২৩শে মার্চ থেকে ৫ই এপ্রিল পর্যন্ত ক্লাস বন্ধ থাকবে।' },
                    { title: 'প্রথম সাময়িক পরীক্ষার সময়সূচি ও প্রবেশপত্র বিতরণ',    date: '২০২৬-০৩-১৫', desc: 'সকল শ্রেণির প্রথম সাময়িক পরীক্ষা আগামী ১০ই এপ্রিল থেকে শুরু হবে। প্রবেশপত্র অফিস কক্ষ থেকে সংগ্রহ করুন।' },
                  ].map((n, i) => (
                    <div key={i} className="p-3 sm:p-4 border border-slate-800 bg-slate-950/40 rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                        <h4 className="font-bold text-white text-sm sm:text-base leading-snug">{n.title}</h4>
                        <Badge variant="secondary" className="bg-slate-800 text-emerald-400 text-xs flex-shrink-0 self-start">{n.date}</Badge>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {notices.map((notice) => (
                    <AccordionItem key={notice.id} value={notice.id} className="border-slate-800">
                      <AccordionTrigger className="hover:no-underline hover:text-emerald-400 text-slate-100 py-3 sm:py-4 transition-colors text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full pr-3">
                          <span className="font-semibold text-sm sm:text-lg leading-snug">{notice.title}</span>
                          <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs w-fit flex-shrink-0">
                            {new Date(notice.created_at).toLocaleDateString('bn-BD')}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2 pb-4 border-t border-slate-800/80">
                        <div dangerouslySetInnerHTML={{ __html: notice.content_html || notice.content }} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Contact Section ─── */}
      <section id="contact" className="py-14 sm:py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-start lg:items-center">
            <div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">যোগাযোগ</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">মাদ্রাসার অবস্থান ও যোগাযোগ</h2>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed mb-6 sm:mb-8">
                ভর্তি তথ্য, মেধা বৃত্তির আবেদন ও অভিভাবক আলোচনার জন্য সরাসরি যোগাযোগ করুন অথবা মাদ্রাসার অফিস রুমে চলে আসুন।
              </p>

              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: MapPin, title: 'ঠিকানা', value: settings.address },
                  { icon: Phone, title: 'হটলাইন ও ভর্তি নম্বর', value: `${settings.phone}${settings.altPhone ? `, ${settings.altPhone}` : ''}` },
                  { icon: Mail, title: 'ইমেইল', value: settings.email },
                ].map(({ icon: Icon, title, value }, i) => (
                  <div key={i} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h5 className="font-bold text-white text-sm">{title}</h5>
                      <p className="text-xs text-slate-400 mt-0.5 break-words">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-slate-800/90 border-slate-700 p-5 sm:p-8 rounded-2xl shadow-2xl">
              <CardHeader className="p-0 mb-5 sm:mb-6">
                <CardTitle className="text-lg sm:text-xl font-bold text-white">ভর্তি সংক্রান্ত প্রাথমিক জিজ্ঞাসা</CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-1">আপনার কোনো বার্তা পাঠাতে নিচে তথ্য দিন</CardDescription>
              </CardHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); alert('ধন্যবাদ! আপনার বার্তাটি আমাদের অফিস কক্ষে পাঠানো হয়েছে।'); }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">অভিভাবকের নাম</label>
                  <input type="text" placeholder="যেমন: আব্দুর রহমান"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">মোবাইল নম্বর</label>
                  <input type="tel" placeholder="০১৭০০-০০০-০০০"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">বার্তা / প্রশ্ন</label>
                  <textarea rows={3} placeholder="যেমন: ইবতেদায়ী ৩য় শ্রেণিতে কি সিট খালি আছে?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none" required />
                </div>
                <Button type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl transition-colors">
                  বার্তা প্রেরণ করুন
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-950 text-slate-400 py-8 sm:py-10 border-t border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold text-white">{settings.madrasaNameBn}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              © {new Date().getFullYear()} {settings.madrasaNameBn} | সর্বস্বত্ব সংরক্ষিত
            </p>
            <Link to="/login" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
              পোর্টাল লগইন →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
