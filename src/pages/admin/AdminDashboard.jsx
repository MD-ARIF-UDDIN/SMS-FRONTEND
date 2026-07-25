import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Users, GraduationCap, Wallet, ArrowUpRight, TrendingUp, TrendingDown, Plus, Receipt, UserPlus, Megaphone, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    income: 0,
    expense: 0,
    netRevenue: 0
  });
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get Students
      const { data: studentList, count: studentCount, error: sErr } = await supabase
        .from('students')
        .select('*', { count: 'exact' });
      if (sErr) console.warn('Students fetch info:', sErr.message);
        
      // Get Teachers
      const { data: teacherList, count: teacherCount, error: tErr } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'teacher');
      if (tErr) console.warn('Teachers fetch info:', tErr.message);

      // Calculate Payments & Expenses
      const { data: payments } = await supabase.from('payments').select('amount_paid');
      const { data: expenses } = await supabase.from('expenses').select('amount');
      
      const totalIncome = payments?.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0) || 0;
      const totalExpense = expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

      // Get Recent Notices
      const { data: notices } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      const finalStudentCount = studentCount !== null && studentCount !== undefined ? studentCount : (studentList?.length || 0);
      const finalTeacherCount = teacherCount !== null && teacherCount !== undefined ? teacherCount : (teacherList?.length || 0);

      setRecentNotices(notices || []);
      setStats({
        students: finalStudentCount,
        teachers: finalTeacherCount,
        income: totalIncome,
        expense: totalExpense,
        netRevenue: totalIncome - totalExpense
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-3 px-3 py-1 text-xs">
            সেশন ২০২৬-২০২৭
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">প্রধান এডমিন ড্যাশবোর্ড</h1>
          <p className="text-slate-300 text-sm mt-1">মাদ্রাসার সার্বিক একাডেমি ও আর্থিক চিত্র একনজরে দেখুন</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/admin/admissions">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md">
              <UserPlus className="w-4 h-4 mr-2" /> নতুন ভর্তি
            </Button>
          </Link>
          <Link to="/dashboard/admin/fees">
            <Button variant="outline" className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 rounded-xl">
              <Receipt className="w-4 h-4 mr-2" /> ফি আদায়
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">মোট শিক্ষার্থী</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">{stats.students} জন</div>
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> সক্রিয় এনরোলমেন্ট
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">মোট শিক্ষক ও স্টাফ</CardTitle>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-900">{stats.teachers} জন</div>
            <p className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> অন-ডিউটি শিক্ষকবৃন্দ
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">মোট ফি আদায় (আয়)</CardTitle>
            <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-teal-700">{stats.income.toLocaleString('bn-BD')}</div>
            <p className="text-xs text-slate-500 font-medium mt-2">সংগৃহীত টিউশন ফি ও অন্যান্য</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">নিট উদ্বৃত্ত (ব্যালেন্স)</CardTitle>
            <div className={`p-2 rounded-xl ${stats.netRevenue >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-extrabold ${stats.netRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {stats.netRevenue.toLocaleString('bn-BD')}
            </div>

            <p className="text-xs text-slate-500 font-medium mt-2">আয় ও ব্যয়ের পার্থক্য</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">দ্রুত অ্যাকশন ও মডিউল</CardTitle>
            <CardDescription className="text-xs text-slate-500">মাদ্রাসার নিয়মিত কার্যাবলীর সরাসরি এক্সেস</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link to="/dashboard/admin/admissions" className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group">
                <UserPlus className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-800">শিক্ষার্থী ভর্তি</span>
                <span className="text-[11px] text-slate-500 mt-1">নতুন এনরোলমেন্ট</span>
              </Link>

              <Link to="/dashboard/admin/fees" className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group">
                <Receipt className="w-8 h-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-800">ফি আদায়</span>
                <span className="text-[11px] text-slate-500 mt-1">রসিদ জেনারেট</span>
              </Link>

              <Link to="/dashboard/admin/expenses" className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group">
                <Wallet className="w-8 h-8 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-800">খরচ হিসাব</span>
                <span className="text-[11px] text-slate-500 mt-1">ভাউচার তৈরি</span>
              </Link>

              <Link to="/dashboard/admin/classes" className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group">
                <GraduationCap className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-800">শ্রেণি ব্যবস্থাপনা</span>
                <span className="text-[11px] text-slate-500 mt-1">বিভাগ ও বিষয়</span>
              </Link>

              <Link to="/dashboard/admin/routine" className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group">
                <TrendingUp className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-800">ক্লাস রুটিন</span>
                <span className="text-[11px] text-slate-500 mt-1">সময়সূচি</span>
              </Link>

              <Link to="/dashboard/admin/notices" className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group">
                <Megaphone className="w-8 h-8 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-slate-800">নোটিশ প্রকাশ</span>
                <span className="text-[11px] text-slate-500 mt-1">ঘোষণা প্রদান</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notices Feed */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">সাম্প্রতিক নোটিশ</CardTitle>
              <CardDescription className="text-xs text-slate-500">সাম্প্রতিক নোটিশমূহ</CardDescription>
            </div>
            <Link to="/dashboard/admin/notices">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700">
                সব দেখুন <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotices.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">কোনো সাম্প্রতিক নোটিশ নেই</div>
            ) : (
              recentNotices.map((notice) => (
                <div key={notice.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{notice.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {new Date(notice.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 shrink-0">
                    জরুরি
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

