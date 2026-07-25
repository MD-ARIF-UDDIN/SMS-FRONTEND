import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Plus, Phone, UserCheck, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    full_name_bn: '',
    full_name_en: '',
    phone: '',
    designation: 'সহকারী শিক্ষক'
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('full_name_en');
      
      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async () => {
    if (!formData.full_name_en && !formData.full_name_bn) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          full_name_bn: formData.full_name_bn || formData.full_name_en,
          full_name_en: formData.full_name_en || formData.full_name_bn,
          phone_primary: formData.phone,
          role: 'teacher'
        }]);

      if (error) throw error;
      
      setIsDialogOpen(false);
      setFormData({ full_name_bn: '', full_name_en: '', phone: '', designation: 'সহকারী শিক্ষক' });
      fetchTeachers();
    } catch (error) {
      console.error('Error creating teacher:', error.message);
      alert("শিক্ষক প্রোফাইল তৈরিতে ত্রুটি হয়েছে।");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই শিক্ষক প্রোফাইল মুছে ফেলতে চান?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error.message);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    (t.full_name_bn || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.full_name_en || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">শিক্ষক ও স্টাফ তালিকা</h2>
          <p className="text-slate-500 text-xs mt-1">মাদ্রাসার সম্মানিত শিক্ষক ও কর্মকর্তা ডিরেক্টরি</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              নতুন শিক্ষক যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">নতুন শিক্ষক নিবন্ধন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">শিক্ষকের নাম (বাংলায়) *</Label>
                <Input
                  placeholder="যেমন: মাওলানা আব্দুর রহমান"
                  value={formData.full_name_bn}
                  onChange={(e) => setFormData({...formData, full_name_bn: e.target.value})}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">শিক্ষকের নাম (ইংরেজি) *</Label>
                <Input
                  placeholder="e.g. Mawlana Abdur Rahman"
                  value={formData.full_name_en}
                  onChange={(e) => setFormData({...formData, full_name_en: e.target.value})}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">মোবাইল নম্বর</Label>
                <Input
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <Button onClick={handleCreateTeacher} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                শিক্ষক তথ্য সংরক্ষণ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">শিক্ষক ডিরেক্টরি</CardTitle>
            <CardDescription className="text-xs text-slate-500">মোট শিক্ষক সংখ্যা: {teachers.length} জন</CardDescription>
          </div>
          <Input 
            placeholder="শিক্ষক খুঁজুন..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs rounded-xl text-xs bg-white"
          />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">শিক্ষকদের তালিকা লোড হচ্ছে...</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো শিক্ষক পাওয়া যায়নি।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">শিক্ষকের নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">পদবী / ভূমিকা</TableHead>
                    <TableHead className="font-bold text-slate-700">যোগাযোগ</TableHead>
                    <TableHead className="w-[100px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold">
                            <AvatarFallback>{(teacher.full_name_bn || teacher.full_name_en || 'T')[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{teacher.full_name_bn || teacher.full_name_en}</p>
                            <p className="text-xs text-slate-400 font-normal">{teacher.full_name_en}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                          শিক্ষক (Teacher)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {teacher.phone_primary || '017XXXXXXXX'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDelete(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}

