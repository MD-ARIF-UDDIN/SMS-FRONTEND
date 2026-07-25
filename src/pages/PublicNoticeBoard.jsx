import { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Link } from 'react-router-dom';
import {
  Bell, Building2, Search, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PublicNavbar from '../components/PublicNavbar';

export default function PublicNoticeBoard() {
  const { settings } = useSettings();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotices(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter((notice) =>
    notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (notice.content && notice.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const defaultNotices = [
    {
      id: 'demo-1',
      title: 'পবিত্র ঈদুল ফিতর উপলক্ষে মাদ্রাসা ছুটির নোটিশ ২০২৬',
      created_at: '2026-03-20T00:00:00.000Z',
      content: 'সকল ছাত্র, শিক্ষক ও অভিভাবকদের অবগতির জন্য জানানো যাচ্ছে যে আগামী ২৩শে মার্চ থেকে ৫ই এপ্রিল পর্যন্ত ক্লাস বন্ধ থাকবে। ৬ই এপ্রিল থেকে নিয়মিত সময়সূচি অনুযায়ী ক্লাস পুনরায় শুরু হবে।',
    },
    {
      id: 'demo-2',
      title: 'প্রথম সাময়িক পরীক্ষার সময়সূচি ও প্রবেশপত্র বিতরণ',
      created_at: '2026-03-15T00:00:00.000Z',
      content: 'সকল শ্রেণির প্রথম সাময়িক পরীক্ষা আগামী ১০ই এপ্রিল থেকে শুরু হবে। রুটিন ওয়েবসাইটে ও মাদ্রাসা নোটিশ বোর্ডে টাঙানো হয়েছে। পরীক্ষার প্রবেশপত্র আগামী ১লা এপ্রিল থেকে অফিস কক্ষ থেকে সংগ্রহ করা যাবে।',
    },
    {
      id: 'demo-3',
      title: 'বার্ষিক হিফজুল কুরআন প্রতিযোগিতা ও পুরস্কার বিতরণী অনুষ্ঠান',
      created_at: '2026-03-01T00:00:00.000Z',
      content: 'প্রতি বছরের ন্যায় এ বছরও আগামী ১৫ই মার্চ বার্ষিক ক্বিরাত ও হিফজ প্রতিযোগিতা অনুষ্ঠিত হবে। বিজয়ী শিক্ষার্থীদের বিশেষ সম্মাননা ও শিক্ষাবৃত্তি প্রদান করা হবে।',
    }
  ];

  const displayNotices = notices.length > 0 ? filteredNotices : defaultNotices;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Shared Public Navbar */}
      <PublicNavbar />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-6 relative z-10 space-y-5">
        {/* Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white leading-none">অফিশিয়াল নোটিশ বোর্ড</h1>
              <p className="text-xs text-slate-400 mt-1">সর্বশেষ বিজ্ঞপ্তি ও সময়সূচি</p>
            </div>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              type="text"
              placeholder="নোটিশ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 bg-slate-900 border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Notices Accordion */}
        {loading ? (
          <div className="text-center py-16">
            <div className="h-9 w-9 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">নোটিশ লোড হচ্ছে...</p>
          </div>
        ) : displayNotices.length === 0 ? (
          <div className="text-center py-16 bg-slate-950/50 border border-slate-800 rounded-2xl p-8">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">কোনো নোটিশ পাওয়া যায়নি</h3>
            <p className="text-slate-400 text-xs mt-1">আপনার অনুসন্ধানের সাথে মেলে এমন কোনো তথ্যে মিল পাওয়া যায়নি।</p>
          </div>
        ) : (
          <Card className="bg-slate-950/60 border-slate-800 shadow-xl rounded-2xl overflow-hidden backdrop-blur-md">
            <CardContent className="p-3 sm:p-5">
              <Accordion type="single" collapsible className="w-full space-y-2">
                {displayNotices.map((notice) => (
                  <AccordionItem
                    key={notice.id}
                    value={notice.id}
                    className="border border-slate-800/80 bg-slate-900/60 rounded-xl px-4 py-1"
                  >
                    <AccordionTrigger className="hover:no-underline hover:text-emerald-400 text-slate-100 py-3 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full pr-3">
                        <span className="font-semibold text-sm sm:text-base text-white leading-snug">
                          {notice.title}
                        </span>
                        <Badge variant="secondary" className="bg-slate-800/80 text-emerald-400 text-xs gap-1 border border-slate-700/60 w-fit flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          {new Date(notice.created_at).toLocaleDateString('bn-BD')}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-2 pb-4 border-t border-slate-800/60">
                      {notice.content_html ? (
                        <div dangerouslySetInnerHTML={{ __html: notice.content_html }} />
                      ) : (
                        <p className="whitespace-pre-line">{notice.content}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Shared Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800/80 mt-auto">
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
