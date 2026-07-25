import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { calculateSubjectGrade } from '../../lib/gpaCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Award, Save, Building2, BookOpen, Lock, ShieldAlert } from 'lucide-react';

export default function MarkEntry() {
  const { user, role } = useAuth();
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assignedClassName, setAssignedClassName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch active classes
      const { data: cData } = await supabase
        .from('classes')
        .select(`
          id, name, level, class_teacher_id,
          profiles:class_teacher_id (id, full_name_bn, full_name_en)
        `)
        .eq('is_active', true)
        .order('name');
      setClasses(cData || []);

      if (user?.id) {
        const myClass = cData?.find(c => c.class_teacher_id === user.id);
        if (myClass) {
          setSelectedClass(myClass.id);
          setAssignedClassName(myClass.name);
        } else if (cData && cData.length > 0) {
          setSelectedClass(cData[0].id);
        }
      } else if (cData && cData.length > 0) {
        setSelectedClass(cData[0].id);
      }

      // 2. Fetch exams
      const { data: exData } = await supabase.from('exams').select('*').order('exam_name');
      const examList = exData && exData.length > 0 ? exData : [];
      setExams(examList);
      if (examList.length > 0) setSelectedExam(examList[0].id);

    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  // Fetch subjects for selected class
  useEffect(() => {
    if (selectedClass) {
      fetchSubjectsForClass();
    }
  }, [selectedClass]);

  const fetchSubjectsForClass = async () => {
    try {
      const { data: subData } = await supabase
        .from('subjects')
        .select(`
          id, class_id, subject_name, subject_code, total_marks, assigned_teacher_id,
          profiles:assigned_teacher_id (id, full_name_bn, full_name_en)
        `)
        .eq('class_id', selectedClass)
        .order('subject_name');

      const classSubs = subData || [];
      setSubjects(classSubs);

      if (classSubs.length > 0) {
        // Prefer auto-selecting a subject assigned to this teacher if available
        const mySub = classSubs.find(s => s.assigned_teacher_id === user?.id);
        if (mySub) {
          setSelectedSubject(mySub.id);
        } else {
          setSelectedSubject(classSubs[0].id);
        }
      } else {
        setSelectedSubject('');
      }
    } catch (err) {
      console.error('Error fetching class subjects:', err);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedExam && selectedSubject) {
      loadStudentsAndMarks();
    }
  }, [selectedClass, selectedExam, selectedSubject]);

  const loadStudentsAndMarks = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      // 1. Fetch active students in the selected class ONLY
      const { data: studentList, error: stError } = await supabase
        .from('students')
        .select(`
          id, 
          student_id_number,
          profiles (full_name_bn, full_name_en)
        `)
        .eq('status', 'Active')
        .eq('class_id', selectedClass);
        
      if (stError) throw stError;
      setStudents(studentList || []);

      // 2. Fetch existing marks for (exam_id, subject_id)
      const { data: existingMarks } = await supabase
        .from('marks_entry')
        .select('*')
        .eq('exam_id', selectedExam)
        .eq('subject_id', selectedSubject);

      const existingMap = {};
      if (existingMarks) {
        existingMarks.forEach(m => {
          existingMap[m.student_id] = {
            marks_obtained: m.marks_obtained !== null && m.marks_obtained !== undefined ? String(m.marks_obtained) : '75',
            is_absent: Boolean(m.is_absent)
          };
        });
      }

      const initialMarks = {};
      studentList?.forEach(s => {
        initialMarks[s.id] = existingMap[s.id] || { marks_obtained: '75', is_absent: false };
      });

      setMarksData(initialMarks);
    } catch (error) {
      console.error('Error loading students/marks:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Authorization check for selected subject & class
  const activeSubjectObj = subjects.find(s => s.id === selectedSubject);
  const activeClassObj = classes.find(c => c.id === selectedClass);
  const assignedTeacherObj = activeSubjectObj?.profiles;
  const assignedTeacherName = assignedTeacherObj ? (assignedTeacherObj.full_name_bn || assignedTeacherObj.full_name_en) : null;

  const isSubjectTeacher = activeSubjectObj?.assigned_teacher_id === user?.id;
  const isClassTeacher = activeClassObj?.class_teacher_id === user?.id;
  const isAdmin = role === 'admin';
  const noTeacherAssigned = !activeSubjectObj?.assigned_teacher_id;

  // Authorized if admin, class teacher, subject teacher, or subject has no specific teacher assigned yet
  const isAuthorized = isAdmin || isClassTeacher || isSubjectTeacher || noTeacherAssigned;

  const handleMarkChange = (studentId, value) => {
    if (!isAuthorized) return;
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks_obtained: value }
    }));
  };

  const handleAbsentChange = (studentId, checked) => {
    if (!isAuthorized) return;
    setMarksData(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId], 
        is_absent: checked, 
        marks_obtained: checked ? '0' : prev[studentId]?.marks_obtained || '0' 
      }
    }));
  };

  const handleSaveMarks = async () => {
    if (!isAuthorized) {
      alert('নম্বর ইনপুটের অনুমতি নেই। শুধুমাত্র নির্ধারিত বিষয় শিক্ষক বা শ্রেণি শিক্ষক নম্বর এন্ট্রি দিতে পারবেন।');
      return;
    }
    if (!selectedExam || !selectedSubject || students.length === 0) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const recordsToUpsert = students.map(s => {
        const mInfo = marksData[s.id] || { marks_obtained: 0, is_absent: false };
        return {
          exam_id: selectedExam,
          subject_id: selectedSubject,
          student_id: s.id,
          marks_obtained: mInfo.is_absent ? 0 : Number(mInfo.marks_obtained || 0),
          is_absent: mInfo.is_absent,
          entered_by: user?.id || null
        };
      });

      const { error } = await supabase
        .from('marks_entry')
        .upsert(recordsToUpsert, { onConflict: 'exam_id,subject_id,student_id' });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving marks:', err.message);
      alert('নম্বর সংরক্ষণে ত্রুটি হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderGradeBadge = (marks, isAbsent) => {
    const { grade, point } = calculateSubjectGrade(marks, isAbsent);
    if (grade === 'F') return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs font-bold">F (GP {point.toFixed(2)})</Badge>;
    if (grade === 'A+') return <Badge className="bg-emerald-600 text-white text-xs font-bold">A+ (GP 5.00)</Badge>;
    if (grade === 'A') return <Badge className="bg-emerald-500 text-white text-xs font-bold">A (GP 4.00)</Badge>;
    if (grade === 'A-') return <Badge className="bg-teal-500 text-white text-xs font-bold">A- (GP 3.50)</Badge>;
    if (grade === 'B') return <Badge className="bg-blue-500 text-white text-xs font-bold">B (GP 3.00)</Badge>;
    return <Badge className="bg-slate-600 text-white text-xs font-bold">{grade} (GP {point.toFixed(2)})</Badge>;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">বিষয়ভিত্তিক নম্বর ইনপুট ও নিরাপত্তা প্যানেল</h2>
            {assignedClassName && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                আপনার শ্রেণি: {assignedClassName}
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-1">শুধুমাত্র অনুমোদিত বিষয় শিক্ষক ও শ্রেণি শিক্ষক নিজ বিষয়ে নম্বর এন্ট্রি দিতে পারবেন</p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">১. শ্রেণি নির্বাচন করুন</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="rounded-xl border-slate-300 bg-white">
                  <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.class_teacher_id === user?.id ? ' (আপনার শ্রেণি)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">২. পরীক্ষা নির্বাচন করুন</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
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

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">৩. বিষয় (Subject)</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="rounded-xl border-slate-300 bg-white">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => {
                    const isMySub = s.assigned_teacher_id === user?.id;
                    const tName = s.profiles ? (s.profiles.full_name_bn || s.profiles.full_name_en) : null;
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        {s.subject_name} {isMySub ? ' (আপনার বিষয় ✨)' : tName ? ` [শিক্ষক: ${tName}]` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Authorization Notice Banner */}
          {activeSubjectObj && !isAuthorized && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                অনুমতি সীমাবদ্ধ: এই বিষয়টির অনুমোদিত বিষয় শিক্ষক হলেন <strong>"{assignedTeacherName || 'অন্য শিক্ষক'}"</strong>। শুধুমাত্র নির্ধারিত বিষয় শিক্ষক বা শ্রেণি শিক্ষক এন্ট্রি দিতে পারবেন।
              </span>
            </div>
          )}

          {activeSubjectObj && isAuthorized && isSubjectTeacher && (
            <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>আপনি এই বিষয়ের অনুমোদিত বিষয় শিক্ষক। আপনি নম্বর প্রদান ও সংরক্ষণ করতে পারবেন।</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400">শ্রেণির শিক্ষার্থী ও পূর্বের নম্বর লোড হচ্ছে...</div>
          ) : !selectedSubject ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">কোনো বিষয় পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400">এই শ্রেণির বিষয় ও বিষয় শিক্ষক নির্ধারণ করতে অ্যাডমিন প্যানেলে যোগাযোগ করুন।</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">এই শ্রেণিতে কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400">অন্য শ্রেণি নির্বাচন করুন বা নতুন শিক্ষার্থী ভর্তি করুন।</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">আইডি নম্বর</TableHead>
                      <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                      <TableHead className="font-bold text-slate-700 w-[160px]">প্রাপ্ত নম্বর (১০০)</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center">অনুপস্থিত?</TableHead>
                      <TableHead className="font-bold text-slate-700 text-right">বিষয়ভিত্তিক গ্রেড ও পয়েন্ট</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const info = marksData[student.id] || { marks_obtained: '75', is_absent: false };
                      const profile = student.profiles;

                      return (
                        <TableRow key={student.id} className="hover:bg-slate-50/80">
                          <TableCell className="font-mono text-xs text-emerald-700 font-bold">
                            {student.student_id_number}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">
                            {profile?.full_name_bn || profile?.full_name_en || 'শিক্ষার্থী'}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!isAuthorized || info.is_absent}
                              value={info.marks_obtained}
                              onChange={(e) => handleMarkChange(student.id, e.target.value)}
                              className="h-9 w-24 rounded-lg border-slate-300 font-bold text-center bg-white disabled:opacity-50"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              disabled={!isAuthorized}
                              checked={info.is_absent}
                              onCheckedChange={(checked) => handleAbsentChange(student.id, checked)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {renderGradeBadge(info.marks_obtained, info.is_absent)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                {saveSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                    পরীক্ষার নম্বর সফলভাবে সংরক্ষণ করা হয়েছে!
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">
                    মোট {students.length} জন শিক্ষার্থীর বিষয়ভিত্তিক নম্বর এন্ট্রি
                  </span>
                )}

                <Button 
                  onClick={handleSaveMarks} 
                  disabled={saving || !isAuthorized}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 px-8 shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'সংরক্ষণ হচ্ছে...' : isAuthorized ? 'নম্বর সংরক্ষণ করুন' : 'নিরাপত্তা লক (অনুমতি নেই)'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
