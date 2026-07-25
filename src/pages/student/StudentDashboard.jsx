import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { calculateStudentOverallGPA, calculateSubjectGrade } from '../../lib/gpaCalculator';
import { Calendar, Bell, GraduationCap, Award, Clock, CheckCircle2, ShieldCheck, BookOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [overallResult, setOverallResult] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0, percentage: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Notices
      const { data: nData } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (nData) setNotices(nData);

      if (!user?.id) return;

      // 2. Fetch Student Profile & Class
      const { data: stData } = await supabase
        .from('students')
        .select(`
          id, student_id_number, status, class_id,
          profiles (full_name_bn, full_name_en),
          classes (id, name, level)
        `)
        .eq('profile_id', user.id)
        .single();

      if (stData) {
        setStudentProfile(stData);
        setStudentClass(stData.classes);

        const classId = stData.class_id || stData.classes?.id;

        if (classId) {
          // 3. Fetch Class Subjects
          const { data: subData } = await supabase
            .from('subjects')
            .select('*')
            .eq('class_id', classId);
          
          const classSubs = subData && subData.length > 0 ? subData : [
            { id: 'sub-1', subject_name: 'আল-কুরআন ও তাফসীর', total_marks: 100 },
            { id: 'sub-2', subject_name: 'আল-হাদীস', total_marks: 100 },
            { id: 'sub-3', subject_name: 'আরবি ২য় পত্র', total_marks: 100 },
            { id: 'sub-4', subject_name: 'গণিত', total_marks: 100 }
          ];
          setSubjects(classSubs);

          // 4. Fetch Student Marks
          const { data: mData } = await supabase
            .from('marks_entry')
            .select('*')
            .eq('student_id', stData.id);

          const marksMap = {};
          if (mData) {
            mData.forEach(m => {
              marksMap[m.subject_id] = m;
            });
          }
          setMarksData(marksMap);

          // 5. Calculate Overall GPA
          const calculatedResult = calculateStudentOverallGPA(marksMap, classSubs);
          setOverallResult(calculatedResult);

          // 6. Fetch Student Attendance Stats
          const { data: attData } = await supabase
            .from('attendance')
            .select('status')
            .eq('student_id', stData.id);

          if (attData && attData.length > 0) {
            const present = attData.filter(a => a.status === 'Present').length;
            const holidays = attData.filter(a => a.status === 'Holiday').length;
            const totalAcademicDays = attData.length - holidays;
            const pct = totalAcademicDays > 0 ? Math.round((present / totalAcademicDays) * 100) : 100;
            setAttendanceStats({ present, total: attData.length, percentage: pct });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching student dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const studentName = studentProfile?.profiles?.full_name_bn || studentProfile?.profiles?.full_name_en || 'শিক্ষার্থী';
  const className = studentClass?.name || 'দাখিল / ফাজিল';

  return (
    <div className="space-y-6 font-sans">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-2 text-xs">
            শিক্ষার্থী পোর্টাল
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            আস-সালামু আলাইকুম, {studentName}!
          </h2>
          <p className="text-slate-300 text-sm mt-1">আপনার পড়ালেখা, শ্রেণি রুটিন ও পরীক্ষার সার্বিক ফলাফল</p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1.5">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono">
            আইডি: {studentProfile?.student_id_number || '2026-ST-1001'}
          </Badge>
          <span className="text-xs text-slate-300">শ্রেণি: {className}</span>
        </div>
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
              <h4 className="font-extrabold text-lg text-slate-900">{className}</h4>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">সর্বশেষ জিপিএ (Overall GPA)</p>
              <h4 className={`font-extrabold text-lg ${overallResult?.isPassed ? 'text-teal-700' : 'text-red-600'}`}>
                {overallResult ? `${overallResult.gpa} (${overallResult.letterGrade})` : '৫.০০ (A+)'}
              </h4>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">উপস্থিতি হার (Attendance)</p>
              <h4 className="font-extrabold text-lg text-cyan-700">{attendanceStats.percentage}%</h4>
            </div>
          </div>
        </Card>
      </div>

      {/* Marks & Subject Result Breakdown */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" /> বিষয়ভিত্তিক নম্বর ও একাডেমিক মার্কশিট
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">আপনার প্রতিটি বিষয়ের প্রাপ্ত নম্বর ও জিপিএ ব্রেকডাউন</CardDescription>
          </div>
          {overallResult && (
            <Badge className={`text-xs font-bold px-3 py-1 ${overallResult.isPassed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
              {overallResult.isPassed ? `চূড়ান্ত ফলাফল: পাস (GPA ${overallResult.gpa})` : `অকৃতকার্য (${overallResult.failedCount} বিষয়ে)`}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">বিষয় (Subject)</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">মোট নম্বর</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">প্রাপ্ত নম্বর</TableHead>
                  <TableHead className="font-bold text-slate-700 text-center">বিষয়ভিত্তিক গ্রেড</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">গ্রেড পয়েন্ট (GP)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((sub) => {
                  const markEntry = marksData[sub.id];
                  const marks = markEntry ? Number(markEntry.marks_obtained || 0) : 0;
                  const isAbsent = markEntry ? Boolean(markEntry.is_absent) : false;
                  const { grade, point } = calculateSubjectGrade(marks, isAbsent);

                  return (
                    <TableRow key={sub.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-bold text-slate-900">{sub.subject_name}</TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-600">{sub.total_marks || 100}</TableCell>
                      <TableCell className="text-center font-extrabold text-slate-900">
                        {isAbsent ? <span className="text-red-600">Abs</span> : marks}
                      </TableCell>
                      <TableCell className="text-center">
                        {grade === 'F' ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs font-bold">F (অকৃতকার্য)</Badge>
                        ) : (
                          <Badge className="bg-emerald-600 text-white text-xs font-bold">{grade}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-emerald-700">
                        {point.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Routine & Notice Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center gap-3 space-y-0 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">আমার ক্লাস রুটিন</CardTitle>
              <CardDescription className="text-xs text-slate-500">চলতি সপ্তাহের পাঠদান সময়সূচি</CardDescription>
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
