import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useSettings } from '../../hooks/useSettings';
import { 
  Trash2, Edit2, Plus, BookOpen, Layers, CheckCircle2, XCircle, UserCheck, ShieldCheck, GraduationCap, Star, Calendar, Clock, MapPin, Printer, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClassManagement() {
  const { settings } = useSettings();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Class Dialog State
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [classLevel, setClassLevel] = useState('দাখিল');
  const [classTeacherId, setClassTeacherId] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');

  // Subject Assignment Tab State
  const [selectedClassForSub, setSelectedClassForSub] = useState('');
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectMarks, setSubjectMarks] = useState('100');
  const [subjectCategory, setSubjectCategory] = useState('Mandatory'); // Mandatory vs Optional
  const [subjectTeacherId, setSubjectTeacherId] = useState('none');

  // Box Routine Tab State
  const [selectedRoutineClassId, setSelectedRoutineClassId] = useState('');
  const [isRoutineDialogOpen, setIsRoutineDialogOpen] = useState(false);
  const [routineForm, setRoutineForm] = useState({
    day_of_week: 'Saturday',
    period_number: 1,
    subject_id: '',
    teacher_id: '',
    room_number: 'কক্ষ-১০১',
    start_time: '09:00 AM',
    end_time: '09:45 AM'
  });

  const daysList = [
    { key: 'Saturday', name: 'শনিবার' },
    { key: 'Sunday', name: 'রবিবার' },
    { key: 'Monday', name: 'সোমবার' },
    { key: 'Tuesday', name: 'মঙ্গলবার' },
    { key: 'Wednesday', name: 'বুধবার' },
    { key: 'Thursday', name: 'বৃহস্পতিবার' }
  ];

  const periodsList = [
    { num: 1, label: '১ম পিরিয়ড', time: '09:00 - 09:45 AM' },
    { num: 2, label: '২য় পিরিয়ড', time: '09:45 - 10:30 AM' },
    { num: 3, label: '৩য় পিরিয়ড', time: '10:30 - 11:15 AM' },
    { num: 4, label: '৪র্থ পিরিয়ড', time: '11:45 AM - 12:30 PM' },
    { num: 5, label: '৫ম পিরিয়ড', time: '12:30 - 01:15 PM' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Teachers
      const { data: tData } = await supabase
        .from('profiles')
        .select('id, full_name_bn, full_name_en')
        .eq('role', 'teacher')
        .order('full_name_en');
      setTeachers(tData || []);

      // 2. Fetch Classes with class_teacher profile details
      const { data: cData, error: cErr } = await supabase
        .from('classes')
        .select(`
          id, name, level, is_active, class_teacher_id, monthly_fee,
          profiles:class_teacher_id (id, full_name_bn, full_name_en)
        `)
        .order('name');
      if (cErr) throw cErr;
      setClasses(cData || []);
      
      if (cData && cData.length > 0) {
        if (!selectedClassForSub) setSelectedClassForSub(cData[0].id);
        if (!selectedRoutineClassId) setSelectedRoutineClassId(cData[0].id);
      }

      // 3. Fetch Subjects
      const { data: sData, error: sErr } = await supabase
        .from('subjects')
        .select(`
          *,
          assigned_teacher:assigned_teacher_id (id, full_name_bn, full_name_en)
        `)
        .order('subject_name');
      if (sErr) throw sErr;
      setSubjects(sData || []);

      // 4. Fetch Routines
      fetchRoutines();

    } catch (error) {
      console.error('Error fetching initial data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutines = async () => {
    try {
      const { data: rData } = await supabase
        .from('class_routines')
        .select(`
          *,
          classes (id, name, level),
          subjects (id, subject_name),
          profiles:teacher_id (id, full_name_bn, full_name_en)
        `);
      setRoutines(rData || []);
    } catch (err) {
      console.error('Error fetching routines:', err);
    }
  };

  // --- Class CRUD Handlers ---
  const handleOpenClassDialog = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setClassName(cls.name);
      setClassLevel(cls.level || 'দাখিল');
      setClassTeacherId(cls.class_teacher_id || 'none');
    } else {
      setEditingClass(null);
      setClassName('');
      setClassLevel('দাখিল');
      setClassTeacherId('none');
    }
    setIsClassDialogOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;

    try {
      const payload = {
        name: className.trim(),
        level: classLevel,
        class_teacher_id: classTeacherId === 'none' ? null : classTeacherId
      };

      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update(payload)
          .eq('id', editingClass.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('classes')
          .insert([payload]);
        if (error) throw error;
      }

      setIsClassDialogOpen(false);
      fetchInitialData();
    } catch (error) {
      console.error('Error saving class:', error.message);
      alert('শ্রেণি সংরক্ষণে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleQuickAssignClassTeacher = async (classId, teacherIdVal) => {
    const val = teacherIdVal === 'none' ? null : teacherIdVal;
    try {
      const { error } = await supabase
        .from('classes')
        .update({ class_teacher_id: val })
        .eq('id', classId);

      if (error) throw error;
      fetchInitialData();
    } catch (error) {
      console.error('Error assigning class teacher:', error.message);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই শ্রেণিটি মুছে ফেলতে চান?')) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting class:', error.message);
    }
  };

  // --- Subject CRUD Handlers ---
  const handleOpenSubjectDialog = (sub = null) => {
    if (sub) {
      setEditingSubject(sub);
      setSubjectName(sub.subject_name);
      setSubjectCode(sub.subject_code || '');
      setSubjectMarks(String(sub.total_marks || 100));
      setSubjectCategory(sub.is_optional || sub.subject_category === 'Optional' ? 'Optional' : 'Mandatory');
      setSubjectTeacherId(sub.assigned_teacher_id || 'none');
    } else {
      setEditingSubject(null);
      setSubjectName('');
      setSubjectCode('');
      setSubjectMarks('100');
      setSubjectCategory('Mandatory');
      setSubjectTeacherId('none');
    }
    setIsSubjectDialogOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim() || !selectedClassForSub) return;

    try {
      const isOpt = subjectCategory === 'Optional';
      const payload = {
        class_id: selectedClassForSub,
        subject_name: subjectName.trim(),
        subject_code: subjectCode.trim() || null,
        total_marks: Number(subjectMarks) || 100,
        is_optional: isOpt,
        subject_category: subjectCategory,
        assigned_teacher_id: subjectTeacherId === 'none' ? null : subjectTeacherId
      };

      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(payload)
          .eq('id', editingSubject.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([payload]);
        if (error) throw error;
      }

      setIsSubjectDialogOpen(false);
      fetchInitialData();
    } catch (error) {
      console.error('Error saving subject:', error.message);
      alert('বিষয় সংরক্ষণে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleQuickAssignSubjectTeacher = async (subjectId, teacherVal) => {
    const val = teacherVal === 'none' ? null : teacherVal;
    try {
      const { error } = await supabase
        .from('subjects')
        .update({ assigned_teacher_id: val })
        .eq('id', subjectId);

      if (error) throw error;
      fetchInitialData();
    } catch (error) {
      console.error('Error assigning subject teacher:', error.message);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই বিষয়টি মুছে ফেলতে চান?')) return;
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting subject:', error.message);
    }
  };

  // --- Routine Box Handler ---
  const handleOpenRoutineDialog = (day, periodNum, existingRoutine = null) => {
    if (existingRoutine) {
      setRoutineForm({
        day_of_week: day,
        period_number: periodNum,
        subject_id: existingRoutine.subject_id || '',
        teacher_id: existingRoutine.teacher_id || '',
        room_number: existingRoutine.room_number || 'কক্ষ-১০১',
        start_time: existingRoutine.start_time || '09:00 AM',
        end_time: existingRoutine.end_time || '09:45 AM'
      });
    } else {
      const pObj = periodsList.find(p => p.num === periodNum);
      const times = pObj ? pObj.time.split(' - ') : ['09:00 AM', '09:45 AM'];
      const classSubs = subjects.filter(s => s.class_id === selectedRoutineClassId);
      const firstSub = classSubs[0];

      setRoutineForm({
        day_of_week: day,
        period_number: periodNum,
        subject_id: firstSub?.id || '',
        teacher_id: firstSub?.assigned_teacher_id || (teachers[0]?.id || ''),
        room_number: 'কক্ষ-১০১',
        start_time: times[0] || '09:00 AM',
        end_time: times[1] || '09:45 AM'
      });
    }
    setIsRoutineDialogOpen(true);
  };

  const handleSaveRoutineBox = async (e) => {
    e.preventDefault();
    if (!selectedRoutineClassId || !routineForm.subject_id) return;

    try {
      const subObj = subjects.find(s => s.id === routineForm.subject_id);
      const assignedTeacherId = routineForm.teacher_id || subObj?.assigned_teacher_id || null;

      const payload = {
        class_id: selectedRoutineClassId,
        subject_id: routineForm.subject_id,
        teacher_id: assignedTeacherId,
        day_of_week: routineForm.day_of_week,
        period_number: routineForm.period_number,
        start_time: routineForm.start_time,
        end_time: routineForm.end_time,
        room_number: routineForm.room_number
      };

      const { error } = await supabase
        .from('class_routines')
        .upsert(payload, { onConflict: 'class_id,day_of_week,period_number' });

      if (error) throw error;

      setIsRoutineDialogOpen(false);
      fetchRoutines();
    } catch (err) {
      console.error('Error saving routine box:', err.message);
      alert('রুটিন পিরিয়ড সংরক্ষণে সমস্যা: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredClasses = classes.filter(cls => 
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClassSubjects = subjects.filter(s => s.class_id === selectedClassForSub);
  const selectedRoutineClass = classes.find(c => c.id === selectedRoutineClassId);

  return (
    <div className="space-y-4 w-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">শ্রেণি, বিষয় ও বক্স-ওয়াইজ ক্লাস রুটিন প্যানেল</h2>
          <p className="text-slate-500 text-xs mt-1">মাদ্রাসার শ্রেণি, শ্রেণি শিক্ষক, বিষয় শিক্ষক ও বক্স-ওয়াইজ সাপ্তাহিক সময়সূচী নির্ধারণ</p>
        </div>

        <Button onClick={handlePrint} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl h-10">
          <Printer className="w-4 h-4 mr-1.5" /> রুটিন প্রিন্ট / পিডিএফ
        </Button>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-4 print:hidden">
          <TabsTrigger value="classes" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            🏫 শ্রেণি ও শ্রেণি শিক্ষক তালিকা
          </TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            📚 বিষয় ও বিষয় শিক্ষক ম্যাপিং
          </TabsTrigger>
          <TabsTrigger value="routine" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            📅 বক্স-ওয়াইজ ক্লাস রুটিন (Timetable)
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Classes & Class Teachers ─── */}
        <TabsContent value="classes" className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-bold text-slate-800">মাদ্রাসার অনুমোদিত শ্রেণিসমূহ</h3>
            <Button onClick={() => handleOpenClassDialog()} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs h-9">
              <Plus className="w-4 h-4 mr-1.5" /> নতুন শ্রেণি যোগ করুন
            </Button>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-5">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">শ্রেণিসমূহ ও দায়িত্বপ্রাপ্ত শ্রেণি শিক্ষক</CardTitle>
                <CardDescription className="text-xs text-slate-500">মোট শ্রেণি: {filteredClasses.length} টি</CardDescription>
              </div>

              <Input
                placeholder="শ্রেণির নাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs rounded-xl text-xs bg-white border-slate-300 h-9"
              />
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-slate-400">শ্রেণির তালিকা লোড হচ্ছে...</div>
              ) : filteredClasses.length === 0 ? (
                <div className="p-8 text-center text-slate-400">কোনো শ্রেণি পাওয়া যায়নি। নতুন শ্রেণি যোগ করুন।</div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold text-slate-700 w-12 text-center">#SL</TableHead>
                        <TableHead className="font-bold text-slate-700">শ্রেণির নাম</TableHead>
                        <TableHead className="font-bold text-slate-700">স্তর</TableHead>
                        <TableHead className="font-bold text-slate-700 text-center">মাসিক ফি (৳)</TableHead>
                        <TableHead className="font-bold text-slate-700">শ্রেণি শিক্ষক (Class Teacher)</TableHead>
                        <TableHead className="font-bold text-slate-700">স্ট্যাটাস</TableHead>
                        <TableHead className="w-[120px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((cls, clsIndex) => (
                        <TableRow key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-mono text-center text-xs font-bold text-slate-400">
                            {clsIndex + 1}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">{cls.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold text-xs">
                              {cls.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold font-mono">
                              ৳ {Number(cls.monthly_fee || 500).toLocaleString()} / মাস
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-56">
                              <Select 
                                value={cls.class_teacher_id || 'none'} 
                                onValueChange={(val) => handleQuickAssignClassTeacher(cls.id, val)}
                              >
                                <SelectTrigger className="h-8 text-xs rounded-lg border-slate-200 bg-white">
                                  <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none" className="text-slate-400">-- শ্রেণি শিক্ষক নির্ধারিত নয় --</SelectItem>
                                  {teachers.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                      {t.full_name_bn || t.full_name_en}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            {cls.is_active ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> সক্রিয়
                              </Badge>
                            ) : (
                              <Badge className="bg-red-50 text-red-700 border-red-200 text-xs flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3 text-red-600" /> নিষ্ক্রিয়
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenClassDialog(cls)} className="h-8 w-8 text-slate-600 hover:text-emerald-600">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(cls.id)} className="h-8 w-8 text-slate-600 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Subject & Teacher Mapping ─── */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label className="text-xs font-bold text-slate-700 whitespace-nowrap">শ্রেণি নির্বাচন করুন:</Label>
              <Select value={selectedClassForSub} onValueChange={setSelectedClassForSub}>
                <SelectTrigger className="w-52 rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.level} - {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => handleOpenSubjectDialog()} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs h-9">
              <Plus className="w-4 h-4 mr-1.5" /> নতুন বিষয় যোগ করুন
            </Button>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5">
              <CardTitle className="text-base font-bold text-slate-900">বিষয়সমূহ ও দায়িত্বপ্রাপ্ত বিষয় শিক্ষক (Subject Teacher)</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                এই বিষয়ের বিষয় শিক্ষক, শ্রেণি শিক্ষক অথবা এডমিন পরীক্ষায় নম্বর ইনপুট ও এডিট করতে পারবেন।
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {selectedClassSubjects.length === 0 ? (
                <div className="p-8 text-center text-slate-400">এই শ্রেণিতে কোনো বিষয় যুক্ত করা হয়নি। 'নতুন বিষয় যোগ করুন' বোতামটি টিপুন।</div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-bold text-slate-700 w-12 text-center">#SL</TableHead>
                        <TableHead className="font-bold text-slate-700">বিষয়ের নাম</TableHead>
                        <TableHead className="font-bold text-slate-700">টাইপ (Category)</TableHead>
                        <TableHead className="font-bold text-slate-700 text-center">মোট নম্বর</TableHead>
                        <TableHead className="font-bold text-slate-700">দায়িত্বপ্রাপ্ত বিষয় শিক্ষক (Assigned Teacher)</TableHead>
                        <TableHead className="w-[100px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClassSubjects.map((sub, sIndex) => {
                        const isOptional = sub.is_optional || sub.subject_category === 'Optional';

                        return (
                          <TableRow key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                            <TableCell className="font-mono text-center text-xs font-bold text-slate-400">
                              {sIndex + 1}
                            </TableCell>
                            <TableCell className="font-bold text-slate-900 text-xs">
                              {sub.subject_name}
                            </TableCell>
                            <TableCell>
                              {isOptional ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs font-bold">
                                  ৪র্থ বিষয় (Optional)
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-semibold">
                                  আবশ্যিক (Mandatory)
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs font-bold text-slate-700">
                              {sub.total_marks || 100}
                            </TableCell>
                            <TableCell>
                              <div className="w-60">
                                <Select 
                                  value={sub.assigned_teacher_id || 'none'} 
                                  onValueChange={(val) => handleQuickAssignSubjectTeacher(sub.id, val)}
                                >
                                  <SelectTrigger className="h-8 text-xs rounded-lg border-slate-200 bg-white">
                                    <SelectValue placeholder="বিষয় শিক্ষক নির্বাচন করুন" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none" className="text-slate-400">-- বিষয় শিক্ষক নির্ধারিত নয় --</SelectItem>
                                    {teachers.map((t) => (
                                      <SelectItem key={t.id} value={t.id}>
                                        {t.full_name_bn || t.full_name_en}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenSubjectDialog(sub)} className="h-8 w-8 text-slate-600 hover:text-emerald-600">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteSubject(sub.id)} className="h-8 w-8 text-slate-600 hover:text-red-600">
                                  <Trash2 className="w-4 h-4" />
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
        </TabsContent>

        {/* ─── Tab 3: Box-Wise Class Routine (Timetable) ─── */}
        <TabsContent value="routine" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 print:hidden">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label className="text-xs font-bold text-slate-700 whitespace-nowrap">শ্রেণির রুটিন দেখুন:</Label>
              <Select value={selectedRoutineClassId} onValueChange={setSelectedRoutineClassId}>
                <SelectTrigger className="w-56 rounded-xl border-slate-300 text-xs bg-white">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.level} - {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
              🏫 নির্বাচিত শ্রেণি: {selectedRoutineClass?.name || 'দাখিল ১০ম'}
            </Badge>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" /> সাপ্তাহিক বক্স-ওয়াইজ সময়সূচী (Class Routine Grid)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  প্রতিটি পিরিয়ড বক্সে বিষয়, বিষয় শিক্ষক ও কক্ষ নম্বর সেটিং করুন।
                </CardDescription>
              </div>

              <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-9 print:hidden">
                <Printer className="w-4 h-4 mr-1.5" /> রুটিন প্রিন্ট
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              {/* Printable Header */}
              <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-6">
                <h1 className="text-2xl font-black text-slate-900">{settings.madrasaNameBn}</h1>
                <p className="text-xs text-slate-600 font-medium">{settings.address}</p>
                <Badge className="bg-emerald-800 text-white text-xs font-bold mt-2">
                  অফিশিয়াল ক্লাস রুটিন - {selectedRoutineClass?.name} (২০২৬)
                </Badge>
              </div>

              {/* Box Grid Layout */}
              <div className="space-y-6">
                {daysList.map(dayObj => {
                  return (
                    <div key={dayObj.key} className="space-y-2">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <h4 className="font-bold text-sm text-slate-900">{dayObj.name} ({dayObj.key})</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {periodsList.map(pObj => {
                          const existingRoutine = routines.find(r => 
                            r.class_id === selectedRoutineClassId && 
                            r.day_of_week === dayObj.key && 
                            r.period_number === pObj.num
                          );

                          return (
                            <div
                              key={pObj.num}
                              onClick={() => handleOpenRoutineDialog(dayObj.key, pObj.num, existingRoutine)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                                existingRoutine 
                                  ? 'bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 border-emerald-200 hover:border-emerald-400 hover:shadow-md' 
                                  : 'bg-slate-50/60 border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="bg-emerald-600 text-white border-none text-[10px] font-bold px-2 py-0.5">
                                  {pObj.label}
                                </Badge>
                                <span className="text-[10px] font-mono text-slate-400 font-bold">{pObj.time}</span>
                              </div>

                              {existingRoutine ? (
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-xs text-slate-900">{existingRoutine.subjects?.subject_name}</h5>
                                  <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                                    👨‍🏫 {existingRoutine.profiles?.full_name_bn || existingRoutine.profiles?.full_name_en || 'শিক্ষক'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    🚪 {existingRoutine.room_number || 'কক্ষ-১০১'}
                                  </p>
                                </div>
                              ) : (
                                <div className="py-2 text-center text-[11px] text-slate-400 font-medium">
                                  + পিরিয়ড যুক্ত করুন
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Modal 1: Create / Edit Class Dialog ─── */}
      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              {editingClass ? 'শ্রেণির তথ্য সংশোধন' : 'নতুন শ্রেণি সংযোজন'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveClass} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="cName" className="text-xs font-semibold text-slate-700">শ্রেণির নাম *</Label>
              <Input
                id="cName"
                placeholder="যেমন: দাখিল ১০ম"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="rounded-xl text-xs border-slate-300"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cLevel" className="text-xs font-semibold text-slate-700">শিক্ষা স্তর (Level) *</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs">
                  <SelectValue placeholder="শিক্ষা স্তর" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ইবতেদায়ী">ইবতেদায়ী (Primary)</SelectItem>
                  <SelectItem value="দাখিল">দাখিল (Secondary)</SelectItem>
                  <SelectItem value="আলিম">আলিম (Higher Secondary)</SelectItem>
                  <SelectItem value="ফাজিল">ফাজিল (Degree)</SelectItem>
                  <SelectItem value="কামিল">কামিল (Masters)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cTeacher" className="text-xs font-semibold text-slate-700">শ্রেণি শিক্ষক (Class Teacher)</Label>
              <Select value={classTeacherId} onValueChange={setClassTeacherId}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs">
                  <SelectValue placeholder="শ্রেণি শিক্ষক নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-slate-400">-- শ্রেণি শিক্ষক নির্ধারিত নয় --</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name_bn || t.full_name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
              {editingClass ? 'হালনাগাদ করুন' : 'শ্রেণি যোগ করুন'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 2: Create / Edit Subject Dialog ─── */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              {editingSubject ? 'বিষয়ের তথ্য সংশোধন' : 'নতুন বিষয় সংযোজন'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSubject} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="sName" className="text-xs font-semibold text-slate-700">বিষয়ের নাম *</Label>
              <Input
                id="sName"
                placeholder="যেমন: আল-কুরআন ও তাফসীর"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="rounded-xl text-xs border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sCode" className="text-xs font-semibold text-slate-700">বিষয় কোড</Label>
                <Input
                  id="sCode"
                  placeholder="যেমন: 101"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="rounded-xl text-xs border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sMarks" className="text-xs font-semibold text-slate-700">মোট নম্বর *</Label>
                <Input
                  id="sMarks"
                  type="number"
                  required
                  value={subjectMarks}
                  onChange={(e) => setSubjectMarks(e.target.value)}
                  className="rounded-xl text-xs border-slate-300 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">বিষয়ের ধরন (Mandatory / Optional 4th Subject) *</Label>
              <Select value={subjectCategory} onValueChange={setSubjectCategory}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs">
                  <SelectValue placeholder="টাইপ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mandatory">আবশ্যিক বিষয় (Mandatory Subject)</SelectItem>
                  <SelectItem value="Optional">৪র্থ বিষয় (Optional 4th Subject)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">বিষয় শিক্ষক (Subject Teacher)</Label>
              <Select value={subjectTeacherId} onValueChange={setSubjectTeacherId}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs">
                  <SelectValue placeholder="বিষয় শিক্ষক নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-slate-400">-- বিষয় শিক্ষক নির্ধারিত নয় --</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name_bn || t.full_name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
              {editingSubject ? 'হালনাগাদ করুন' : 'বিষয় যোগ করুন'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Modal 3: Routine Period Box Assignment Dialog ─── */}
      <Dialog open={isRoutineDialogOpen} onOpenChange={setIsRoutineDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              পিকচার বক্স রুটিন সেটিং ({routineForm.period_number}ম পিরিয়ড)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveRoutineBox} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">বিষয় নির্বাচন করুন *</Label>
              <Select 
                value={routineForm.subject_id} 
                onValueChange={(val) => {
                  const subObj = subjects.find(s => s.id === val);
                  setRoutineForm({
                    ...routineForm,
                    subject_id: val,
                    teacher_id: subObj?.assigned_teacher_id || routineForm.teacher_id
                  });
                }}
              >
                <SelectTrigger className="rounded-xl border-slate-300 text-xs">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.filter(s => s.class_id === selectedRoutineClassId).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">বিষয় শিক্ষক *</Label>
              <Select value={routineForm.teacher_id} onValueChange={(val) => setRoutineForm({...routineForm, teacher_id: val})}>
                <SelectTrigger className="rounded-xl border-slate-300 text-xs">
                  <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name_bn || t.full_name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">শুরুর সময়</Label>
                <Input
                  value={routineForm.start_time}
                  onChange={(e) => setRoutineForm({...routineForm, start_time: e.target.value})}
                  className="rounded-xl text-xs border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">শেষের সময়</Label>
                <Input
                  value={routineForm.end_time}
                  onChange={(e) => setRoutineForm({...routineForm, end_time: e.target.value})}
                  className="rounded-xl text-xs border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">কক্ষ নম্বর / স্থান</Label>
              <Input
                value={routineForm.room_number}
                onChange={(e) => setRoutineForm({...routineForm, room_number: e.target.value})}
                placeholder="যেমন: কক্ষ-১০১"
                className="rounded-xl text-xs border-slate-300 font-mono"
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
              রুটিন বক্সে পিরিয়ড সংরক্ষণ করুন
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
