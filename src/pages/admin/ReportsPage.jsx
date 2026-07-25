import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  FileText, Printer, TrendingUp, TrendingDown, Wallet, Users, 
  GraduationCap, Calendar, CheckCircle2, Clock, Building2, Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportsPage() {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

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
        .select(`*, classes(name, level), profiles(full_name_bn)`);
      setStudents(stData || []);

      // 4. Fetch Classes
      const { data: cData } = await supabase.from('classes').select('*');
      setClasses(cData || []);

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid' || inv.status === 'Partial');

  const totalIncome = paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const totalDue = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const netSurplus = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-1.5">রিপোর্ট ও এনালিটিক্স</Badge>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">সার্বিক হিসাব ও একাউন্টিং রিপোর্ট</h2>
          <p className="text-slate-500 text-xs mt-0.5">মাদ্রাসার আয়-ব্যয়, ফি সংগ্রহ, বকেয়া হিসাব ও শিক্ষার্থীর পরিসংখ্যান রিপোর্ট</p>
        </div>

        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-10 px-5 shadow-sm">
          <Printer className="w-4 h-4 mr-2" /> রিপোর্ট প্রিন্ট করুন
        </Button>
      </div>

      {/* Printable Header Banner (Only shows during print) */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">আল-জামিয়া ইসলামিয়া মাদ্রাসা</h1>
        <p className="text-xs text-slate-600">অফিশিয়াল সার্বিক হিসাব ও একাউন্টিং স্টেটমেন্ট রিপোর্ট</p>
        <p className="text-[11px] font-mono text-slate-500 mt-1">প্রিন্ট তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট ফি আদায় (আয়)</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{totalIncome.toLocaleString('bn-BD')}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
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
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">নিট উদ্বৃত্ত (ব্যালেন্স)</p>
              <h3 className={`text-2xl font-extrabold mt-1 ${netSurplus >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {netSurplus.toLocaleString('bn-BD')}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${netSurplus >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট বকেয়া ফি</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{totalDue.toLocaleString('bn-BD')}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for Detailed Reports */}
      <Tabs defaultValue="accounting" className="w-full space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl flex gap-1 w-fit print:hidden">
          <TabsTrigger value="accounting" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            একাউন্টিং ও অর্থ লেনদেন
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            শিক্ষার্থী ও শ্রেণি রিপোর্ট
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Accounting Report */}
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


        {/* Tab 2: Students & Class Breakdown */}
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
