import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useSettings } from '../../hooks/useSettings';
import { 
  Trash2, Plus, Calendar, Clock, Printer, BookOpen, MapPin, UserCheck, CheckCircle2, Edit2, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function RoutineManagement() {
  const { settings } = useSettings();
  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  // Routine Box Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    { num: 5, label: '<ctrl42>ম পিরিয়ড', time: '12:30 - 01:15 PM' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Classes
      const { data: cData } = await supabase.from('classes').select('*').order('name');
      setClasses(cData || []);
      if (cData && cData.length > 0) {
        setSelectedClassId(cData[0].id);
      }

      // 2. Fetch Subjects
      const { data: sData } = await supabase.from('subjects').select('*').order('subject_name');
      setSubjects(sData || []);

      // 3. Fetch Teachers
      const { data: tData } = await supabase.from('profiles').select('id, full_name_bn, full_name_en').eq('role', 'teacher');
      setTeachers(tData || []);

      // 4. Fetch Class Routines
      fetchRoutines();
    } catch (e) {
      console.error('Error fetching initial routine data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutines = async () => {
    try {
      const { data, error } = await supabase
        .from('class_routines')
        .select(`
          *,
          classes(id, name, level),
          subjects(id, subject_name),
          profiles:teacher_id(id, full_name_bn, full_name_en)
        `);
      
      if (error) throw error;
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching class_routines:', error.message);
    }
  };

  const handleOpenRoutineDialog = (day, periodNum, existing = null) => {
    if (existing) {
      setRoutineForm({
        day_of_week: day,
        period_number: periodNum,
        subject_id: existing.subject_id || '',
        teacher_id: existing.teacher_id || '',
        room_number: existing.room_number || 'কক্ষ-১০১',
        start_time: existing.start_time || '09:00 AM',
        end_time: existing.end_time || '09:45 AM'
      });
    } else {
      const pObj = periodsList.find(p => p.num === periodNum);
      const times = pObj ? pObj.time.split(' - ') : ['09:00 AM', '09:45 AM'];
      const classSubs = subjects.filter(s => s.class_id === selectedClassId);

      setRoutineForm({
        day_of_week: day,
        period_number: periodNum,
        subject_id: classSubs[0]?.id || '',
        teacher_id: classSubs[0]?.assigned_teacher_id || (teachers[0]?.id || ''),
        room_number: 'কক্ষ-১০১',
        start_time: times[0] || '09:00 AM',
        end_time: times[1] || '09:45 AM'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveRoutineBox = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !routineForm.subject_id) return;

    try {
      const subObj = subjects.find(s => s.id === routineForm.subject_id);
      const assignedTeacherId = routineForm.teacher_id || subObj?.assigned_teacher_id || null;

      const payload = {
        class_id: selectedClassId,
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

      setIsDialogOpen(false);
      fetchRoutines();
    } catch (err) {
      console.error('Error saving routine box:', err.message);
      alert('রুটিন পিরিয়ড সংরক্ষণে সমস্যা: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedClassObj = classes.find(c => c.id === selectedClassId);
  const selectedClassSubjects = subjects.filter(s => s.class_id === selectedClassId);

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">ক্লাস রুটিন ও সময়সূচি (Box-Wise Timetable)</h2>
          <p className="text-slate-500 text-xs mt-0.5">মাদ্রাসার প্রতিদিনের শ্রেণিভিত্তিক পাঠদান, বিষয় শিক্ষক ও পিরিয়ড সময়সূচী</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Class Filter */}
          <div className="w-56">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="rounded-xl border-slate-300 text-xs h-10 bg-white">
                <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.level} - {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm">
            <Printer className="w-4 h-4 mr-1.5" /> রুটিন প্রিন্ট / পিডিএফ
          </Button>
        </div>
      </div>

      {/* Main Box Timetable Card */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between py-4 px-6">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" /> 
              সাপ্তাহিক রুটিন - {selectedClassObj?.name || 'শ্রেণি'}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              বক্স বক্সে বিষয়ের নাম, শিক্ষক ও পিরিয়ড সময় নির্ধারিত রয়েছে।
            </CardDescription>
          </div>

          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
            🏫 শ্রেণি: {selectedClassObj?.name || 'দাখিল ১০ম'}
          </Badge>
        </CardHeader>

        <CardContent className="p-6">
          {/* Printable Madrasa Header */}
          <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-6">
            <h1 className="text-2xl font-black text-slate-900">{settings.madrasaNameBn}</h1>
            <p className="text-xs text-slate-600 font-medium">{settings.address}</p>
            <Badge className="bg-emerald-800 text-white text-xs font-bold mt-2">
              অফিশিয়াল ক্লাস রুটিন - {selectedClassObj?.name} (২০২৬)
            </Badge>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">রুটিন লোড হচ্ছে...</div>
          ) : (
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
                          r.class_id === selectedClassId && 
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
          )}
        </CardContent>
      </Card>

      {/* ─── Modal: Routine Period Box Assignment Dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              বক্স রুটিন সেটিং ({routineForm.period_number}ম পিরিয়ড)
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
                  {selectedClassSubjects.map(s => (
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
