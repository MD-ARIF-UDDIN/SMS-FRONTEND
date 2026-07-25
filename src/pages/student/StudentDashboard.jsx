import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Calendar, Bell, GraduationCap, Award, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentDashboard() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (!error && data) setNotices(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-2 text-xs">
            শিক্ষার্থী পোর্টাল
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">আস-সালামু আলাইকুম</h2>
          <p className="text-slate-300 text-sm mt-1">আপনার পড়ালেখা, রুটিন ও পরীক্ষার ফলফল এখানে দেখুন</p>
        </div>

        <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 px-4 py-1.5 text-xs w-fit">
          স্ট্যাটাস: নিয়মিত শিক্ষার্থী (Active)
        </Badge>
      </div>

      {/* Student Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">নিবন্ধিত শ্রেণি</p>
              <h4 className="font-extrabold text-lg text-slate-900">ফাজিল ১ম বর্ষ / দাখিল</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">সর্বশেষ জিপিএ</p>
              <h4 className="font-extrabold text-lg text-teal-700">৫.০০ (A+)</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">উপস্থিতি হার</p>
              <h4 className="font-extrabold text-lg text-cyan-700">৯৬%</h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Routine & Notice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center gap-3 space-y-0 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">আমার ক্লাস রুটিন</CardTitle>
              <CardDescription className="text-xs text-slate-500">চলতি সপ্তাহের পাঠদান সময়সূচি</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">বার / দিন</TableHead>
                    <TableHead className="font-bold text-slate-700">বিষয়</TableHead>
                    <TableHead className="font-bold text-slate-700">সময়সূচি</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-slate-800">শনিবার</TableCell>
                    <TableCell className="font-semibold text-emerald-700">আল-কুরআন ও তাফসীর</TableCell>
                    <TableCell className="text-xs font-mono text-slate-600">০৮:০০ AM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-800">শনিবার</TableCell>
                    <TableCell className="font-semibold text-emerald-700">আল-হাদীস</TableCell>
                    <TableCell className="text-xs font-mono text-slate-600">০৯:০০ AM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-800">রবিবার</TableCell>
                    <TableCell className="font-semibold text-emerald-700">আরবি ২য় পত্র</TableCell>
                    <TableCell className="text-xs font-mono text-slate-600">০৮:০০ AM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-slate-800">রবিবার</TableCell>
                    <TableCell className="font-semibold text-emerald-700">গণিত</TableCell>
                    <TableCell className="text-xs font-mono text-slate-600">০৯:০০ AM</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center gap-3 space-y-0 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">জরুরি নোটিশসমূহ</CardTitle>
              <CardDescription className="text-xs text-slate-500">মাদ্রাসার ঘোষণা ও আপডেট</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {notices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">কোনো নতুন নোটিশ নেই।</p>
            ) : (
              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-4 border border-slate-100 bg-slate-50/80 rounded-xl hover:bg-emerald-50/40 transition-colors">
                    <p className="font-bold text-sm text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {new Date(n.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

