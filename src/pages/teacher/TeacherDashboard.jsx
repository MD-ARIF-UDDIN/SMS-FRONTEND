import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { 
  ClipboardList, CheckSquare, ChevronRight, BookOpen, Clock, UserCheck, CheckCircle2, Building2, Calendar, Printer, Download, MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [assignedClass, setAssignedClass] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherRoutines, setTeacherRoutines] = useState([]);
  const [loadingRoutine, setLoadingRoutine] = useState(true);

  const daysBnMap = {
    'Saturday': 'শনিবার',
    'Sunday': 'রবিবার',
    'Monday': 'সোমবার',
    'Tuesday': 'মঙ্গলবার',
    'Wednesday': 'বুধবার',
    'Thursday': 'বৃহস্পতিবার'
  };

  const periodTimeMap = {
    1: '09:00 - 09:45 AM',
    2: '09:45 - 10:30 AM',
    3: '10:30 - 11:15 AM',
    4: '11:45 AM - 12:30 PM',
    5: '12:30 - 01:15 PM'
  };

  useEffect(() => {
    if (user?.id) {
      fetchTeacherAssignedClass();
      fetchTeacherRoutine();
    }
  }, [user]);

  const fetchTeacherAssignedClass = async () => {
    try {
      const { data: clsData } = await supabase
        .from('classes')
        .select('*')
        .eq('class_teacher_id', user.id)
        .single();

      if (clsData) {
        setAssignedClass(clsData);
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', clsData.id)
          .eq('status', 'Active');
        setStudentCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching teacher assigned class:', error.message);
    }
  };

  const fetchTeacherRoutine = async () => {
    setLoadingRoutine(true);
    try {
      const { data: rData, error } = await supabase
        .from('class_routines')
        .select(`
          id, day_of_week, period_number, start_time, end_time, room_number,
          classes (id, name, level),
          subjects (id, subject_name)
        `)
        .eq('teacher_id', user.id)
        .order('period_number');

      if (error) throw error;
      setTeacherRoutines(rData || []);
    } catch (err) {
      console.error('Error fetching teacher routine:', err.message);
    } finally {
      setLoadingRoutine(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-2 text-xs">
            সম্মানিত শিক্ষক প্যানেল
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">শিক্ষক ড্যাশবোর্ড</h2>
          <p className="text-slate-300 text-sm mt-1">আজকের ক্লাস রুটিন, উপস্থিতি ও পরীক্ষার নম্বর ইনপুট</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {assignedClass && (
            <Badge className="bg-emerald-500/20 border-emerald-400/40 text-emerald-300 text-xs px-3 py-1.5 font-bold">
              <Building2 className="w-4 h-4 mr-1.5 text-emerald-400" />
              শ্রেণি শিক্ষক: {assignedClass.name} ({studentCount} জন ছাত্র)
            </Badge>
          )}

          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm">
            <Printer className="w-4 h-4 mr-1.5" /> রুটিন প্রিন্ট / পিডিএফ
          </Button>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <Card className="hover:shadow-lg transition-all border-slate-200 bg-white rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-2 text-emerald-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">পরীক্ষার নম্বর ইনপুট</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {assignedClass 
                ? `${assignedClass.name} শ্রেণির শিক্ষার্থীদের বিষয়ভিত্তিক পরীক্ষার প্রাপ্ত নম্বর এন্ট্রি করুন।`
                : 'নির্ধারিত বিষয়ের সাময়িক ও বিষয়ভিত্তিক পরীক্ষার প্রাপ্ত নম্বর এন্ট্রি করুন।'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/teacher/marks">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                নম্বর ইনপুটে যান <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all border-slate-200 bg-white rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center mb-2 text-teal-600">
              <CheckSquare className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">দৈনিক উপস্থিতি খাতা</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {assignedClass 
                ? `${assignedClass.name} শ্রেণির ছাত্র উপস্থিতি, অনুপস্থিতি ও ছুটি রেজিস্টারে সংরক্ষণ করুন।`
                : 'আপনার শ্রেণি পিরিয়ডের ছাত্র হাজিরা ইনপুট দিন।'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/teacher/attendance">
              <Button variant="outline" className="w-full border-teal-600 text-teal-700 hover:bg-teal-50 font-bold rounded-xl h-11">
                হাজিরা খাতায় যান <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ─── Box-Wise Class Routine Section for Teacher ─── */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between py-4 px-6">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" /> আমার সাপ্তাহিক ক্লাস রুটিন (Teacher Box Routine)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">বক্স আকারে আপনার সাপ্তাহিক ক্লাস সময়সূচী ও কক্ষ নম্বর</CardDescription>
          </div>

          <Button onClick={handlePrint} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-9 print:hidden">
            <Download className="w-3.5 h-3.5 mr-1" /> ডাউনলোড / প্রিন্ট
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {/* Printable Madrasa Header */}
          <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-6">
            <h1 className="text-2xl font-black text-slate-900">{settings.madrasaNameBn}</h1>
            <p className="text-xs text-slate-600 font-medium">{settings.address}</p>
            <Badge className="bg-emerald-800 text-white text-xs font-bold mt-2">
              সম্মানিত শিক্ষকের সাপ্তাহিক ক্লাস রুটিন (২০২৬)
            </Badge>
          </div>

          {loadingRoutine ? (
            <div className="py-12 text-center text-slate-400">রুটিন লোড হচ্ছে...</div>
          ) : teacherRoutines.length === 0 ? (
            <div className="py-12 text-center text-slate-400">আপনার কোনো ক্লাস রুটিন এখনো অ্যাসাইন করা হয়নি।</div>
          ) : (
            <div className="space-y-6">
              {/* Box Grid Layout by Day */}
              {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => {
                const dayRoutines = teacherRoutines.filter(r => r.day_of_week === day);
                if (dayRoutines.length === 0) return null;

                return (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <h4 className="font-bold text-sm text-slate-900">{daysBnMap[day]}</h4>
                      <span className="text-xs text-slate-400 font-mono">({dayRoutines.length} টি পিরিয়ড)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayRoutines.map(r => (
                        <div 
                          key={r.id}
                          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border border-emerald-200/80 shadow-sm hover:shadow-md transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <Badge className="bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5">
                              {r.period_number}ম পিরিয়ড
                            </Badge>
                            <span className="text-[11px] font-mono text-slate-500 font-bold">
                              <Clock className="w-3 h-3 inline mr-1 text-emerald-600" />
                              {r.start_time || periodTimeMap[r.period_number]}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900">{r.subjects?.subject_name}</h5>
                            <p className="text-xs text-emerald-800 font-bold mt-0.5">
                              🏫 শ্রেণি: {r.classes?.name || 'দাখিল'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                            <span className="flex items-center gap-1 font-mono text-slate-700 font-bold">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {r.room_number || 'কক্ষ-১০১'}
                            </span>
                            <span className="text-[10px] text-slate-400">বিষয় শিক্ষক</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
