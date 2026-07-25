import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Plus, Wallet, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function ExpenseTracking() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    category: 'মনিহারি (Stationery)',
    amount: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!formData.description || Number(formData.amount) <= 0) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          description: formData.description,
          category: formData.category,
          amount: Number(formData.amount)
        }]);

      if (error) throw error;
      
      setIsDialogOpen(false);
      setFormData({ description: '', category: 'মনিহারি (Stationery)', amount: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Error recording expense:', error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ব্যয়ের রেকর্ডটি মুছে ফেলতে চান?')) return;
    
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error.message);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const avgExpense = expenses.length > 0 ? totalExpenseAmount / expenses.length : 0;

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">হিসাব ও ব্যয় ব্যবস্থাপনা</h2>
          <p className="text-slate-500 text-xs mt-0.5">মাদ্রাসার প্রশাসনিক খরচ, কেনাকাটা ও ভাউচার ট্র্যাকিং</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl h-10 px-5">
              <Plus className="w-4 h-4 mr-1.5" />
              নতুন ব্যয় যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">ব্যয়ের ভাউচার এন্ট্রি</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">বিবরণ / খাতের বিষয়</Label>
                <Input
                  placeholder="যেমন: ৫০টি খাতা ও মার্কার ক্রয়"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="rounded-xl border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">ব্যয়ের ক্যাটাগরি</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger className="rounded-xl border-slate-300">
                    <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {['মনিহারি (Stationery)', 'মেরামত ও রক্ষণাবেক্ষণ', 'বিদ্যুৎ ও বিল', 'অনুষ্ঠান ও প্রোগ্রাম', 'অন্যান্য (Misc)'].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">টাকার পরিমাণ</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="rounded-xl border-slate-300 font-bold"
                />
              </div>
              <Button onClick={handleCreateExpense} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl h-11">
                ব্যয় ভাউচার সংরক্ষণ করুন
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 3 Compact Side-by-Side Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">সর্বমোট রেকর্ডকৃত ব্যয়</p>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{totalExpenseAmount.toLocaleString('bn-BD')}</h3>
          </div>
          <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300">
            <TrendingDown className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট এন্ট্রি সংখ্যা</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{expenses.length} টি</h3>
          </div>
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600">
            <Wallet className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">গড় ভাউচার খরচ</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{Math.round(avgExpense).toLocaleString('bn-BD')}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">ব্যয়ের ভাউচারসমূহ</CardTitle>
            <CardDescription className="text-[11px] text-slate-500">সাম্প্রতিক খরচের তালিকা</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">ব্যয়ের হিসাব লোড হচ্ছে...</div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">তারিখ</TableHead>
                    <TableHead className="font-bold text-slate-700">ব্যয়ের বিবরণ</TableHead>
                    <TableHead className="font-bold text-slate-700">ক্যাটাগরি</TableHead>
                    <TableHead className="font-bold text-slate-700">টাকার পরিমাণ</TableHead>
                    <TableHead className="w-[100px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-600">
                        {new Date(exp.expense_date).toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">{exp.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold text-xs">
                          {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-extrabold text-rose-600">
                        {Number(exp.amount).toLocaleString('bn-BD')}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleDelete(exp.id)}
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

