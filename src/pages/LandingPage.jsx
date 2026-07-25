import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ShieldCheck, UserCheck, Bell, ArrowRight,
  Building2, Users, HeartHandshake, Award, Phone, Mail, MapPin,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PublicNavbar from '../components/PublicNavbar';

export default function LandingPage() {
  const { settings } = useSettings();
  const [notices, setNotices] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      const { data: noticeData } = await supabase
        .from('notices').select('*').order('created_at', { ascending: false }).limit(5);
      if (noticeData) setNotices(noticeData);

      const { data: teacherData } = await supabase
        .from('profiles').select('*').eq('role', 'teacher');
      if (teacherData) setDbTeachers(teacherData);
    } catch (error) {
      console.error('Error fetching public data:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Shared Public Navbar */}
      <PublicNavbar />

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
              <Link to="/notices" className="w-full sm:w-auto">
                <Button variant="outline" size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl font-semibold">
                  নোটিশ বোর্ড দেখুন
                </Button>
              </Link>
            </div>
          </motion.div>
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
            ].map(({ icon: Icon, title, desc }, i) => (
              <Card key={i} className="bg-slate-900/80 border-slate-800 p-5 sm:p-6 rounded-2xl">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-xl mb-4 border border-emerald-500/20">
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
              { badge: 'হিফজুল কুরআন', badgeColor: 'emerald', title: 'হিফজ ও ক্বিরাত বিভাগ', desc: 'আন্তর্জাতিক মানের ক্বারী ও হাফেজ সাহেবদের তত্ত্বাবধানে হিফজ প্রদান।', meta: 'বয়স: ৬-১২ বছর' },
              { badge: 'প্রাথমিক',     badgeColor: 'teal',    title: 'ইবতেদায়ী শাখা (১ম-৫ম)',    desc: 'মৌলিক কায়েদা, আমপারা, বাংলা, ইংরেজি, গণিত ও পরিবেশ পরিচিতি।',    meta: 'সরকারি সমাপনী সমমান' },
              { badge: 'মাধ্যমিক',    badgeColor: 'cyan',    title: 'দাখিল ও আলিম (৬ষ্ঠ-১২শ)', desc: 'আরবি সাহিত্য, ফিকাহ, বিজ্ঞান ও সাধারণ মানবিক শিক্ষা সমন্বিত শাখা।', meta: 'সাধারণ ও বিজ্ঞান বিভাগ' },
              { badge: 'উচ্চতর',      badgeColor: 'purple',  title: 'ফাজিল ও ডিগ্রী',           desc: 'ইসলামিক তাফসীর, হাদীস গবেষণা ও আরবি ভাষায় উচ্চতর ডিগ্রি কারিকুলাম।', meta: 'ইসলামিক ইউনিভার্সিটি অধিভুক্ত' },
            ].map(({ badge, title, desc, meta }, i) => (
              <Card key={i} className="bg-slate-800/80 border-slate-700/80 p-5 sm:p-6 rounded-2xl">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3 text-xs">{badge}</Badge>
                <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{desc}</p>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
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
              <p className="text-slate-400 text-xs mt-1">অ্যাডমিন প্যানেল থেকে নতুন শিক্ষক নিবন্ধন করলে তা এখানে সরাসরি প্রদর্শিত হবে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {dbTeachers.map((teacher, index) => (
                <Card key={teacher.id || index}
                  className="bg-slate-900/90 border-slate-800 p-5 sm:p-6 text-center rounded-2xl hover:border-emerald-500/50 transition-all shadow-xl group">
                  <div className="relative mx-auto mb-4 w-fit group-hover:scale-105 transition-transform">
                    {teacher.avatar_url ? (
                      <Avatar className="h-24 w-24 sm:h-28 sm:w-28 mx-auto border-2 border-emerald-500/40 shadow-xl overflow-hidden">
                        <AvatarImage src={teacher.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-slate-800 text-emerald-400 font-bold text-xl">
                          {(teacher.full_name_bn || teacher.full_name_en || 'T')[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-24 w-24 sm:h-28 sm:w-28 mx-auto rounded-full bg-gradient-to-tr from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 p-1 shadow-xl flex items-center justify-center overflow-hidden">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-300">
                          <circle cx="50" cy="50" r="48" fill="#090d16" />
                          <circle cx="50" cy="50" r="44" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.5" />
                          <path d="M 18 95 C 18 68, 30 63, 50 63 C 70 63, 82 68, 82 95 Z" fill="#ffffff" />
                          <path d="M 42 63 L 50 76 L 58 63 Z" fill="#e2e8f0" />
                          <rect x="44" y="50" width="12" height="15" rx="3" fill="#f5d0a9" />
                          <path d="M 33 40 C 33 65, 67 65, 67 40 C 67 40, 60 47, 50 47 C 40 47, 33 40, 33 40 Z" fill="#1e293b" />
                          <path d="M 36 42 C 36 62, 64 62, 64 42 C 64 42, 58 46, 50 46 C 42 46, 36 42, 36 42 Z" fill="#334155" />
                          <ellipse cx="50" cy="38" rx="14" ry="16" fill="#f5d0a9" />
                          <path d="M 40 31 Q 44 29 46 32" stroke="#1e293b" strokeWidth="1.5" fill="none" />
                          <path d="M 60 31 Q 56 29 54 32" stroke="#1e293b" strokeWidth="1.5" fill="none" />
                          <circle cx="43" cy="35" r="1.5" fill="#1e293b" />
                          <circle cx="57" cy="35" r="1.5" fill="#1e293b" />
                          <path d="M 45 42 Q 50 45 55 42" stroke="#1e293b" strokeWidth="1.2" fill="none" />
                          <path d="M 33 30 C 33 16, 67 16, 67 30 C 67 30, 60 25, 50 25 C 40 25, 33 30, 33 30 Z" fill="#ffffff" />
                          <path d="M 33 30 L 67 30" stroke="#cbd5e1" strokeWidth="1.5" />
                        </svg>
                      </div>
                    )}
                  </div>
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
              <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain rounded-full bg-white p-0.5" />
              <span className="font-semibold text-white text-xs sm:text-sm">{settings.madrasaNameBn}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} {settings.madrasaNameBn} | Developed By: <span className="font-bold text-white">Md Arif Uddin</span> | <a href="https://wa.me/8801825334505" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline font-mono inline-flex items-center gap-1">💬 01825334505</a>
            </p>
            <Link to="/login" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-semibold">
              পোর্টাল লগইন →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
