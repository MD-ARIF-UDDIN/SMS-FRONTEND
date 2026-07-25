import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useSettings } from '../../hooks/useSettings';
import { 
  DollarSign, Plus, Search, Filter, CheckCircle2, Clock, 
  AlertCircle, Printer, FileText, CalendarCheck, Zap, Settings2, Calendar
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function FeeCollection() {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Exam-Wise Fee Matrix: { [exam_id]: { [class_id]: fee_amount } }
  const [examClassFeesMatrix, setExamClassFeesMatrix] = useState({});
  const [isExamRatesDialogOpen, setIsExamRatesDialogOpen] = useState(false);
  const [selectedExamIdForRates, setSelectedExamIdForRates] = useState('');

  // Bulk Exam Fee Auto-Assign Modal State
  const [isAutoAssignDialogOpen, setIsAutoAssignDialogOpen] = useState(false);
  const [autoExamId, setAutoExamId] = useState('');
  const [autoClassId, setAutoClassId] = useState('all');
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Bulk Monthly Tuition Fee Generator State
  const [isMonthlyFeeDialogOpen, setIsMonthlyFeeDialogOpen] = useState(false);
  const [selectedMonthName, setSelectedMonthName] = useState('মার্চ ২০২৬');
  const [monthlyClassId, setMonthlyClassId] = useState('all');
  const [generatingMonthlyFees, setGeneratingMonthlyFees] = useState(false);

  // Single Invoice Dialog State
  const [isSingleDialogOpen, setIsSingleDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Printable Receipt Modal State
  const [receiptInvoice, setReceiptInvoice] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Single Invoice Form
  const [formData, setFormData] = useState({
    student_id: '',
    title: 'টিউশন ফি - চলতি মাস',
    total_amount: ''
  });

  // Editable Class Rates for Selected Exam
  const [editableClassRates, setEditableClassRates] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students
      const { data: stData } = await supabase
        .from('students')
        .select(`
          id, student_id_number, class_id, custom_monthly_fee,
          profiles(full_name_bn, full_name_en, phone_primary),
          classes(id, name, level, monthly_fee)
        `);
      setStudents(stData || []);

      // 2. Fetch Active Classes
      const { data: cData } = await supabase.from('classes').select('*').order('name');
      setClasses(cData || []);

      // 3. Fetch Exams
      const { data: exData } = await supabase.from('exams').select('*').order('exam_name');
      const examList = exData && exData.length > 0 ? exData : [];
      setExams(examList);

      const defaultExamId = examList[0]?.id || '';
      setSelectedExamIdForRates(defaultExamId);
      setAutoExamId(defaultExamId);

      // 4. Fetch Exam-wise Class Fee Matrix
      const { data: feeRates } = await supabase.from('exam_class_fees').select('*');
      const matrix = {};
      if (feeRates) {
        feeRates.forEach(f => {
          if (!matrix[f.exam_id]) matrix[f.exam_id] = {};
          matrix[f.exam_id][f.class_id] = Number(f.fee_amount || 600);
        });
      }
      setExamClassFeesMatrix(matrix);

      // Populate initial editable rates for selected exam
      if (defaultExamId && matrix[defaultExamId]) {
        const ratesMap = {};
        Object.keys(matrix[defaultExamId]).forEach(cId => {
          ratesMap[cId] = String(matrix[defaultExamId][cId]);
        });
        setEditableClassRates(ratesMap);
      }

      // 5. Fetch Invoices
      fetchInvoices();
    } catch (e) {
      console.error('Error fetching initial fee data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          students (
            id,
            student_id_number,
            profiles (full_name_bn, full_name_en, phone_primary),
            classes (name, level)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (e) {
      console.error('Error fetching invoices:', e);
    }
  };

  // --- Save Class Rates for Selected Exam ---
  const handleSaveExamClassRates = async () => {
    if (!selectedExamIdForRates) return;
    try {
      const upserts = Object.keys(editableClassRates).map(classId => ({
        exam_id: selectedExamIdForRates,
        class_id: classId,
        fee_amount: Number(editableClassRates[classId] || 600)
      }));

      if (upserts.length > 0) {
        const { error } = await supabase
          .from('exam_class_fees')
          .upsert(upserts, { onConflict: 'exam_id,class_id' });

        if (error) throw error;
      }

      // Update local matrix
      setExamClassFeesMatrix(prev => ({
        ...prev,
        [selectedExamIdForRates]: Object.keys(editableClassRates).reduce((acc, cId) => {
          acc[cId] = Number(editableClassRates[cId] || 600);
          return acc;
        }, {})
      }));

      setIsExamRatesDialogOpen(false);
      alert('শ্রেণিভিত্তিক পরীক্ষা ফি এর হার সফলভাবে সংসংরক্ষিত হয়েছে!');
    } catch (e) {
      console.error(e);
      alert('ফি এর হার সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  // --- Bulk Auto-Assign Exam Fees ---
  const handleAutoAssignExamFee = async () => {
    if (!autoExamId) return;
    setAutoAssigning(true);

    try {
      const activeExamObj = exams.find(e => e.id === autoExamId);
      const examName = activeExamObj ? activeExamObj.exam_name : 'পরীক্ষা';
      const examFeeRates = examClassFeesMatrix[autoExamId] || {};

      const targetStudents = students.filter(s => {
        if (autoClassId === 'all') return true;
        return s.class_id === autoClassId;
      });

      if (targetStudents.length === 0) {
        alert('কোনো শিক্ষার্থী পাওয়া যায়নি');
        setAutoAssigning(false);
        return;
      }

      let insertedCount = 0;
      const invoicePayloads = [];

      for (const st of targetStudents) {
        const classId = st.class_id;
        const feeAmount = examFeeRates[classId] || 600;
        const className = st.classes?.name || 'শ্রেণি';
        const title = `${examName} - পরীক্ষা ফি (${className})`;

        const exists = invoices.some(inv => inv.student_id === st.id && inv.title === title);
        if (!exists) {
          invoicePayloads.push({
            student_id: st.id,
            title: title,
            total_amount: feeAmount,
            status: 'Unpaid',
            due_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
          });
          insertedCount++;
        }
      }

      if (invoicePayloads.length > 0) {
        const { error } = await supabase.from('invoices').insert(invoicePayloads);
        if (error) throw error;
      }

      setIsAutoAssignDialogOpen(false);
      fetchInvoices();
      alert(`সাফল্যের সাথে [${examName}] এর জন্য ${insertedCount} জন শিক্ষার্থীর অ্যাকাউন্টে পরীক্ষা ফি স্বয়ংক্রিয়ভাবে ইনভয়েস করা হয়েছে!`);
    } catch (err) {
      console.error('Error auto assigning exam fee:', err);
      alert('অটো-অ্যাসাইনে ত্রুটি হয়েছে: ' + err.message);
    } finally {
      setAutoAssigning(false);
    }
  };

  // --- Bulk Auto-Generate Class-Wise Monthly Fees ---
  const handleGenerateMonthlyTuitionFees = async () => {
    setGeneratingMonthlyFees(true);

    try {
      const targetStudents = students.filter(s => {
        if (monthlyClassId === 'all') return true;
        return s.class_id === monthlyClassId;
      });

      if (targetStudents.length === 0) {
        alert('কোনো শিক্ষার্থী পাওয়া যায়নি');
        setGeneratingMonthlyFees(false);
        return;
      }

      let insertedCount = 0;
      const invoicePayloads = [];

      for (const st of targetStudents) {
        const classMonthlyFee = Number(st.custom_monthly_fee || st.classes?.monthly_fee || 500);
        const className = st.classes?.name || 'শ্রেণি';
        const title = `টিউশন ফি - ${selectedMonthName} (${className})`;

        const exists = invoices.some(inv => inv.student_id === st.id && inv.title === title);
        if (!exists) {
          invoicePayloads.push({
            student_id: st.id,
            title: title,
            total_amount: classMonthlyFee,
            status: 'Unpaid',
            due_date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0]
          });
          insertedCount++;
        }
      }

      if (invoicePayloads.length > 0) {
        const { error } = await supabase.from('invoices').insert(invoicePayloads);
        if (error) throw error;
      }

      setIsMonthlyFeeDialogOpen(false);
      fetchInvoices();
      alert(`সাফল্যের সাথে [${selectedMonthName}] এর জন্য ${insertedCount} জন শিক্ষার্থীর শ্রেণিভিত্তিক মাসিক টিউশন ফি জেনারেট করা হয়েছে!`);
    } catch (err) {
      console.error('Error generating monthly fees:', err);
      alert('মাসিক ফি জেনারেটে ত্রুটি: ' + err.message);
    } finally {
      setGeneratingMonthlyFees(false);
    }
  };

  // --- Single Invoice Generator ---
  const handleGenerateInvoice = async () => {
    if (!formData.student_id || !formData.title || !formData.total_amount) return;
    setGenerating(true);

    try {
      const { error } = await supabase.from('invoices').insert([{
        student_id: formData.student_id,
        title: formData.title,
        total_amount: Number(formData.total_amount),
        status: 'Unpaid',
        due_date: new Date().toISOString().split('T')[0]
      }]);

      if (error) throw error;

      setIsSingleDialogOpen(false);
      setFormData({ student_id: '', title: 'টিউশন ফি - চলতি মাস', total_amount: '' });
      fetchInvoices();
    } catch (e) {
      console.error(e);
      alert('ইনভয়েস তৈরিতে সমস্যা হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  // --- Collect Payment ---
  const handleCollectPayment = async (inv) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'Paid' })
        .eq('id', inv.id);

      if (error) throw error;

      await supabase.from('payments').insert([{
        invoice_id: inv.id,
        amount_paid: inv.total_amount,
        payment_date: new Date().toISOString().split('T')[0]
      }]);

      setReceiptInvoice({ ...inv, status: 'Paid' });
      setIsReceiptOpen(true);
      fetchInvoices();
    } catch (e) {
      console.error(e);
      alert('ফি আদায় আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter(inv => {
    const stId = inv.students?.student_id_number || '';
    const nameBn = inv.students?.profiles?.full_name_bn || '';
    const nameEn = inv.students?.profiles?.full_name_en || '';
    const title = inv.title || '';

    const matchesSearch = stId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCollectedAmount = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  const totalDueAmount = invoices
    .filter(inv => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  return (
    <div className="space-y-4 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">ফি আদায় ও শ্রেণিভিত্তিক টিউশন প্যানেল</h2>
          <p className="text-slate-500 text-xs mt-0.5">শ্রেণিভিত্তিক মাসিক টিউশন ফি ও পরীক্ষাভিত্তিক ফি জেনারেটর</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: Monthly Tuition Fee Generator */}
          <Button 
            onClick={() => setIsMonthlyFeeDialogOpen(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-1.5" /> 🗓️ মাসভিত্তিক টিউশন ফি জেনারেট
          </Button>

          {/* Button 2: Exam Fee Auto-Assign */}
          <Button 
            onClick={() => setIsAutoAssignDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm"
          >
            <Zap className="w-4 h-4 mr-1.5 text-amber-300 fill-amber-300" /> পরীক্ষা ফি অটো-অ্যাসাইন
          </Button>

          {/* Button 3: Exam Rates Setting */}
          <Button 
            onClick={() => setIsExamRatesDialogOpen(true)}
            variant="outline" 
            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl h-10"
          >
            <Settings2 className="w-4 h-4 mr-1.5 text-slate-600" /> পরীক্ষা ফি হার
          </Button>

          {/* Button 4: Single Invoice */}
          <Button 
            onClick={() => setIsSingleDialogOpen(true)}
            variant="secondary"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl h-10"
          >
            <Plus className="w-4 h-4 mr-1" /> একচ্ছত্র ইনভয়েস
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <Card className="bg-white border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">সর্বমোট আদায়কৃত ফি</p>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">৳ {totalCollectedAmount.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">বকেয়া ইনভয়েস মোট</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">৳ {totalDueAmount.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">মোট জেনারেটকৃত ইনভয়েস</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{invoices.length} টি</h3>
            </div>
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden print:hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-5">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">ইনভয়েস ও ফি পরিশোধের তালিকা</CardTitle>
            <CardDescription className="text-xs text-slate-500">মোট প্রদর্শন: {filteredInvoices.length} টি ইনভয়েস</CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 rounded-xl border-slate-300 bg-white text-xs h-9">
                <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                <SelectItem value="Paid">পরিশোধিত (Paid)</SelectItem>
                <SelectItem value="Unpaid">বকেয়া (Unpaid)</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="শিক্ষার্থীর নাম / আইডি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs rounded-xl text-xs bg-white border-slate-300 h-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">ইনভয়েস তালিকা লোড হচ্ছে...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো ইনভয়েস পাওয়া যায়নি।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 w-12 text-center">#SL</TableHead>
                    <TableHead className="font-bold text-slate-700">স্টুডেন্ট আইডি</TableHead>
                    <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">শ্রেণি</TableHead>
                    <TableHead className="font-bold text-slate-700">ফি বিবরণ / টাইটেল</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">পরিমাণ</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">স্ট্যাটাস</TableHead>
                    <TableHead className="w-[120px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv, invIndex) => {
                    const profile = inv.students?.profiles;
                    const isPaid = inv.status === 'Paid';

                    return (
                      <TableRow key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-mono text-center text-xs font-bold text-slate-400">
                          {invIndex + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-emerald-700">
                          {inv.students?.student_id_number || 'N/A'}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 text-xs">
                          {profile?.full_name_bn || profile?.full_name_en || 'শিক্ষার্থী'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {inv.students?.classes?.name || 'দাখিল'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 text-xs">
                          {inv.title}
                        </TableCell>
                        <TableCell className="text-center font-bold font-mono text-xs text-slate-900">
                          ৳ {Number(inv.total_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {isPaid ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              পরিশোধিত
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                              বকেয়া
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isPaid ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setReceiptInvoice(inv); setIsReceiptOpen(true); }}
                              className="text-xs text-emerald-700 font-bold hover:bg-emerald-50"
                            >
                              রসিদ
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleCollectPayment(inv)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-8 px-3"
                            >
                              ফি জমা নিন
                            </Button>
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

      {/* ─── Modal 1: Bulk Monthly Tuition Fee Generator ─── */}
      <Dialog open={isMonthlyFeeDialogOpen} onOpenChange={setIsMonthlyFeeDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" /> মাসভিত্তিক টিউশন ফি স্বয়ংক্রিয় জেনারেটর
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">১. মাস নির্বাচন করুন *</Label>
              <Select value={selectedMonthName} onValueChange={setSelectedMonthName}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="মাস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="জানুয়ারি ২০২৬">জানুয়ারি ২০২৬</SelectItem>
                  <SelectItem value="ফেব্রুয়ারি ২০২৬">ফেব্রুয়ারি ২০২৬</SelectItem>
                  <SelectItem value="মার্চ ২০২৬">মার্চ ২০২৬</SelectItem>
                  <SelectItem value="এপ্রিল ২০২৬">এপ্রিল ২০২৬</SelectItem>
                  <SelectItem value="মে ২০২৬">মে ২০২৬</SelectItem>
                  <SelectItem value="জুন ২০২৬">জুন ২০২৬</SelectItem>
                  <SelectItem value="জুলাই ২০২৬">জুলাই ২০২৬</SelectItem>
                  <SelectItem value="আগস্ট ২০২৬">আগস্ট ২০২৬</SelectItem>
                  <SelectItem value="সেপ্টেম্বর ২০২৬">সেপ্টেম্বর ২০২৬</SelectItem>
                  <SelectItem value="অক্টোবর ২০২৬">অক্টোবর ২০২৬</SelectItem>
                  <SelectItem value="নভেম্বর ২০২৬">নভেম্বর ২০২৬</SelectItem>
                  <SelectItem value="ডিসেম্বর ২০২৬">ডিসেম্বর ২০২৬</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">২. শ্রেণি নির্বাচন করুন (অপশনাল)</Label>
              <Select value={monthlyClassId} onValueChange={setMonthlyClassId}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="সকল শ্রেণি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌟 সকল শ্রেণি (All Classes)</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} (মাসিক ফি: ৳{Number(c.monthly_fee || 500)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
              <p className="font-bold">💡 নির্দেশিকা:</p>
              <p className="text-[11px] text-teal-800">
                এই টুলটি প্রতিটি শিক্ষার্থীর নিজ নিজ শ্রেণিভিত্তিক নির্ধারিত **মাসিক টিউশন ফি** (যেমন: ৩য় শ্রেণি ৳৩০০, ১০ম শ্রেণি ৳৮০০) অনুযায়ী স্বয়ংক্রিয়ভাবে অনাদায়ি (Unpaid) ইনভয়েস জেনারেট করবে।
              </p>
            </div>

            <Button
              onClick={handleGenerateMonthlyTuitionFees}
              disabled={generatingMonthlyFees}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl h-11 shadow-md"
            >
              {generatingMonthlyFees ? "ইনভয়েস জেনারেট হচ্ছে..." : `[${selectedMonthName}] এর মাসিক ফি জেনারেট করুন`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 2: Bulk Exam Fee Auto-Assign Modal ─── */}
      <Dialog open={isAutoAssignDialogOpen} onOpenChange={setIsAutoAssignDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> পরীক্ষা ফি স্বয়ংক্রিয় অ্যাসাইন
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">১. পরীক্ষা নির্বাচন করুন *</Label>
              <Select value={autoExamId} onValueChange={setAutoExamId}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.exam_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">২. শ্রেণি নির্বাচন করুন</Label>
              <Select value={autoClassId} onValueChange={setAutoClassId}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="সকল শ্রেণি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌟 সকল শ্রেণি (All Classes)</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAutoAssignExamFee}
              disabled={autoAssigning}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 shadow-md"
            >
              {autoAssigning ? "ইনভয়েস তৈরি হচ্ছে..." : "পরীক্ষা ফি ইনভয়েস জেনারেট করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 3: Exam Rates Configuration Modal ─── */}
      <Dialog open={isExamRatesDialogOpen} onOpenChange={setIsExamRatesDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-slate-700" /> শ্রেণিভিত্তিক পরীক্ষা ফি হার সেটিং
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">পরীক্ষা নির্বাচন করুন</Label>
              <Select value={selectedExamIdForRates} onValueChange={(val) => {
                setSelectedExamIdForRates(val);
                const exMatrix = examClassFeesMatrix[val] || {};
                const rMap = {};
                classes.forEach(c => {
                  rMap[c.id] = String(exMatrix[c.id] || 600);
                });
                setEditableClassRates(rMap);
              }}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.exam_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-3">
              {classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-800 w-36">{cls.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-500">৳</span>
                    <Input
                      type="number"
                      value={editableClassRates[cls.id] || ''}
                      onChange={(e) => setEditableClassRates({ ...editableClassRates, [cls.id]: e.target.value })}
                      className="w-28 text-xs font-bold rounded-lg border-slate-300 h-8"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleSaveExamClassRates} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-10">
              সেটিং সংরক্ষণ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 4: Single Invoice Dialog ─── */}
      <Dialog open={isSingleDialogOpen} onOpenChange={setIsSingleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> নতুন একচ্ছত্র ইনভয়েস তৈরি
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">শিক্ষার্থী নির্বাচন করুন *</Label>
              <Select value={formData.student_id} onValueChange={(val) => setFormData({...formData, student_id: val})}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="শিক্ষার্থী নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(st => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.student_id_number} - {st.profiles?.full_name_bn || st.profiles?.full_name_en} ({st.classes?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">ফি এর টাইটেল / বিবরণ *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="যেমন: মাসিক টিউশন ফি"
                className="rounded-xl text-xs border-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">টাকার পরিমাণ (৳) *</Label>
              <Input
                type="number"
                value={formData.total_amount}
                onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                placeholder="যেমন: ৫০০"
                className="rounded-xl text-xs border-slate-300 font-bold"
              />
            </div>

            <Button onClick={handleGenerateInvoice} disabled={generating} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
              {generating ? "ইনভয়েস তৈরি হচ্ছে..." : "ইনভয়েস তৈরি করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 5: Money Receipt Printable Modal ─── */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-center text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> অফিশিয়াল ফি মানি রসিদ
            </DialogTitle>
          </DialogHeader>

          {receiptInvoice && (
            <div className="space-y-6 py-2">
              <div className="border-2 border-slate-800 rounded-2xl p-6 bg-white text-slate-900 shadow-lg space-y-4">
                <div className="text-center border-b border-slate-300 pb-3">
                  <h3 className="font-black text-xl text-slate-900 tracking-tight">{settings.madrasaNameBn}</h3>
                  <p className="text-xs text-slate-500 font-medium">{settings.address}</p>
                  <Badge className="bg-emerald-700 text-white text-[11px] font-bold mt-2">
                    অফিশিয়াল ফি পরিশোধের মানি রসিদ (PAID)
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">স্টুডেন্ট আইডি:</span>
                    <span className="font-mono font-bold text-emerald-700">{receiptInvoice.students?.student_id_number}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
                    <span className="font-extrabold text-slate-900">
                      {receiptInvoice.students?.profiles?.full_name_bn || receiptInvoice.students?.profiles?.full_name_en}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">শ্রেণি:</span>
                    <span className="font-bold text-slate-800">{receiptInvoice.students?.classes?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">ফি বিবরণ:</span>
                    <span className="font-semibold text-slate-800">{receiptInvoice.title}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-black text-emerald-800">
                    <span>মোট আদায়কৃত পরিমাণ:</span>
                    <span>৳ {Number(receiptInvoice.total_amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-2 text-center text-[10px] font-bold text-slate-600">
                  <div>
                    <div className="border-t border-slate-400 pt-1 mx-2">অভিভাবক স্বাক্ষর</div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 mx-2">ক্যাশিয়ার / অফিস স্বাক্ষর</div>
                  </div>
                </div>
              </div>

              <Button onClick={handlePrintReceipt} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 print:hidden">
                <Printer className="w-4 h-4 mr-2" /> মানি রসিদ প্রিন্ট করুন
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
