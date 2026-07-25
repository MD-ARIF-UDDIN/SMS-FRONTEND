import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Edit2, Plus, BookOpen, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [className, setClassName] = useState('');
  const [classLevel, setClassLevel] = useState('দাখিল');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!className) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .insert([{ name: className, level: classLevel, is_active: true }]);

      if (error) throw error;
      
      setIsDialogOpen(false);
      setClassName('');
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই শ্রেণিটি মুছে ফেলতে চান?')) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error.message);
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 w-full font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">শ্রেণি ও বিভাগ ব্যবস্থাপনা</h2>
          <p className="text-slate-500 text-xs mt-1">মাদ্রাসার ইবতেদায়ী, দাখিল, আলিম ও ফাজিল শ্রেণি তালিকা</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              নতুন শ্রেণি যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">নতুন শ্রেণি নিবন্ধন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">শ্রেণির নাম</Label>
                <Input
                  placeholder="যেমন: ফাজিল ১ম বর্ষ / দাখিল ১০ম"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">স্তর (Level)</Label>
                <Select value={classLevel} onValueChange={setClassLevel}>
                  <SelectTrigger className="rounded-xl border-slate-300">
                    <SelectValue placeholder="স্তর নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {['ইবতেদায়ী', 'দাখিল', 'আলিম', 'ফাজিল', 'কামিল'].map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateClass} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                শ্রেণি সংরক্ষণ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">শ্রেণিসমূহের তালিকা</CardTitle>
            <CardDescription className="text-xs text-slate-500">মোট সক্রিয় শ্রেণি: {classes.length} টি</CardDescription>
          </div>
          <Input 
            placeholder="শ্রেণি খুঁজুন..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs rounded-xl text-xs bg-white"
          />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">শ্রেণি লোড হচ্ছে...</div>
          ) : filteredClasses.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো শ্রেণি পাওয়া যায়নি। নতুন শ্রেণি যোগ করুন।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">শ্রেণির নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">স্তর</TableHead>
                    <TableHead className="font-bold text-slate-700">স্ট্যাটাস</TableHead>
                    <TableHead className="w-[120px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => (
                    <TableRow key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-800">{cls.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold text-xs">
                          {cls.level}
                        </Badge>
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg"
                            onClick={() => handleDelete(cls.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
