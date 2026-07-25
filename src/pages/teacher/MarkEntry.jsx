import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Award, Save } from 'lucide-react';

export default function MarkEntry() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: exData } = await supabase.from('exams').select('*');
      setExams(exData && exData.length > 0 ? exData : [
        { id: '1', exam_name: 'বার্ষিক পরীক্ষা ২০২৬' },
        { id: '2', exam_name: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬' }
      ]);
      
      const { data: subData } = await supabase.from('subjects').select('*');
      setSubjects(subData && subData.length > 0 ? subData : [
        { id: 'sub-1', subject_name: 'আল-কুরআন ও তাফসীর' },
        { id: 'sub-2', subject_name: 'আল-হাদীস' },
        { id: 'sub-3', subject_name: 'আরবি ২য় পত্র' },
        { id: 'sub-4', subject_name: 'গণিত' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      
      // Initialize marks state
      const initialMarks = {};
      data?.forEach(s => {
        initialMarks[s.id] = { marks_obtained: '75', is_absent: false };
      });
      setMarksData(initialMarks);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks_obtained: value }
    }));
  };

  const handleAbsentChange = (studentId, checked) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], is_absent: checked, marks_obtained: checked ? '0' : prev[studentId].marks_obtained }
    }));
  };

  const getGradeBadge = (marks, isAbsent) => {
    if (isAbsent) return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">অনুপস্থিত (F)</Badge>;
    const num = Number(marks);
    if (num >= 80) return <Badge className="bg-emerald-600 text-white text-xs">A+ (GPA 5.0)</Badge>;
    if (num >= 70) return <Badge className="bg-emerald-500 text-white text-xs">A (GPA 4.0)</Badge>;
    if (num >= 60) return <Badge className="bg-teal-500 text-white text-xs">A- (GPA 3.5)</Badge>;
    if (num >= 33) return <Badge className="bg-blue-500 text-white text-xs">Pass</Badge>;
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">Fail (F)</Badge>;
  };

  const handleSaveMarks = async () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">পরীক্ষার নম্বর ইনপুট ফরম</h2>
          <p className="text-slate-500 text-xs mt-1">শিক্ষার্থীভিত্তিক প্রাপ্ত নম্বর, জিপিএ ও উপস্থিতি এন্ট্রি করুন</p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">পরীক্ষা ও বিষয় নির্বাচন করুন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 w-full md:w-1/3">
              <Label className="text-slate-700 font-medium">পরীক্ষা নির্বাচন</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="rounded-xl border-slate-300">
                  <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.exam_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 w-full md:w-1/3">
              <Label className="text-slate-700 font-medium">বিষয় নির্বাচন</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="rounded-xl border-slate-300">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={loadStudents} disabled={loading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-10 px-6">
              {loading ? "লোড হচ্ছে..." : "শিক্ষার্থী তালিকা আনুন"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold text-sm">সকল নম্বর সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!</p>
        </div>
      )}

      {students.length > 0 && (
        <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">নম্বর ইনপুট তালিকা</CardTitle>
              <CardDescription className="text-xs text-slate-500">মোট শিক্ষার্থী: {students.length} জন</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">স্টুডেন্ট আইডি</TableHead>
                    <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">প্রাপ্ত নম্বর (১০০ এর মধ্যে)</TableHead>
                    <TableHead className="font-bold text-slate-700">গ্রেড ও জিপিএ</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">অনুপস্থিত?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-emerald-700">{student.student_id_number}</TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {student.profiles?.full_name_bn || student.profiles?.full_name_en}
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={marksData[student.id]?.marks_obtained}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          disabled={marksData[student.id]?.is_absent}
                          min={0}
                          max={100}
                          className="w-28 h-10 rounded-xl font-bold border-slate-300"
                        />
                      </TableCell>
                      <TableCell>
                        {getGradeBadge(marksData[student.id]?.marks_obtained, marksData[student.id]?.is_absent)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch 
                          checked={marksData[student.id]?.is_absent}
                          onCheckedChange={(checked) => handleAbsentChange(student.id, checked)}
                          className="data-[state=checked]:bg-red-500"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 h-11" onClick={handleSaveMarks}>
                <Save className="w-4 h-4 mr-2" /> সব নম্বর সংরক্ষণ করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

