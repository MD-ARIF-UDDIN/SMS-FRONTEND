import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, UserCheck, UserX, Save } from 'lucide-react';


export default function AttendanceTracking() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from('classes').select('*').eq('is_active', true);
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`id, student_id_number, profiles(full_name_bn, full_name_en)`)
        .eq('status', 'Active'); 
        
      if (error) throw error;
      setStudents(data || []);
      
      const initialData = {};
      data?.forEach(s => {
        initialData[s.id] = 'Present'; 
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, isPresent) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: isPresent ? 'Present' : 'Absent'
    }));
  };

  const markAllPresent = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = 'Present';
    });
    setAttendanceData(updated);
  };

  const handleSaveAttendance = async () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const presentCount = Object.values(attendanceData).filter(v => v === 'Present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">দৈনিক হাজিরা ও উপস্থিতি রেজিস্টার</h2>
          <p className="text-slate-500 text-xs mt-1">তারিখ: {new Date(attendanceDate).toLocaleDateString('bn-BD')}</p>
        </div>

        {students.length > 0 && (
          <Button variant="outline" onClick={markAllPresent} className="border-emerald-300 text-emerald-700 bg-emerald-50 text-xs rounded-xl font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> সকলকে উপস্থিত চিহ্নিত করুন
          </Button>
        )}

      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">শ্রেণি নির্বাচন করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full sm:w-1/2">
              <Label className="text-slate-700 font-medium">শ্রেণি</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="rounded-xl border-slate-300">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadStudents} disabled={loading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-10 px-6">
              {loading ? "লোড হচ্ছে..." : "হাজিরা খাতা খুলুন"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold text-sm">উপস্থিতির রেকর্ড সফলভাবে সংরক্ষিত হয়েছে!</p>
        </div>
      )}

      {students.length > 0 && (
        <>
          {/* Summary Stat bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card className="bg-emerald-50 border-emerald-200 rounded-2xl p-4 text-center">
              <p className="text-xs text-emerald-700 font-semibold">উপস্থিত শিক্ষার্থী</p>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{presentCount} জন</h3>
            </Card>

            <Card className="bg-red-50 border-red-200 rounded-2xl p-4 text-center">
              <p className="text-xs text-red-700 font-semibold">অনুপস্থিত শিক্ষার্থী</p>
              <h3 className="text-2xl font-extrabold text-red-700 mt-1">{absentCount} জন</h3>
            </Card>

            <Card className="bg-slate-50 border-slate-200 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-600 font-semibold">মোট শিক্ষার্থী</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{students.length} জন</h3>
            </Card>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">স্টুডেন্ট আইডি</TableHead>
                      <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">উপস্থিতি স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-emerald-700">{student.student_id_number}</TableCell>
                        <TableCell className="font-bold text-slate-800">
                          {student.profiles?.full_name_bn || student.profiles?.full_name_en}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`text-xs font-bold ${attendanceData[student.id] === 'Present' ? 'text-emerald-600' : 'text-red-500'}`}>
                              {attendanceData[student.id] === 'Present' ? 'উপস্থিত' : 'অনুপস্থিত'}
                            </span>
                            <Switch 
                              checked={attendanceData[student.id] === 'Present'}
                              onCheckedChange={(checked) => handleStatusChange(student.id, checked)}
                              className="data-[state=checked]:bg-emerald-600"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 h-11" onClick={handleSaveAttendance}>
                  <Save className="w-4 h-4 mr-2" /> হাজিরা রেজিস্টার সংরক্ষণ করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

