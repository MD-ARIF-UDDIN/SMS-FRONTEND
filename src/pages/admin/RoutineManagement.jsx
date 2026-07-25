import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Plus, Calendar, Clock, Printer, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


export default function RoutineManagement() {
  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    day_of_week: 'রবিবার',
    start_time: '০৮:০০',
    end_time: '০৯:০০',
  });

  useEffect(() => {
    fetchInitialData();
    fetchRoutines();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data: cData } = await supabase.from('classes').select('*');
      setClasses(cData || []);
      
      const { data: sData } = await supabase.from('subjects').select('*');
      setSubjects(sData || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routines')
        .select(`*, classes(name, level), subjects(subject_name)`)
        .order('day_of_week');
      
      if (error) throw error;
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching routines:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutines = routines.filter(r => {
    const className = r.classes?.name || '';
    return selectedClassFilter === 'all' || className === selectedClassFilter;
  });

  const handleCreateRoutine = async () => {
    if (!formData.class_id) return;
    
    try {
      const { error } = await supabase.from('routines').insert([formData]);
      if (error) throw error;
      
      setIsDialogOpen(false);
      fetchRoutines();
    } catch (error) {
      console.error('Error creating routine:', error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই রুটিন পিরিয়ডটি মুছে ফেলতে চান?')) return;
    try {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) throw error;
      fetchRoutines();
    } catch (error) {
      console.error('Error deleting routine:', error.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">ক্লাস রুটিন ও সময়সূচি</h2>
          <p className="text-slate-500 text-xs mt-0.5">মাদ্রাসার প্রতিদিনের শ্রেণিভিত্তিক পাঠদান ও পিরিয়ড রুটিন</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Class Filter */}
          <div className="w-44">
            <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
              <SelectTrigger className="rounded-xl border-slate-300 text-xs h-10">
                <SelectValue placeholder="সকল শ্রেণি রুটিন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল শ্রেণি (All)</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={handlePrint} className="border-slate-300 text-xs rounded-xl h-10">
            <Printer className="w-4 h-4 mr-1.5" /> প্রিন্ট করুন
          </Button>

          <Button variant="outline" onClick={handlePrint} className="border-slate-300 rounded-xl">
            <Printer className="w-4 h-4 mr-2" /> প্রিন্ট রুটিন
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                নতুন পিরিয়ড যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">ক্লাস রুটিন এন্ট্রি</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">শ্রেণি</Label>
                  <Select value={formData.class_id} onValueChange={(val) => setFormData({...formData, class_id: val})}>
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

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">দিনের নাম</Label>
                  <Select value={formData.day_of_week} onValueChange={(val) => setFormData({...formData, day_of_week: val})}>
                    <SelectTrigger className="rounded-xl border-slate-300">
                      <SelectValue placeholder="দিন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার'].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">শুরুর সময়</Label>
                    <Input 
                      placeholder="০৮:০০ AM"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      className="rounded-xl border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">শেষের সময়</Label>
                    <Input 
                      placeholder="০৯:০০ AM"
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      className="rounded-xl border-slate-300"
                    />
                  </div>
                </div>

                <Button onClick={handleCreateRoutine} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                  রুটিন পিরিয়ড সংরক্ষণ করুন
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">শ্রেণি রুটিন তালিকা</CardTitle>
            <CardDescription className="text-xs text-slate-500">মোট সেটকৃত পিরিয়ড: {routines.length} টি</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">রুটিন লোড হচ্ছে...</div>
          ) : filteredRoutines.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো রুটিন পিরিয়ড পাওয়া যায়নি। নতুন পিরিয়ড যোগ করুন।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">বার (Day)</TableHead>
                    <TableHead className="font-bold text-slate-700">শ্রেণি</TableHead>
                    <TableHead className="font-bold text-slate-700">বিষয়</TableHead>
                    <TableHead className="font-bold text-slate-700">সময়সূচি</TableHead>
                    <TableHead className="w-[100px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutines.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-800">
                        <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-700 font-semibold text-xs">
                          {r.day_of_week}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-700">{r.classes?.name || 'সাধারণ'}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{r.subjects?.subject_name || 'আল-কুরআন / আরবি'}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {r.start_time} - {r.end_time}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleDelete(r.id)}
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

