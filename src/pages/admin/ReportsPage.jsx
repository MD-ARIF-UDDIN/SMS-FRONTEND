import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { calculateStudentOverallGPA, calculateSubjectGrade } from '../../lib/gpaCalculator';
import { 
  FileText, Printer, TrendingUp, TrendingDown, Wallet, Users, 
  GraduationCap, Calendar, CheckCircle2, Clock, Building2, Filter, Award, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function ReportsPage() {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabulation Sheet Filter States
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [tabulationSubjects, setTabulationSubjects] = useState([]);
  const [tabulationStudents, setTabulationStudents] = useState([]);
  const [tabulationMarksMap, setTabulationMarksMap] = useState({});
  const [tabulationLoading, setTabulationLoading] = useState(false);

  useEffect(() => {
    fetchAllReportData();
  }, []);

  const fetchAllReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Invoices
      const { data: invData } = await supabase
        .from('invoices')
        .select(`*, students (student_id_number, profiles(full_name_bn, full_name_en), classes(name))`)
        .order('created_at', { ascending: false });
      setInvoices(invData || []);

      // 2. Fetch Expenses
      const { data: expData } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      setExpenses(expData || []);

      // 3. Fetch Students
      const { data: stData } = await supabase
        .from('students')
        .select(`*, classes(name, level), profiles(full_name_bn, full_name_en)`);
      setStudents(stData || []);

      // 4. Fetch Classes
      const { data: cData } = await supabase.from('classes').select('*').order('name');
      setClasses(cData || []);
      if (cData && cData.length > 0) setSelectedClassId(cData[0].id);

      // 5. Fetch Exams
      const { data: exData } = await supabase.from('exams').select('*').order('exam_name');
      const examList = exData && exData.length > 0 ? exData : [];
      setExams(examList);
      if (examList.length > 0) setSelectedExamId(examList[0].id);

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tabulation Data whenever selected class or exam changes
  useEffect(() => {
    if (selectedClassId && selectedExamId) {
      fetchTabulationSheet();
    }
  }, [selectedClassId, selectedExamId]);

  const fetchTabulationSheet = async () => {
    setTabulationLoading(true);
    try {
      // 1. Fetch subjects for selected class
      const { data: subData } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('subject_name');

      const classSubs = subData && subData.length > 0 ? subData : [
        { id: 'sub-1', subject_name: 'আল-কুরআন ও তাফসীর', total_marks: 100 },
        { id: 'sub-2', subject_name: 'আল-হাদীস', total_marks: 100 },
        { id: 'sub-3', subject_name: 'আরবি ২য় পত্র', total_marks: 100 },
        { id: 'sub-4', subject_name: 'গণিত', total_marks: 100 }
      ];
      setTabulationSubjects(classSubs);

      // 2. Fetch active students in selected class
      const { data: stList } = await supabase
        .from('students')
        .select(`
          id, student_id_number,
          profiles (full_name_bn, full_name_en)
        `)
        .eq('status', 'Active')
        .eq('class_id', selectedClassId);

      setTabulationStudents(stList || []);

      // 3. Fetch marks for this exam and class subjects
      const subIds = classSubs.map(s => s.id);
      const { data: marksData } = await supabase
        .from('marks_entry')
        .select('*')
        .eq('exam_id', selectedExamId)
        .in('subject_id', subIds);

      // Map: { [student_id]: { [subject_id]: markRecord } }
      const map = {};
      if (marksData) {
        marksData.forEach(m => {
          if (!map[m.student_id]) map[m.student_id] = {};
          map[m.student_id][m.subject_id] = m;
        });
      }
      setTabulationMarksMap(map);

    } catch (err) {
      console.error('Error fetching tabulation sheet:', err);
    } finally {
      setTabulationLoading(false);
    }
  };

  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Partial');

  const totalIncome = paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const currentSelectedClassName = classes.find(c => c.id === selectedClassId)?.name || 'শ্রেণি';
  const currentSelectedExamName = exams.find(e => e.id === selectedExamId)?.exam_name || 'পরীক্ষা';

  return (
    <div className="space-y-4 font-sans">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-1.5">রিপোর্ট ও এনালিটিক্স</Badge>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">সার্বিক হিসেব, রেজাল্ট ও ট্যাবুলেশন রিপোর্ট</h2>
          <p className="text-slate-500 text-xs mt-0.5">মাদ্রাসার আয়-ব্যয়, ফলাফল, সার্বিক জিপিএ ও ট্যাবুলেশন শিট</p>
        </div>

        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-10 px-5 shadow-sm">
          <Printer className="w-4 h-4 mr-2" /> রিপোর্ট প্রিন্ট করুন
        </Button>
      </div>

      {/* Printable Header Banner (Only shows during print) */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">আল-জামিয়া ইসলামিয়া মাদ্রাসা</h1>
        <p className="text-xs text-slate-600">অফিশিয়াল একাডেমিক রেজাল্ট ট্যাবুলেশন শিট ও জিপিএ রিপোর্ট</p>
        <p className="text-xs font-bold text-slate-800 mt-1">শ্রেণি: {currentSelectedClassName} | পরীক্ষা: {currentSelectedExamName}</p>
        <p className="text-[11px] font-mono text-slate-500 mt-0.5">প্রিন্ট তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট ফি আদায় (আয়)</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{totalIncome.toLocaleString('bn-BD')}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট প্রশাসনিক ব্যয়</p>
              <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{totalExpense.toLocaleString('bn-BD')}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">এনরোল্ড শিক্ষার্থী</p>
              <h3 className="text-2xl font-extrabold text-teal-600 mt-1">{students.length} জন</h3>
            </div>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">সক্রিয় শ্রেণি সংখ্যা</p>
              <h3 className="text-2xl font-extrabold text-purple-600 mt-1">{classes.length} টি</h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-4 print:hidden">
          <TabsTrigger value="results" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            🏆 রেজাল্ট ও জিপিএ ট্যাবুলেশন শিট
          </TabsTrigger>
          <TabsTrigger value="accounting" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            আয়-ব্যয় একাউন্টিং
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            শিক্ষার্থী ও শ্রেণি পরিসংখ্যান
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Result & GPA Tabulation Sheet */}
        <TabsContent value="results" className="space-y-4">
          <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4 print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">১. শ্রেণি নির্বাচন করুন</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="rounded-xl border-slate-300 bg-white">
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">২. পরীক্ষা নির্বাচন করুন</Label>
                  <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                    <SelectTrigger className="rounded-xl border-slate-300 bg-white">
                      <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.exam_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {tabulationLoading ? (
                <div className="p-12 text-center text-slate-400">ট্যাবুলেশন শিট হিসাব হচ্ছে...</div>
              ) : tabulationStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-400">এই শ্রেণিতে কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি।</div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <Table className="border-collapse">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold text-slate-800 text-xs border border-slate-200 w-10 text-center">#SL</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs border border-slate-200">আইডি নম্বর</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs border border-slate-200">শিক্ষার্থীর নাম</TableHead>
                        {tabulationSubjects.map(s => {
                          const isOpt = s.is_optional || s.subject_category === 'Optional';
                          return (
                            <TableHead key={s.id} className="font-bold text-slate-800 text-xs border border-slate-200 text-center min-w-[110px]">
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <span>{s.subject_name}</span>
                                {isOpt && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                                    ৪র্থ বিষয় (Optional)
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-normal">({s.total_marks || 100} নম্বর)</span>
                              </div>
                            </TableHead>
                          );
                        })}
                        <TableHead className="font-bold text-slate-900 text-xs border border-slate-200 text-center bg-slate-100">মোট নম্বর</TableHead>
                        <TableHead className="font-bold text-emerald-800 text-xs border border-slate-200 text-center bg-emerald-50">সর্বমোট GPA (5.00)</TableHead>
                        <TableHead className="font-bold text-slate-900 text-xs border border-slate-200 text-center bg-slate-100">চুড়ান্ত ফলাফল</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabulationStudents.map((st, stIndex) => {
                        const stMarksMap = tabulationMarksMap[st.id] || {};
                        const overall = calculateStudentOverallGPA(stMarksMap, tabulationSubjects);
                        const profile = st.profiles;

                        return (
                          <TableRow key={st.id} className="hover:bg-slate-50/80">
                            <TableCell className="font-mono text-center text-xs font-bold text-slate-500 border border-slate-200">
                              {stIndex + 1}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-emerald-700 font-bold border border-slate-200">
                              {st.student_id_number}
                            </TableCell>
                            <TableCell className="font-bold text-slate-900 text-xs border border-slate-200">
                              {profile?.full_name_bn || profile?.full_name_en || 'শিক্ষার্থী'}
                            </TableCell>

                            {/* Subject Wise Marks */}
                            {tabulationSubjects.map(s => {
                              const entry = stMarksMap[s.id];
                              if (!entry) {
                                return (
                                  <TableCell key={s.id} className="text-center text-xs text-slate-400 border border-slate-200">
                                    -
                                  </TableCell>
                                );
                              }
                              const isAbsent = Boolean(entry.is_absent);
                              const marks = Number(entry.marks_obtained || 0);
                              const { grade } = calculateSubjectGrade(marks, isAbsent);
                              const isFail = isAbsent || marks < 33;

                              return (
                                <TableCell key={s.id} className={`text-center text-xs border border-slate-200 font-semibold ${isFail ? 'bg-red-50/60 text-red-700' : 'text-slate-800'}`}>
                                  {isAbsent ? (
                                    <span className="text-red-600 font-bold">Abs (F)</span>
                                  ) : (
                                    <div>
                                      <span className="font-bold">{marks}</span>
                                      <span className={`text-[10px] ml-1 px-1 rounded ${isFail ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {grade}
                                      </span>
                                    </div>
                                  )}
                                </TableCell>
                              );
                            })}

                            <TableCell className="text-center font-extrabold text-xs text-slate-900 border border-slate-200 bg-slate-50">
                              {overall.totalMarks}
                            </TableCell>

                            <TableCell className="text-center font-extrabold text-sm border border-slate-200 bg-emerald-50/50">
                              <span className={overall.isPassed ? 'text-emerald-700' : 'text-red-600'}>
                                {overall.gpa} ({overall.letterGrade})
                              </span>
                            </TableCell>

                            <TableCell className="text-center border border-slate-200">
                              {overall.isPassed ? (
                                <Badge className="bg-emerald-600 text-white text-[11px] font-bold">পাস (Passed)</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[11px] font-bold">
                                  অকৃতকার্য ({overall.failedCount} বিষয়)
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Accounting Report */}
        <TabsContent value="accounting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income Table */}
            <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> ফি আয়ের রেজিস্টার (পরিশোধিত)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto max-h-96">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-slate-700">তারিখ</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">শিক্ষার্থী</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">বিবরণ</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 text-right">পরিমাণ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 py-6 text-xs">কোনো আয়ের রেকর্ড নেই</TableCell>
                        </TableRow>
                      ) : (
                        paidInvoices.map((inv) => (
                          <TableRow key={inv.id} className="hover:bg-slate-50/80">
                            <TableCell className="text-xs font-mono text-slate-500">
                              {new Date(inv.created_at).toLocaleDateString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-800">
                              {inv.students?.profiles?.full_name_bn || inv.students?.student_id_number || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs text-slate-600">{inv.title}</TableCell>
                            <TableCell className="text-xs font-bold text-emerald-600 text-right">
                              {Number(inv.total_amount).toLocaleString('bn-BD')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Expense Table */}
            <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-600" /> প্রশাসনিক ব্যয়ের রেজিস্টার
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full overflow-auto max-h-96">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-slate-700">তারিখ</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">বিবরণ</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700">ক্যাটাগরি</TableHead>
                        <TableHead className="text-xs font-bold text-slate-700 text-right">পরিমাণ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400 py-6 text-xs">কোনো ব্যয়ের রেকর্ড নেই</TableCell>
                        </TableRow>
                      ) : (
                        expenses.map((exp) => (
                          <TableRow key={exp.id} className="hover:bg-slate-50/80">
                            <TableCell className="text-xs font-mono text-slate-500">
                              {new Date(exp.expense_date).toLocaleDateString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-800">{exp.description}</TableCell>
                            <TableCell className="text-xs text-slate-600">
                              <Badge variant="outline" className="text-[10px] bg-slate-50">{exp.category}</Badge>
                            </TableCell>
                            <TableCell className="text-xs font-bold text-rose-600 text-right">
                              {Number(exp.amount).toLocaleString('bn-BD')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Students & Class Breakdown */}
        <TabsContent value="students" className="space-y-4">
          <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" /> শ্রেণিভিত্তিক শিক্ষার্থী এনরোলমেন্ট রিপোর্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-slate-700">শ্রেণি</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700">শিক্ষা স্তর (Level)</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700">এনরোল্ড শিক্ষার্থী সংখ্যা</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 text-right">অনুপাত</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => {
                      const count = students.filter(st => st.classes?.name === cls.name || st.class_id === cls.id).length;
                      const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                      return (
                        <TableRow key={cls.id} className="hover:bg-slate-50/80">
                          <TableCell className="text-xs font-bold text-slate-800">{cls.name}</TableCell>
                          <TableCell className="text-xs text-slate-600">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px]">{cls.level}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-extrabold text-emerald-700">{count} জন</TableCell>
                          <TableCell className="text-xs font-mono text-slate-600 text-right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
