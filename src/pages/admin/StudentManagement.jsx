import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Printer, Eye, UserCheck, GraduationCap, Building2, UserPlus, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  // Admission Form State
  const [formData, setFormData] = useState({
    fullNameEn: '',
    fullNameBn: '',
    studentIdNumber: '',
    classId: '',
    gender: 'Male',
    phonePrimary: '',
    addressPresent: ''
  });

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
      const { data: cData } = await supabase.from('classes').select('*');
      if (cData) setClassesList(cData);

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id_number,
          status,
          profiles (full_name_bn, full_name_en, phone_primary, address_present, gender),
          classes (name, level)
        `)
        .order('student_id_number');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // 1. Insert into profiles
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

      // 2. Insert into students using profile ID
      const { error: studentError } = await supabase
        .from('students')
        .insert([{
          id: profileData.id,
          student_id_number: formData.studentIdNumber,
          class_id: formData.classId || (classesList[0]?.id || null),
          status: 'Active'
        }]);

      if (studentError) throw studentError;
      
      setIsAdmissionOpen(false);
      setFormData({
        fullNameEn: '', fullNameBn: '', studentIdNumber: '', classId: '', gender: 'Male', phonePrimary: '', addressPresent: ''
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

  const openStudentCard = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
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

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">শিক্ষার্থী রেজিস্টার ও পরিচিতি</h2>
          <p className="text-slate-500 text-xs mt-0.5">মাদ্রাসায় ভর্তিকৃত মোট সক্রিয় ও প্রাক্তন শিক্ষার্থীর তালিকা</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Class Filter */}
          <div className="w-40">
            <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
              <SelectTrigger className="rounded-xl border-slate-300 text-xs h-10">
                <SelectValue placeholder="সকল শ্রেণি" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল শ্রেণি (All)</SelectItem>
                {classesList.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
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
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10 px-4">
                <Plus className="w-4 h-4 mr-1.5" /> নতুন শিক্ষার্থী ভর্তি
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white border-slate-200 rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" /> নতুন শিক্ষার্থী ভর্তি ফরম
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

                <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                  {submitting ? "ভর্তি প্রসেস হচ্ছে..." : "শিক্ষার্থী ভর্তি সুসম্পন্ন করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">ভর্তিকৃত শিক্ষার্থী তালিকা</CardTitle>
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
                    <TableHead className="font-bold text-slate-700">স্টুডেন্ট আইডি</TableHead>
                    <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">শ্রেণি</TableHead>
                    <TableHead className="font-bold text-slate-700">অভিভাবকের মোবাইল</TableHead>
                    <TableHead className="font-bold text-slate-700">স্ট্যাটাস</TableHead>
                    <TableHead className="w-[100px] text-right font-bold text-slate-700">আইডি কার্ড</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono font-bold text-emerald-700 text-xs">
                        {student.student_id_number}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        <div>
                          <p>{student.profiles?.full_name_bn || student.profiles?.full_name_en}</p>
                          <p className="text-xs text-slate-400 font-normal">{student.profiles?.full_name_en}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold text-xs">
                          {student.classes?.name || 'অনির্ধারিত'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-600">
                        {student.profiles?.phone_primary || '017XXXXXXXX'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                          {student.status === 'Active' ? 'সক্রিয়' : student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openStudentCard(student)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4 mr-1" /> দেখুন
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student ID Card Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" /> ডিজিটাল শিক্ষার্থী পরিচয়পত্র
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-2">
              {/* ID Card Display Frame */}
              <div className="border-2 border-emerald-500 rounded-2xl p-6 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden text-center">
                <div className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1">আল-জামিয়া ইসলামিয়া মাদ্রাসা</div>
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
                    <span className="text-slate-400">বর্তমান ঠিকানা:</span>
                    <span className="font-semibold text-white truncate max-w-[180px]">{selectedStudent.profiles?.address_present || 'ঢাকা'}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handlePrint} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                <Printer className="w-4 h-4 mr-2" /> প্রিন্ট করুন / ডাউনলোড
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

