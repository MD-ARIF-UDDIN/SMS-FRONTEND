import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle2, UserCheck, UserX, Save, Calendar, Building2, Palmtree, AlertCircle } from 'lucide-react';

export default function AttendanceTracking() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignedClassName, setAssignedClassName] = useState('');
  
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Attendance status map: { [student_id]: 'Present' | 'Absent' | 'Holiday' }
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    try {
      const { data: allClassData, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClasses(allClassData || []);

      if (user?.id) {
        const myClass = allClassData?.find(c => c.class_teacher_id === user.id);
        if (myClass) {
          setSelectedClass(myClass.id);
          setAssignedClassName(myClass.name);
        } else if (allClassData && allClassData.length > 0) {
          setSelectedClass(allClassData[0].id);
        }
      } else if (allClassData && allClassData.length > 0) {
        setSelectedClass(allClassData[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error.message);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass, attendanceDate]);

  const loadStudents = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const { data: studentList, error } = await supabase
        .from('students')
        .select(`
          id, 
          student_id_number, 
          class_id,
          profiles (full_name_bn, full_name_en, phone_primary)
        `)
        .eq('status', 'Active')
        .eq('class_id', selectedClass)
        .order('student_id_number');

      if (error) throw error;
      setStudents(studentList || []);

      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', attendanceDate);

      const attendanceMap = {};
      const existingMap = {};
      if (existingAttendance) {
        existingAttendance.forEach(a => {
          existingMap[a.student_id] = a.status;
        });
      }

      studentList?.forEach(s => {
        attendanceMap[s.id] = existingMap[s.id] || 'Present';
      });

      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error('Error loading students for class:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: newStatus
    }));
  };

  const markAllPresent = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = 'Present';
    });
    setAttendanceData(updated);
  };

  const markAllHoliday = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = 'Holiday';
    });
    setAttendanceData(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || students.length === 0) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const recordsToUpsert = students.map(s => ({
        student_id: s.id,
        class_id: selectedClass,
        date: attendanceDate,
        status: attendanceData[s.id] || 'Present',
        recorded_by: user?.id || null
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(recordsToUpsert, { onConflict: 'student_id,date' });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving attendance:', err.message);
      alert('উপস্থিতি সংরক্ষণে ত্রুটি হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceData).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendanceData).filter(v => v === 'Absent').length;
  const holidayCount = Object.values(attendanceData).filter(v => v === 'Holiday').length;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">দৈনিক হাজিরা ও উপস্থিতি রেজিস্টার</h2>
            {assignedClassName && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                আপনার শ্রেণি: {assignedClassName}
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            আপনার দায়িত্বে থাকা শ্রেণির শিক্ষার্থীদের দৈনিক উপস্থিতি ও সরকারি/মাদ্রাসা ছুটি নির্ধারণ করুন
          </p>
        </div>

        {students.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={markAllPresent} className="border-emerald-300 text-emerald-700 bg-emerald-50 text-xs rounded-xl font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> সকলকে উপস্থিত চিহ্নিত করুন
            </Button>
            <Button variant="outline" onClick={markAllHoliday} className="border-indigo-300 text-indigo-700 bg-indigo-50 text-xs rounded-xl font-bold">
              <Palmtree className="w-3.5 h-3.5 mr-1 text-indigo-600" /> পুরো দিনটি ছুটি ঘোষণা করুন (Holiday)
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">শ্রেণি নির্বাচন করুন</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="rounded-xl border-slate-300 bg-white">
              <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.level} - {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">তারিখ নির্বাচন করুন</Label>
          <Input 
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="rounded-xl border-slate-300 bg-white text-xs font-mono"
          />
        </div>

        <div className="flex items-end">
          <Button 
            onClick={handleSaveAttendance} 
            disabled={saving || students.length === 0} 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-10 shadow-md"
          >
            {saving ? "সংরক্ষণ হচ্ছে..." : "উপস্থিতি খাতা সেভ করুন"}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          উপস্থিতি রেজিস্টার সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">মোট শিক্ষার্থী</span>
          <span className="text-xl font-extrabold text-slate-800">{students.length} জন</span>
        </div>

        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">উপস্থিত</span>
          <span className="text-xl font-extrabold text-emerald-800">{presentCount} জন</span>
        </div>

        <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-center">
          <span className="text-[10px] text-red-700 font-bold uppercase block">অনুপস্থিত (Absent)</span>
          <span className="text-xl font-extrabold text-red-800">{absentCount} জন</span>
        </div>

        <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-200 text-center">
          <span className="text-[10px] text-indigo-700 font-bold uppercase block">ছুটি (Holiday)</span>
          <span className="text-xl font-extrabold text-indigo-800">{holidayCount} দিন</span>
        </div>
      </div>

      {/* Attendance Students Table */}
      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5">
          <CardTitle className="text-base font-bold text-slate-900">শিক্ষার্থী উপস্থিতি খাতা</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            ছুটি (Holiday) দিলে এটি শিক্ষার্থীর অনুপস্থিতি (Absent) হিসেবে গণনা হবে না এবং হাজিরা শতকরা (%) কমবে না।
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">শিক্ষার্থী তালিকা লোড হচ্ছে...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-400">এই শ্রেণিতে কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700 w-12 text-center">#SL</TableHead>
                    <TableHead className="font-bold text-slate-700">স্টুডেন্ট আইডি</TableHead>
                    <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">অভিভাবক ফোন</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">উপস্থিতি স্ট্যাটাস (Present / Absent / Holiday)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => {
                    const currentStatus = attendanceData[student.id] || 'Present';

                    return (
                      <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-mono text-center text-xs font-bold text-slate-400">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-emerald-700 text-xs">
                          {student.student_id_number}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800 text-xs">
                          {student.profiles?.full_name_bn || student.profiles?.full_name_en}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-600">
                          {student.profiles?.phone_primary || '017XXXXXXXX'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Present')}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <UserCheck className="w-3 h-3 inline mr-1" /> উপস্থিত
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Absent')}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                currentStatus === 'Absent'
                                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <UserX className="w-3 h-3 inline mr-1" /> অনুপস্থিত (Absent)
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'Holiday')}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                currentStatus === 'Holiday'
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <Palmtree className="w-3 h-3 inline mr-1" /> ছুটি (Holiday)
                            </button>
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
    </div>
  );
}
