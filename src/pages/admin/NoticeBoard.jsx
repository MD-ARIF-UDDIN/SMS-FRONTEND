import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Plus, Bell, Megaphone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content_html: '',
    target_roles: ['শিক্ষার্থী', 'শিক্ষক', 'অভিভাবক'],
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('Error fetching notices:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async () => {
    if (!formData.title) return;
    
    try {
      const { error } = await supabase
        .from('notices')
        .insert([formData]);

      if (error) throw error;
      
      setIsDialogOpen(false);
      setFormData({ title: '', content_html: '', target_roles: ['শিক্ষার্থী', 'শিক্ষক', 'অভিভাবক'] });
      fetchNotices();
    } catch (error) {
      console.error('Error creating notice:', error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      fetchNotices();
    } catch (error) {
      console.error('Error deleting notice:', error.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">নোটিশ বোর্ড ও পাবলিক ঘোষণা</h2>
          <p className="text-slate-500 text-xs mt-1">মাদ্রাসার ছুটি, পরীক্ষা ও জরুরি তথ্যের অফিশিয়াল নোটিশ</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              নতুন নোটিশ প্রকাশ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl rounded-2xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">নোটিশ প্রকাশ ফরম</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">নোটিশের শিরোনাম *</Label>
                <Input
                  placeholder="যেমন: পবিত্র ঈদুল ফিতর উপলক্ষে মাদ্রাসা ছুটির নোটিশ"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">নোটিশের বিস্তারিত বিবরণ</Label>
                <Textarea
                  placeholder="সকল শিক্ষক ও শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে..."
                  rows={5}
                  value={formData.content_html}
                  onChange={(e) => setFormData({...formData, content_html: e.target.value})}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <Button onClick={handleCreateNotice} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                নোটিশ লাইভ প্রকাশ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">প্রকাশিত নোটিশসমূহ</CardTitle>
            <CardDescription className="text-xs text-slate-500">মোট প্রকাশিত নোটিশ: {notices.length} টি</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">নোটিশসমূহ লোড হচ্ছে...</div>
          ) : notices.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো নোটিশ পাওয়া যায়নি।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">প্রকাশের তারিখ</TableHead>
                    <TableHead className="font-bold text-slate-700">নোটিশের শিরোনাম</TableHead>
                    <TableHead className="font-bold text-slate-700">লক্ষ্যভোক্তা</TableHead>
                    <TableHead className="w-[100px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notices.map((n) => (
                    <TableRow key={n.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">{n.title}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {Array.isArray(n.target_roles) ? n.target_roles.map((r, i) => (
                            <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              {r}
                            </Badge>
                          )) : (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              সকলের জন্য
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleDelete(n.id)}
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

