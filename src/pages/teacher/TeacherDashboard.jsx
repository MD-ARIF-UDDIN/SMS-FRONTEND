import { Link } from 'react-router-dom';
import { ClipboardList, CheckSquare, ChevronRight, BookOpen, Clock, UserCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TeacherDashboard() {
  return (
    <div className="space-y-6 max-w-5xl font-sans">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-2 text-xs">
            সম্মানিত শিক্ষক প্যানেল
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">শিক্ষক ড্যাশবোর্ড</h2>
          <p className="text-slate-300 text-sm mt-1">আজকের শ্রেণি উপস্থিতি ও পরীক্ষার নাম্বার সহজে ইনপুট দিন</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> অনলাইন সেশন সক্রিয়
          </Badge>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all border-slate-200 bg-white rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-2 text-emerald-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">পরীক্ষার নম্বর ইনপুট</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              নির্ধারিত বিষয়ের সাময়িক ও বিষয়ভিত্তিক পরীক্ষার প্রাপ্ত নম্বর এন্ট্রি করুন।
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
              শ্রেণির উপস্থিতি, অনুপস্থিতি ও ছুটি রেজিস্টারে সংরক্ষণ করুন।
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/teacher/attendance">
              <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl h-11">
                উপস্থিতি গ্রহণ করুন <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

