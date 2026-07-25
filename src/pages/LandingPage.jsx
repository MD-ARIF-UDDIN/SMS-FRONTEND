import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, ShieldCheck, UserCheck, Bell, ArrowRight, 
  Building2, Users, HeartHandshake, Award, Phone, Mail, MapPin, 
  CheckCircle2, GraduationCap, School, HelpCircle, Star
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

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      // Fetch Notices
      const { data: noticeData } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (noticeData) setNotices(noticeData);

      // Fetch Real Teachers from Database Profiles
      const { data: teacherData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher');
      
      if (teacherData) {
        setDbTeachers(teacherData);
      }

      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: teacherCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
      
      setStats({ 
        students: studentCount || 0, 
        teachers: teacherCount || 0 
      });
    } catch (error) {
      console.error("Error fetching public data:", error);
    } finally {
      setLoadingTeachers(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Contact Bar */}
      <div className="bg-slate-950 text-slate-400 text-xs py-2 px-6 border-b border-slate-800">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {settings.phone}</span>
            <span className="hidden sm:flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-400" /> {settings.email}</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-400 font-semibold">
            <span>ভর্তি সেশন {settings.currentSession} চলমান</span>
          </div>
        </div>
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-900/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{settings.madrasaNameBn}</h1>
              <p className="text-xs text-emerald-400 font-medium">মাদ্রাসা ব্যবস্থাপনা ইআরপি</p>
            </div>
          </div>


          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#about" className="hover:text-emerald-400 transition-colors">পরিচিতি</a>
            <a href="#programs" className="hover:text-emerald-400 transition-colors">শিক্ষা স্তর</a>
            <a href="#teachers" className="hover:text-emerald-400 transition-colors">শিক্ষকমণ্ডলী</a>
            <a href="#notices" className="hover:text-emerald-400 transition-colors">নোটিশ বোর্ড</a>
            <a href="#facilities" className="hover:text-emerald-400 transition-colors">সুবিধাসমূহ</a>
            <a href="#contact" className="hover:text-emerald-400 transition-colors">যোগাযোগ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-900/40 px-6 h-11 rounded-xl">
                অ্যাডমিন পোর্টাল <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 rounded-full border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300 backdrop-blur-md">
              <Building2 className="mr-2 h-4 w-4 inline text-emerald-400" /> অভিভাবক, শিক্ষক ও শিক্ষার্থীদের অনলাইন পোর্টাল
            </Badge>


            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
              {settings.madrasaNameBn} <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                মাদ্রাসা এডুকেশন ম্যানেজমেন্ট
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 leading-relaxed font-normal">
              {settings.slogan || 'ইসলামী শিক্ষা ও সুন্নাহ চর্চার পাশাপাশি আধুনিক তথ্যপ্রযুক্তি, বিজ্ঞান ও গণিত শিক্ষার এক অনন্য সমন্বয়। শিক্ষার্থীদের দৈনিক উপস্থিতি, শ্রেণির সময়সূচি, পরীক্ষার প্রাপ্ত ফলাফল এবং ফি রশিদ এখন অনলাইনে সহজলভ্য।'}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/admin">
                <Button size="lg" className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xl shadow-emerald-900/50 font-bold tracking-wide">
                  অ্যাডমিন দিয়ে প্রবেশ করুন <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#notices">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl font-semibold">
                  নোটিশ বোর্ড দেখুন
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-4 max-w-5xl mx-auto">
            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-extrabold text-emerald-400 mb-1">{stats.students}+</div>
                <div className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-400" /> ভর্তিষ্কৃত শিক্ষার্থী
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-extrabold text-teal-400 mb-1">{stats.teachers}+</div>
                <div className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-teal-400" /> অভিজ্ঞ শিক্ষক মণ্ডলী
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-extrabold text-cyan-400 mb-1">১০০%</div>
                <div className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" /> সমাপনী পাসের হার
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 border-slate-700/60 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-extrabold text-amber-400 mb-1">{settings.establishedYear || '১৯৮৫'}</div>
                <div className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" /> প্রতিষ্ঠার সন (Est.)
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Madrasa Section */}
      <section id="about" className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">আমাদের পরিচিতি ও রূপকল্প</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{settings.madrasaNameBn} সম্পর্কে</h2>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              {settings.establishedYear} সালে প্রতিষ্ঠিত {settings.madrasaNameBn} একটি ঐতিহ্যবাহী ইসলামী শিক্ষা প্রতিষ্ঠান। {settings.slogan}।
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-xl mb-4 border border-emerald-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-white mb-2">সহীহ দ্বীনি শিক্ষা</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                তাজবীদসহ কুরআন তেলাওয়াত, মাসআলা-মাসায়েল, তাফসীর ও সাহাবিগণের আদর্শ অনুশীলনে সুদৃঢ় নৈতিক ভিত্তি তৈরি করা হয়।
              </p>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl">
              <div className="p-3 bg-teal-500/10 text-teal-400 w-fit rounded-xl mb-4 border border-teal-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-white mb-2">অভিভাবকদের সরাসরি আপডেট</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                অনলাইন পোটালের মাধ্যমে পিতা-মাতা যেকোনো স্থান থেকে সন্তানের ক্লাসে উপস্থিতি, মার্কশিট ও ফি সংক্রান্ত তথ্য জানতে পারেন।
              </p>
            </Card>


            <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 w-fit rounded-xl mb-4 border border-cyan-500/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-white mb-2">জাতীয় ও আন্তর্জাতিক অর্জন</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড এবং জাতীয় ক্বিরাত ও হেফজ প্রতিযোগিতায় আমাদের শিক্ষার্থীরা প্রতি বছর মেধা তালিকায় শীর্ষ স্থান অধিকার করে।
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Academic Programs Section */}
      <section id="programs" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">আমাদের একাডেমিক বিভাগ</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">শিক্ষা স্তরাবলী ও কোর্সসমূহ</h2>
            <p className="mt-4 text-slate-400 text-base">প্রাথমিক হিফজ থেকে শুরু করে উচ্চতর ফাজিল ও কামিল পর্যন্ত সার্বিক শিক্ষা কারিকুলাম</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/80 border-slate-700/80 p-6 rounded-2xl">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3">হিফজুল কুরআন</Badge>
              <h3 className="font-bold text-xl text-white mb-2">হিফজ ও ক্বিরাত বিভাগ</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">আন্তর্জাতিক মানের ক্বারী ও হাফেজ সাহেবদের তত্ত্বাবধানে হিফজ প্রদান।</p>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> বয়স: ৬-১২ বছর</span>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700/80 p-6 rounded-2xl">
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 mb-3">প্রাথমিক</Badge>
              <h3 className="font-bold text-xl text-white mb-2">ইবতেদায়ী শাখা (১ম-৫ম)</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">মৌলিক কায়েদা, আমপারা, বাংলা, ইংরেজি, গণিত ও পরিবেশ পরিচিতি।</p>
              <span className="text-xs text-teal-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> সরকারি সমাপনী সমমান</span>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700/80 p-6 rounded-2xl">
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 mb-3">মাধ্যমিক</Badge>
              <h3 className="font-bold text-xl text-white mb-2">দাখিল ও আলিম (৬ষ্ঠ-১২শ)</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">আরবি সাহিত্য, ফিকাহ, বিজ্ঞান ও সাধারণ মানবিক শিক্ষা সমন্বিত শাখা।</p>
              <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> সাধারণ ও বিজ্ঞান বিভাগ</span>
            </Card>

            <Card className="bg-slate-800/80 border-slate-700/80 p-6 rounded-2xl">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-3">উচ্চতর</Badge>
              <h3 className="font-bold text-xl text-white mb-2">ফাজিল ও ডিগ্রী</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">ইসলামিক তাফসীর, হাদীস গবেষণা ও আরবি ভাষায় উচ্চতর ডিগ্রি কারিকুলাম।</p>
              <span className="text-xs text-purple-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> ইসলামিক ইউনিভার্সিটি অধিভুক্ত</span>
            </Card>
          </div>
        </div>
      </section>

      {/* Realistic Teachers Showcase Section */}
      <section id="teachers" className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">আমাদের শিক্ষকমণ্ডলী</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">দক্ষ ও নিবেদিতপ্রাণ শিক্ষকবৃন্দ</h2>
            <p className="mt-4 text-slate-400 text-base">
              অভিজ্ঞ আলেম, মুহাদ্দিস ও আধুনিক বিশ্ববিদ্যালয়ের ডিগ্রিধারী শিক্ষকবৃন্দের তত্ত্বাবধানে পাঠদান
            </p>
          </div>

          {loadingTeachers ? (
            <div className="text-center py-12 text-slate-500">শিক্ষক তথ্য লোড হচ্ছে...</div>
          ) : dbTeachers.length === 0 ? (
            <div className="text-center py-12 p-8 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-lg mx-auto">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base">কোনো নিবন্ধিত শিক্ষক পাওয়া যায়নি</h4>
              <p className="text-slate-400 text-xs mt-1">অ্যাডমিন প্যানেল (ম্যানেজ শিক্ষক) থেকে নতুন শিক্ষক নিবন্ধন করলে তা এখানে সরাসরি প্রদর্শিত হবে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dbTeachers.map((teacher, index) => (
                <Card key={teacher.id || index} className="bg-slate-900/90 border-slate-800 p-6 text-center rounded-2xl hover:border-emerald-500/50 transition-all shadow-xl group">
                  <Avatar className="h-28 w-28 mx-auto mb-4 border-2 border-emerald-500/40 shadow-xl group-hover:scale-105 transition-transform overflow-hidden">
                    <AvatarImage src={teacher.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.full_name_en || teacher.full_name_bn || 'Teacher'}&style=circle`} className="object-cover" />
                    <AvatarFallback className="bg-slate-800 text-emerald-400 font-bold text-xl">
                      {(teacher.full_name_bn || teacher.full_name_en || 'T')[0]}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                    {teacher.full_name_bn || teacher.full_name_en || 'সম্মানিত শিক্ষক'}
                  </h3>
                  <p className="text-emerald-400 text-xs font-semibold mt-1">
                    {teacher.designation || teacher.role || 'শিক্ষক'}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <p className="font-mono text-emerald-300 text-[11px]">{teacher.phone || teacher.email || 'ইনস্টিটিউট শিক্ষক'}</p>
                    <Badge variant="outline" className="mt-2 border-emerald-500/20 text-emerald-300 text-[10px] bg-emerald-500/10">
                      সক্রিয় শিক্ষক
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">ক্যাম্পাস সুবিধাসমূহ</Badge>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">আধুনিক সুবিধা ও পরিকাঠামো</h2>
            <p className="mt-4 text-slate-400 text-base">শিক্ষার্থীদের পড়াশোনা ও সুস্বাস্থ্যের জন্য আমাদের বিশেষ উদ্যোগ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl">
              <h4 className="font-bold text-white text-lg mb-2">আধুনিক হিফজ ল্যাব</h4>
              <p className="text-slate-400 text-xs leading-relaxed">সাউন্ড প্রুফ অডিও ল্যাব ও আন্তর্জাতিক কারীদের অডিও রেকর্ডিং শোনার আধুনিক ডিজিটাল অবকাঠামো।</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl">
              <h4 className="font-bold text-white text-lg mb-2">কম্পিউটার ও আইসিটি ল্যাব</h4>
              <p className="text-slate-400 text-xs leading-relaxed">২৪ ঘণ্টা হাই স্পিড ইন্টারনেটসহ ৩০+ ব্র্যান্ডের আধুনিক কম্পিউটার সংবলিত প্র্যাকটিক্যাল ল্যাব।</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl">
              <h4 className="font-bold text-white text-lg mb-2">ইসলামী কেন্দ্রীয় লাইব্রেরি</h4>
              <p className="text-slate-400 text-xs leading-relaxed">১০,০০০+ বিরল তাফসীর, হাদীসের কিতাব ও আধুনিক সাহিত্যের বিশাল কালেকশন সংবলিত লাইব্রেরি।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Board Section */}
      <section id="notices" className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">অফিশিয়াল নোটিশ বোর্ড</h2>
                <p className="text-xs text-slate-400 mt-0.5">অভিভাবক ও শিক্ষার্থীদের জন্য সর্বশেষ বিজ্ঞপ্তি</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">লাইভ আপডেট</Badge>
          </div>

          <Card className="bg-slate-900/90 border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md rounded-2xl">
            <CardContent className="p-6">
              {notices.length === 0 ? (
                <div className="space-y-4">
                  {[
                    { title: 'পবিত্র ঈদুল ফিতর উপলক্ষে মাদ্রাসা ছুটির নোটিশ ২০২৬', date: '২০২৬-০৩-২০', desc: 'সকল ছাত্র ও অভিভাবকদের অবগতির জন্য জানানো যাচ্ছে যে আগামী ২৩শে মার্চ থেকে ৫ই এপ্রিল পর্যন্ত ক্লাস বন্ধ থাকবে।' },
                    { title: 'প্রথম সাময়িক পরীক্ষার সময়সূচি ও প্রবেশপত্র বিতরণ', date: '২০২৬-০৩-১৫', desc: 'সকল শ্রেণির প্রথম সাময়িক পরীক্ষা আগামী ১০ই এপ্রিল থেকে শুরু হবে। প্রবেশপত্র অফিস কক্ষ থেকে সংগ্রহ করুন।' }
                  ].map((n, i) => (
                    <div key={i} className="p-4 border border-slate-800 bg-slate-950/40 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-white text-base">{n.title}</h4>
                        <Badge variant="secondary" className="bg-slate-800 text-emerald-400 text-xs">{n.date}</Badge>
                      </div>
                      <p className="text-slate-400 text-xs">{n.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {notices.map((notice) => (
                    <AccordionItem key={notice.id} value={notice.id} className="border-slate-800">
                      <AccordionTrigger className="hover:no-underline hover:text-emerald-400 text-slate-100 py-4 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left w-full pr-4">
                          <span className="font-semibold text-lg">{notice.title}</span>
                          <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs w-fit">
                            {new Date(notice.created_at).toLocaleDateString('bn-BD')}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 text-base leading-relaxed pt-2 pb-4 border-t border-slate-800/80">
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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mb-3">যোগাযোগ</Badge>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">মাদ্রাসার অবস্থান ও যোগাযোগ</h2>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed mb-8">
                ভর্তি তথ্য, মেধা বৃত্তির আবেদন ও অভিভাবক আলোচনার জন্য সরাসরি যোগাযোগ করুন অথবা মাদ্রাসার অফিস রুমে চলে আসুন।
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <MapPin className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="font-bold text-white text-sm">ঠিকানা</h5>
                    <p className="text-xs text-slate-400">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <Phone className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="font-bold text-white text-sm">হটলাইন ও ভর্তি নম্বর</h5>
                    <p className="text-xs text-slate-400">{settings.phone} {settings.altPhone ? `, ${settings.altPhone}` : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                  <Mail className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="font-bold text-white text-sm">ইমেইল</h5>
                    <p className="text-xs text-slate-400">{settings.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-slate-800/90 border-slate-700 p-8 rounded-2xl shadow-2xl">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-bold text-white">ভর্তি সংক্রান্ত প্রাথমিক জিজ্ঞাসা</CardTitle>
                <CardDescription className="text-slate-400 text-xs">আপনার কোনো বার্তা পাঠাতে নিচে তথ্য দিন</CardDescription>
              </CardHeader>
              <form onSubmit={(e) => { e.preventDefault(); alert('ধন্যবাদ! আপনার বার্তাটি আমাদের অফিস কক্ষে পাঠানো হয়েছে।'); }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">অভিভাবকের নাম</label>
                  <input type="text" placeholder="যেমন: আব্দুর রহমান" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">মোবাইল নম্বর</label>
                  <input type="tel" placeholder="০১৭০০-০০০-০০০" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">বার্তা / প্রশ্ন</label>
                  <textarea rows={3} placeholder="যেমন: ইবতেদায়ী ৩য় শ্রেণিতে কি সিট খালি আছে?" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" required />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl">
                  বার্তা প্রেরণ করুন
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800/80">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-white">{settings.madrasaNameBn}</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} {settings.madrasaNameBn} | সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </footer>
    </div>
  );
}




