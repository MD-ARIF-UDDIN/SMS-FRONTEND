import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useSettings } from '../../hooks/useSettings';
import { calculateStudentOverallGPA, calculateSubjectGrade } from '../../lib/gpaCalculator';
import { 
  Search, Printer, Eye, UserCheck, GraduationCap, Building2, UserPlus, Plus, 
  CalendarCheck, Award, FileSpreadsheet, CheckCircle2, XCircle, Clock, UserX, Star, MapPin, Phone, Mail, Receipt, DollarSign, CreditCard, AlertCircle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function StudentManagement() {
  const { settings } = useSettings();
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  
  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isResultCardOpen, setIsResultCardOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [admissionReceipt, setAdmissionReceipt] = useState(null);
  const [isAdmissionReceiptOpen, setIsAdmissionReceiptOpen] = useState(false);

  // Student Invoices Map for Real-time Fee Status: { [student_id]: { paidTotal, dueTotal, invoices: [] } }
  const [studentFeeSummaryMap, setStudentFeeSummaryMap] = useState({});

  // Student Attendance History State
  const [studentAttendanceLogs, setStudentAttendanceLogs] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Student Result History & Card State
  const [studentExams, setStudentExams] = useState([]);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [studentMarksMap, setStudentMarksMap] = useState({});
  const [selectedExamId, setSelectedExamId] = useState('');
  const [resultLoading, setResultLoading] = useState(false);

  // Student Payment History State
  const [studentInvoicesList, setStudentInvoicesList] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Admission Form State (with Admission Fee & Monthly Tuition Fee)
  const [formData, setFormData] = useState({
    fullNameEn: '',
    fullNameBn: '',
    studentIdNumber: '',
    classId: '',
    gender: 'Male',
    phonePrimary: '',
    addressPresent: '',
    admissionFeeAmount: '3000',
    monthlyFeeAmount: '800',
    isFeePaidNow: true
  });

  // Edit Monthly Fee State
  const [editingStudentFee, setEditingStudentFee] = useState(null);
  const [newMonthlyFeeVal, setNewMonthlyFeeVal] = useState('');
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
    generateStudentId();
  }, []);

  const generateStudentId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, studentIdNumber: `2026-ST-${randomNum}` }));
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Classes
      const { data: cData } = await supabase.from('classes').select('*').order('name');
      if (cData) {
        setClassesList(cData);
        if (cData.length > 0 && !formData.classId) {
          setFormData(prev => ({ ...prev, classId: cData[0].id }));
        }
      }

      // 2. Students (with class-wise monthly_fee & custom_monthly_fee)
      const { data: sData, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id_number,
          status,
          class_id,
          monthly_fee,
          custom_monthly_fee,
          profiles (full_name_bn, full_name_en, phone_primary, address_present, gender),
          classes (id, name, level, monthly_fee)
        `)
        .order('student_id_number');
      
      if (error) throw error;
      setStudents(sData || []);

      // 3. Fetch Invoices summary mapped by student_id
      const { data: invData } = await supabase.from('invoices').select('*');
      const fMap = {};
      if (invData) {
        invData.forEach(inv => {
          if (!fMap[inv.student_id]) {
            fMap[inv.student_id] = { paidTotal: 0, dueTotal: 0, invoices: [] };
          }
          fMap[inv.student_id].invoices.push(inv);
          const amt = Number(inv.total_amount || 0);
          if (inv.status === 'Paid') {
            fMap[inv.student_id].paidTotal += amt;
          } else {
            fMap[inv.student_id].dueTotal += amt;
          }
        });
      }
      setStudentFeeSummaryMap(fMap);

    } catch (error) {
      console.error('Error fetching student initial data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Openers ---
  const openIdCardModal = (student) => {
    setSelectedStudent(student);
    setIsIdCardOpen(true);
  };

  const openAttendanceHistoryModal = async (student) => {
    setSelectedStudent(student);
    setIsAttendanceOpen(true);
    setAttendanceLoading(true);

    try {
      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false });

      setStudentAttendanceLogs(attData || []);
    } catch (err) {
      console.error('Error fetching student attendance:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const openResultCardModal = async (student) => {
    setSelectedStudent(student);
    setIsResultCardOpen(true);
    setResultLoading(true);

    try {
      const classId = student.class_id || student.classes?.id;

      // 1. Fetch Class Subjects
      const { data: subData } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', classId)
        .order('subject_name');

      const classSubs = subData && subData.length > 0 ? subData : [
        { id: 'sub-1', subject_name: 'আল-কুরআন ও তাফসীর', total_marks: 100 },
        { id: 'sub-2', subject_name: 'আল-হাদীস', total_marks: 100 },
        { id: 'sub-3', subject_name: 'আরবি ২য় পত্র', total_marks: 100 },
        { id: 'sub-4', subject_name: 'গণিত', total_marks: 100 }
      ];
      setStudentSubjects(classSubs);

      // 2. Fetch Exams
      const { data: exData } = await supabase.from('exams').select('*').order('exam_name');
      const examList = exData && exData.length > 0 ? exData : [];
      setStudentExams(examList);
      if (examList.length > 0) setSelectedExamId(examList[0].id);

      // 3. Fetch Student Marks Entries
      const { data: mData } = await supabase
        .from('marks_entry')
        .select('*')
        .eq('student_id', student.id);

      const map = {};
      if (mData) {
        mData.forEach(m => {
          if (!map[m.exam_id]) map[m.exam_id] = {};
          map[m.exam_id][m.subject_id] = m;
        });
      }
      setStudentMarksMap(map);

    } catch (err) {
      console.error('Error fetching student result history:', err);
    } finally {
      setResultLoading(false);
    }
  };

  const openPaymentHistoryModal = async (student) => {
    setSelectedStudent(student);
    setIsPaymentHistoryOpen(true);
    setPaymentLoading(true);

    try {
      const { data: invList } = await supabase
        .from('invoices')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      setStudentInvoicesList(invList || []);
    } catch (err) {
      console.error('Error fetching student payment history:', err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayStudentInvoice = async (inv) => {
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

      if (selectedStudent) {
        openPaymentHistoryModal(selectedStudent);
      }
      fetchInitialData();
      alert('ফি সফলভাবে আদায় করা হয়েছে!');
    } catch (e) {
      console.error(e);
      alert('ফি আদায় ব্যর্থ হয়েছে');
    }
  };

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          full_name_en: formData.fullNameEn,
          full_name_bn: formData.fullNameBn || formData.fullNameEn,
          gender: formData.gender,
          phone_primary: formData.phonePrimary,
          address_present: formData.addressPresent,
          role: 'student'
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      const studentClassObj = classesList.find(c => c.id === formData.classId);
      const className = studentClassObj ? studentClassObj.name : 'শ্রেণি';

      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .insert([{
          id: profileData.id,
          student_id_number: formData.studentIdNumber,
          class_id: formData.classId || (classesList[0]?.id || null),
          status: 'Active'
        }])
        .select()
        .single();

      if (studentError) throw studentError;

      const feeAmount = Number(formData.admissionFeeAmount || 3000);
      const invoiceStatus = formData.isFeePaidNow ? 'Paid' : 'Unpaid';
      const invoiceTitle = `নব ভর্তি ও সেশন ফি ২০২৬ (${className})`;

      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert([{
          student_id: profileData.id,
          title: invoiceTitle,
          total_amount: feeAmount,
          status: invoiceStatus,
          due_date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (invError) throw invError;

      if (formData.isFeePaidNow && invData) {
        await supabase.from('payments').insert([{
          invoice_id: invData.id,
          amount_paid: feeAmount,
          payment_date: new Date().toISOString().split('T')[0]
        }]);

        setAdmissionReceipt({
          invoiceId: invData.id,
          studentId: formData.studentIdNumber,
          studentName: formData.fullNameBn || formData.fullNameEn,
          className: className,
          title: invoiceTitle,
          amount: feeAmount,
          date: new Date().toLocaleDateString('bn-BD')
        });
        setIsAdmissionReceiptOpen(true);
      }

      setIsAdmissionOpen(false);
      setFormData({
        fullNameEn: '', fullNameBn: '', studentIdNumber: '', classId: classesList[0]?.id || '', 
        gender: 'Male', phonePrimary: '', addressPresent: '', admissionFeeAmount: '3000', isFeePaidNow: true
      });
      generateStudentId();
      fetchInitialData();
      
    } catch (error) {
      console.error('Error in admission:', error.message);
      alert('ভর্তি প্রক্রিয়া ব্যর্থ হয়েছে: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = students.filter(st => {
    const nameBn = st.profiles?.full_name_bn || '';
    const nameEn = st.profiles?.full_name_en || '';
    const stId = st.student_id_number || '';
    const className = st.classes?.name || '';

    const matchesSearch = nameBn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClassFilter === 'all' || className === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  // Attendance stats for selected student (excluding Holidays from absent penalty)
  const totalAttDays = studentAttendanceLogs.length;
  const presentDays = studentAttendanceLogs.filter(a => a.status === 'Present').length;
  const absentDays = studentAttendanceLogs.filter(a => a.status === 'Absent').length;
  const holidayDays = studentAttendanceLogs.filter(a => a.status === 'Holiday').length;
  const totalAcademicDays = totalAttDays - holidayDays;
  const attPercentage = totalAcademicDays > 0 ? Math.round((presentDays / totalAcademicDays) * 100) : 100;

  // Selected Exam Marks for Result Card
  const activeExamMarksMap = selectedStudent && selectedExamId ? (studentMarksMap[selectedExamId] || {}) : {};
  const studentOverallResult = calculateStudentOverallGPA(activeExamMarksMap, studentSubjects);
  const activeExamObj = studentExams.find(e => e.id === selectedExamId);

  // Selected Student Payment Totals
  const selectedFeeSummary = selectedStudent ? (studentFeeSummaryMap[selectedStudent.id] || { paidTotal: 0, dueTotal: 0 }) : { paidTotal: 0, dueTotal: 0 };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">শিক্ষার্থী রেজিস্টার, ভর্তি ও পরিচিতি</h2>
          <p className="text-slate-500 text-xs mt-0.5">নতুন শিক্ষার্থী ভর্তি, ভর্তি ফি আদায়, বকেয়া পেমেন্ট ইতিহাস ও অফিশিয়াল রেজাল্ট কার্ড</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input 
              placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-slate-300 text-xs h-10"
            />
          </div>

          {/* Add Student Modal Trigger */}
          <Dialog open={isAdmissionOpen} onOpenChange={setIsAdmissionOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm">
                <Plus className="w-4 h-4 mr-1.5" /> নতুন শিক্ষার্থী ভর্তি ও ফি
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-white border-slate-200 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" /> নতুন শিক্ষার্থী ভর্তি ও ভর্তি ফি আবেদন ফরম
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAdmissionSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullNameBn" className="text-xs font-semibold text-slate-700">শিক্ষার্থীর নাম (বাংলা) *</Label>
                    <Input
                      id="fullNameBn"
                      placeholder="যেমন: আব্দুল্লাহ আল মামুন"
                      required
                      value={formData.fullNameBn}
                      onChange={(e) => setFormData({...formData, fullNameBn: e.target.value})}
                      className="rounded-xl border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="fullNameEn" className="text-xs font-semibold text-slate-700">Name (English) *</Label>
                    <Input
                      id="fullNameEn"
                      placeholder="e.g. Abdullah Al Mamun"
                      required
                      value={formData.fullNameEn}
                      onChange={(e) => setFormData({...formData, fullNameEn: e.target.value})}
                      className="rounded-xl border-slate-300 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="studentIdNumber" className="text-xs font-semibold text-slate-700">স্টুডেন্ট আইডি *</Label>
                    <Input
                      id="studentIdNumber"
                      required
                      value={formData.studentIdNumber}
                      onChange={(e) => setFormData({...formData, studentIdNumber: e.target.value})}
                      className="rounded-xl border-slate-300 font-mono bg-slate-50 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="classId" className="text-xs font-semibold text-slate-700">ভর্তিকৃত শ্রেণি *</Label>
                    <Select value={formData.classId} onValueChange={(val) => setFormData({...formData, classId: val})}>
                      <SelectTrigger id="classId" className="rounded-xl border-slate-300 text-xs">
                        <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {classesList.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.level} - {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">লিঙ্গ (Gender) *</Label>
                    <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                      <SelectTrigger id="gender" className="rounded-xl border-slate-300 text-xs">
                        <SelectValue placeholder="লিঙ্গ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">ছাত্র (Male)</SelectItem>
                        <SelectItem value="Female">ছাত্রী (Female)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phonePrimary" className="text-xs font-semibold text-slate-700">অভিভাবক ফোন *</Label>
                    <Input
                      id="phonePrimary"
                      placeholder="017XXXXXXXX"
                      required
                      value={formData.phonePrimary}
                      onChange={(e) => setFormData({...formData, phonePrimary: e.target.value})}
                      className="rounded-xl border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addressPresent" className="text-xs font-semibold text-slate-700">বর্তমান ঠিকানা *</Label>
                  <Textarea
                    id="addressPresent"
                    placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
                    rows={2}
                    required
                    value={formData.addressPresent}
                    onChange={(e) => setFormData({...formData, addressPresent: e.target.value})}
                    className="rounded-xl border-slate-300 text-xs"
                  />
                </div>

                {/* Admission Fee & Payment Section */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> ভর্তি ও সেশন ফি বিবরণ (Admission Fee)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700">ভর্তি ও সেশন ফি পরিমাণ (৳) *</Label>
                      <Input
                        type="number"
                        value={formData.admissionFeeAmount}
                        onChange={(e) => setFormData({...formData, admissionFeeAmount: e.target.value})}
                        className="rounded-xl border-slate-300 font-bold bg-white text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 mt-4 sm:mt-0">
                      <Label className="text-xs font-bold text-slate-800 cursor-pointer">নগদ ফি পরিশোধিত (Paid Now)?</Label>
                      <Switch
                        checked={formData.isFeePaidNow}
                        onCheckedChange={(val) => setFormData({...formData, isFeePaidNow: val})}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 shadow-md">
                  {submitting ? "ভর্তি ও ফি প্রসেস হচ্ছে..." : "শিক্ষার্থী ভর্তি ও মানি রসিদ সম্পন্ন করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Single Clean Capsule Pill Class Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <button
          onClick={() => setSelectedClassFilter('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
            selectedClassFilter === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <span>🌟 সকল শ্রেণি</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            selectedClassFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {students.length}
          </span>
        </button>

        {classesList.map(cls => {
          const classCount = students.filter(s => (s.classes?.name || '') === cls.name).length;
          const isSelected = selectedClassFilter === cls.name;

          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassFilter(cls.name)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span>{cls.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {classCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Student Register Table with #SL and Fee Due Columns */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden print:hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between py-3.5 px-5">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">ভর্তিকৃত শিক্ষার্থী তালিকা</CardTitle>
            <CardDescription className="text-xs text-slate-500">মোট শিক্ষার্থী: {filteredStudents.length} জন</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">শিক্ষার্থীদের তালিকা লোড হচ্ছে...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো শিক্ষার্থী পাওয়া যায়নি। নতুন ভর্তিতে যান।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 w-12 text-center">#SL</TableHead>
                    <TableHead className="font-bold text-slate-700">স্টুডেন্ট আইডি</TableHead>
                    <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">শ্রেণি</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">মাসিক ফি (৳)</TableHead>
                    <TableHead className="font-bold text-slate-700">ফি ও বকেয়া স্ট্যাটাস</TableHead>
                    <TableHead className="font-bold text-slate-700">অভিভাবকের ফোন</TableHead>
                    <TableHead className="w-[360px] text-right font-bold text-slate-700">অ্যাকশন ও ইতিহাস</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => {
                    const feeInfo = studentFeeSummaryMap[student.id] || { paidTotal: 0, dueTotal: 0 };
                    const hasDue = feeInfo.dueTotal > 0;
                    const effectiveMonthlyFee = Number(student.custom_monthly_fee || student.classes?.monthly_fee || 500);

                    return (
                      <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-mono text-center text-xs font-bold text-slate-500">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-emerald-700 text-xs">
                          {student.student_id_number}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          <div>
                            <p>{student.profiles?.full_name_bn || student.profiles?.full_name_en || 'শিক্ষার্থী'}</p>
                            <p className="text-xs text-slate-400 font-normal">{student.profiles?.full_name_en || 'Student'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold text-xs">
                            {student.classes?.name || 'অনির্ধারিত'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-teal-50 text-teal-800 border-teal-200 text-xs font-bold font-mono">
                            ৳ {effectiveMonthlyFee.toLocaleString()} / মাস
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasDue ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-xs font-bold gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> বকেয়া: ৳{feeInfo.dueTotal.toLocaleString()}
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> পরিশোধিত
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600">
                          {student.profiles?.phone_primary || '017XXXXXXXX'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            {/* 1. Payment & Due History Button */}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openPaymentHistoryModal(student)}
                              className="text-[11px] text-amber-800 border-amber-300 bg-amber-50/60 hover:bg-amber-100 rounded-lg px-2 h-8 font-bold"
                            >
                              <CreditCard className="w-3.5 h-3.5 mr-1 text-amber-600" /> পেমেন্ট
                            </Button>

                            {/* 2. ID Card Button */}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openIdCardModal(student)}
                              className="text-[11px] text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 rounded-lg px-2 h-8"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 text-emerald-600" /> কার্ড
                            </Button>

                            {/* 3. Attendance History Button */}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openAttendanceHistoryModal(student)}
                              className="text-[11px] text-teal-700 border-teal-200 bg-teal-50/50 hover:bg-teal-100 rounded-lg px-2 h-8"
                            >
                              <CalendarCheck className="w-3.5 h-3.5 mr-1 text-teal-600" /> হাজিরা
                            </Button>

                            {/* 4. Result History & Result Card Button */}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openResultCardModal(student)}
                              className="text-[11px] text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100 rounded-lg px-2 h-8"
                            >
                              <Award className="w-3.5 h-3.5 mr-1 text-purple-600" /> ফলাফল
                            </Button>
                          </div>
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

      {/* ─── Modal 1: Student ID Card ─── */}
      <Dialog open={isIdCardOpen} onOpenChange={setIsIdCardOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" /> ডিজিটাল শিক্ষার্থী পরিচয়পত্র
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-2">
              <div className="border-2 border-emerald-500 rounded-2xl p-6 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden text-center">
                <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">
                  {settings.madrasaNameBn}
                </div>
                <h3 className="font-extrabold text-xl text-white">স্টুডেন্ট আইডি কার্ড</h3>
                
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-400 mx-auto my-4 flex items-center justify-center text-emerald-400 font-extrabold text-2xl shadow-inner">
                  {(selectedStudent.profiles?.full_name_bn || 'S')[0]}
                </div>

                <h4 className="font-bold text-lg text-white">{selectedStudent.profiles?.full_name_bn || selectedStudent.profiles?.full_name_en}</h4>
                <p className="text-emerald-300 text-xs font-mono mt-0.5">{selectedStudent.student_id_number}</p>

                <div className="mt-4 pt-4 border-t border-slate-700/80 text-left text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">শ্রেণি:</span>
                    <span className="font-semibold text-white">{selectedStudent.classes?.name || 'অনির্ধারিত'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">অভিভাবক ফোন:</span>
                    <span className="font-semibold text-white">{selectedStudent.profiles?.phone_primary || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ঠিকানা:</span>
                    <span className="font-semibold text-white truncate max-w-[180px]">{settings.address}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handlePrint} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                <Printer className="w-4 h-4 mr-2" /> আইডি কার্ড প্রিন্ট করুন
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal 2: Attendance History ─── */}
      <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <DialogContent className="sm:max-w-lg bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-teal-600" /> উপস্থিতি ইতিহাস - {selectedStudent?.profiles?.full_name_bn || selectedStudent?.profiles?.full_name_en}
            </DialogTitle>
          </DialogHeader>

          {attendanceLoading ? (
            <div className="py-12 text-center text-slate-400">হাজিরা ইতিহাস লোড হচ্ছে...</div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">মোট দিন</span>
                  <span className="text-sm font-extrabold text-slate-800">{totalAttDays} দিন</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <span className="text-[9px] text-emerald-600 font-bold uppercase block">উপস্থিত</span>
                  <span className="text-sm font-extrabold text-emerald-700">{presentDays} দিন</span>
                </div>
                <div className="bg-red-50 p-2 rounded-xl border border-red-200">
                  <span className="text-[9px] text-red-600 font-bold uppercase block">অনুপস্থিত</span>
                  <span className="text-sm font-extrabold text-red-700">{absentDays} দিন</span>
                </div>
                <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-200">
                  <span className="text-[9px] text-indigo-600 font-bold uppercase block">ছুটি</span>
                  <span className="text-sm font-extrabold text-indigo-700">{holidayDays} দিন</span>
                </div>
                <div className="bg-teal-50 p-2 rounded-xl border border-teal-200">
                  <span className="text-[9px] text-teal-600 font-bold uppercase block">উপস্থিতি %</span>
                  <span className="text-sm font-extrabold text-teal-800">{attPercentage}%</span>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-slate-700 w-12 text-center">#SL</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700">তারিখ</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 text-center">উপস্থিতি স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAttendanceLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-slate-400 py-6 text-xs">
                          কোনো উপস্থিতির রেকর্ড পাওয়া যায়নি।
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentAttendanceLogs.map((log, index) => (
                        <TableRow key={log.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-center text-xs font-bold text-slate-400">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">
                            {new Date(log.date).toLocaleDateString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-center">
                            {log.status === 'Present' ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-600" /> উপস্থিত
                              </Badge>
                            ) : log.status === 'Holiday' ? (
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs gap-1">
                                🌴 ছুটি (Holiday)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
                                <UserX className="w-3 h-3 text-red-600" /> অনুপস্থিত
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal 3: Result History & Printable Result Card ─── */}
      <Dialog open={isResultCardOpen} onOpenChange={setIsResultCardOpen}>
        <DialogContent className="sm:max-w-2xl bg-white border-slate-200 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" /> ফলাফল ইতিহাস ও অফিশিয়াল রেজাল্ট কার্ড
            </DialogTitle>
          </DialogHeader>

          {resultLoading ? (
            <div className="py-12 text-center text-slate-400">রেজাল্ট কার্ড লোড হচ্ছে...</div>
          ) : selectedStudent && (
            <div className="space-y-6 py-2">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 print:hidden">
                <Label className="text-xs font-bold text-slate-700 whitespace-nowrap">পরীক্ষা নির্বাচন করুন:</Label>
                <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                  <SelectTrigger className="rounded-xl border-slate-300 bg-white text-xs h-9">
                    <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentExams.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.exam_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-2 border-slate-800 rounded-2xl p-6 bg-white text-slate-900 shadow-md space-y-5">
                <div className="text-center border-b border-slate-300 pb-4 space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{settings.madrasaNameBn}</h2>
                  {settings.madrasaNameEn && (
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{settings.madrasaNameEn}</p>
                  )}
                  <p className="text-xs text-slate-600 font-medium">{settings.slogan || 'দ্বীনি শিক্ষা ও সুন্নাহ ভিত্তিক আদর্শ চরিত্র গঠন'}</p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                    <span>ইআইআইএন (EIIN): <strong>{settings.eiinNumber}</strong></span>
                    <span>•</span>
                    <span>ঠিকানা: {settings.address}</span>
                  </div>

                  <div className="pt-2">
                    <Badge className="bg-emerald-700 text-white text-xs font-bold px-4 py-1">
                      {activeExamObj?.exam_name || 'বার্ষিক পরীক্ষা ২০২৬'} - অফিশিয়াল একাডেমিক মার্কশিট
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">শিক্ষার্থীর নাম: </span>
                    <span className="font-extrabold text-slate-900">
                      {selectedStudent.profiles?.full_name_bn || selectedStudent.profiles?.full_name_en}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">স্টুডেন্ট আইডি: </span>
                    <span className="font-mono font-bold text-emerald-700">{selectedStudent.student_id_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">শ্রেণি: </span>
                    <span className="font-bold text-slate-800">{selectedStudent.classes?.name || 'দাখিল ১০ম'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">অভিভাবক ফোন: </span>
                    <span className="font-mono text-slate-700">{selectedStudent.profiles?.phone_primary || 'N/A'}</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <Table className="border-collapse">
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        <TableHead className="font-bold text-slate-800 text-xs border-r border-slate-200 w-10 text-center">#SL</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs border-r border-slate-200">বিষয় (Subject)</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs border-r border-slate-200 text-center">টাইপ</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs border-r border-slate-200 text-center">মোট</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs border-r border-slate-200 text-center">প্রাপ্ত নম্বর</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs border-r border-slate-200 text-center">গ্রেড</TableHead>
                        <TableHead className="font-bold text-slate-800 text-xs text-right">গ্রেড পয়েন্ট (GP)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentSubjects.map((sub, index) => {
                        const mEntry = activeExamMarksMap[sub.id];
                        const marks = mEntry ? Number(mEntry.marks_obtained || 0) : 0;
                        const isAbsent = mEntry ? Boolean(mEntry.is_absent) : false;
                        const { grade, point } = calculateSubjectGrade(marks, isAbsent);
                        const isOptional = sub.is_optional || sub.subject_category === 'Optional';

                        return (
                          <TableRow key={sub.id} className="hover:bg-slate-50">
                            <TableCell className="font-mono text-center text-xs font-bold text-slate-400 border-r border-slate-200">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-bold text-slate-900 text-xs border-r border-slate-200">
                              {sub.subject_name}
                            </TableCell>
                            <TableCell className="text-center text-[10px] border-r border-slate-200">
                              {isOptional ? (
                                <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">৪র্থ বিষয়</span>
                              ) : (
                                <span className="text-slate-500">আবশ্যিক</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs border-r border-slate-200">{sub.total_marks || 100}</TableCell>
                            <TableCell className="text-center font-bold text-xs border-r border-slate-200">
                              {isAbsent ? <span className="text-red-600">Abs</span> : marks}
                            </TableCell>
                            <TableCell className="text-center border-r border-slate-200">
                              {grade === 'F' ? (
                                <span className="text-red-600 font-extrabold text-xs">F</span>
                              ) : (
                                <span className="font-extrabold text-xs text-emerald-700">{grade}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-extrabold text-xs font-mono text-slate-900">
                              {point.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 text-white p-4 rounded-xl gap-3">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">সর্বমোট প্রাপ্ত নম্বর:</span>
                    <span className="text-lg font-extrabold text-white">{studentOverallResult.totalMarks} / {studentSubjects.length * 100}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-emerald-400 font-bold block">সর্বমোট GPA (5.00 Scale):</span>
                      <span className="text-2xl font-extrabold text-emerald-300">{studentOverallResult.gpa} ({studentOverallResult.letterGrade})</span>
                    </div>

                    <div className="pl-3 border-l border-slate-700">
                      {studentOverallResult.isPassed ? (
                        <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5">
                          চুড়ান্ত ফলাফল: পাস
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/40 font-bold text-xs px-3 py-1.5">
                          অকৃতকার্য ({studentOverallResult.failedCount} বিষয়ে)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-8 grid grid-cols-3 text-center text-[11px] font-bold text-slate-700">
                  <div>
                    <div className="border-t border-slate-400 pt-1 mx-2">শ্রেণি শিক্ষক স্বাক্ষর</div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 mx-2">অভিভাবক স্বাক্ষর</div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 mx-2">অধ্যক্ষ / প্রিন্সিপাল স্বাক্ষর</div>
                  </div>
                </div>
              </div>

              <Button onClick={handlePrint} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl h-11 print:hidden">
                <Printer className="w-4 h-4 mr-2" /> রেজাল্ট কার্ড প্রিন্ট করুন
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal 4: Payment History & Fee Due Modal ─── */}
      <Dialog open={isPaymentHistoryOpen} onOpenChange={setIsPaymentHistoryOpen}>
        <DialogContent className="sm:max-w-xl bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" /> পেমেন্ট ও ফি বকেয়া ইতিহাস - {selectedStudent?.profiles?.full_name_bn || selectedStudent?.profiles?.full_name_en}
            </DialogTitle>
          </DialogHeader>

          {paymentLoading ? (
            <div className="py-12 text-center text-slate-400">পেমেন্ট ইতিহাস লোড হচ্ছে...</div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Payment Summary Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span className="text-xs text-emerald-700 font-bold block">মোট পরিশোধিত ফি</span>
                  <h4 className="text-xl font-extrabold text-emerald-800 mt-0.5">৳ {selectedFeeSummary.paidTotal.toLocaleString()}</h4>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  <span className="text-xs text-amber-700 font-bold block">মোট বকেয়া ফি</span>
                  <h4 className="text-xl font-extrabold text-amber-800 mt-0.5">৳ {selectedFeeSummary.dueTotal.toLocaleString()}</h4>
                </div>
              </div>

              {/* Invoices List Table */}
              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-slate-700 w-12 text-center">#SL</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700">ফি টাইটেল / বিবরণ</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 text-center">টাকার পরিমাণ</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 text-center">স্ট্যাটাস</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentInvoicesList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-400 py-6 text-xs">
                          কোনো ইনভয়েস পাওয়া যায়নি।
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentInvoicesList.map((inv, index) => (
                        <TableRow key={inv.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-center text-xs font-bold text-slate-400">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-bold text-xs text-slate-900">
                            {inv.title}
                          </TableCell>
                          <TableCell className="text-center font-bold font-mono text-xs text-slate-800">
                            ৳ {Number(inv.total_amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            {inv.status === 'Paid' ? (
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
                            {inv.status === 'Paid' ? (
                              <span className="text-[11px] text-emerald-600 font-bold">✓ জমারিচিত</span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handlePayStudentInvoice(inv)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg h-7 px-2.5"
                              >
                                ফি জমা নিন
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Modal 5: Admission Money Receipt Modal ─── */}
      <Dialog open={isAdmissionReceiptOpen} onOpenChange={setIsAdmissionReceiptOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-center text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" /> অফিশিয়াল ভর্তি ও সেশন ফি রসিদ
            </DialogTitle>
          </DialogHeader>

          {admissionReceipt && (
            <div className="space-y-6 py-2">
              <div className="border-2 border-slate-800 rounded-2xl p-6 bg-white text-slate-900 shadow-lg space-y-4">
                <div className="text-center border-b border-slate-300 pb-3">
                  <h3 className="font-black text-xl text-slate-900 tracking-tight">{settings.madrasaNameBn}</h3>
                  <p className="text-xs text-slate-500 font-medium">{settings.address}</p>
                  <Badge className="bg-emerald-700 text-white text-[11px] font-bold mt-2">
                    ভর্তি ফি পরিশোধের অফিশিয়াল মানি রসিদ (PAID)
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">স্টুডেন্ট আইডি:</span>
                    <span className="font-mono font-bold text-emerald-700">{admissionReceipt.studentId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
                    <span className="font-extrabold text-slate-900">{admissionReceipt.studentName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">ভর্তিকৃত শ্রেণি:</span>
                    <span className="font-bold text-slate-800">{admissionReceipt.className}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">ফি বিবরণ:</span>
                    <span className="font-semibold text-slate-800">{admissionReceipt.title}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-sm font-black text-emerald-800">
                    <span>মোট আদায়কৃত ভর্তি ফি:</span>
                    <span>৳ {Number(admissionReceipt.amount).toLocaleString()}</span>
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

              <Button onClick={handlePrint} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 print:hidden">
                <Printer className="w-4 h-4 mr-2" /> ভর্তি ফি রসিদ প্রিন্ট করুন
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
