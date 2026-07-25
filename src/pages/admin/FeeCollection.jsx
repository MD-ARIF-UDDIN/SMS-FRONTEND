import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, CheckCircle2, Clock, Printer, Receipt, DollarSign, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FeeCollection() {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    student_id: '',
    title: 'টিউশন ফি - চলতি মাস',
    total_amount: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`id, student_id_number, profiles(full_name_bn, full_name_en)`);
      if (error) throw error;
      setStudents(data?.map(s => ({ 
        value: s.id, 
        label: `${s.student_id_number} - ${s.profiles?.full_name_bn || s.profiles?.full_name_en}` 
      })) || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`*, students (student_id_number, profiles (full_name_bn, full_name_en, phone_primary))`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const stId = inv.students?.student_id_number || '';
    const nameBn = inv.students?.profiles?.full_name_bn || '';
    const nameEn = inv.students?.profiles?.full_name_en || '';
    const title = inv.title || '';

    const matchesSearch = stId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleGenerateInvoice = async () => {
    if (!formData.student_id || !formData.title || !formData.total_amount) return;
    setGenerating(true);
    try {
      const { error } = await supabase.from('invoices').insert([{
        student_id: formData.student_id,
        title: formData.title,
        total_amount: Number(formData.total_amount),
        status: 'Unpaid',
        due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
      }]);
      if (error) throw error;
      setIsDialogOpen(false);
      setFormData({ student_id: '', title: 'টিউশন ফি - চলতি মাস', total_amount: '' });
      fetchInvoices();
    } catch (e) {
      console.error(e);
      alert('ইনভয়েস তৈরিতে সমস্যা হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  const handleCollectPayment = async (inv) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'Paid' })
        .eq('id', inv.id);

      if (error) throw error;

      await supabase.from('payments').insert([{
        invoice_id: inv.id,
        amount_paid: inv.total_amount,
        payment_date: new Date().toISOString().split('T')[0]
      }]);

      setReceiptInvoice({ ...inv, status: 'Paid' });
      setIsReceiptOpen(true);
      fetchInvoices();
    } catch (e) {
      console.error(e);
      alert('ফি আদায় আপডেট ব্যর্থ হয়েছে');
    }
  };

  const totalCollectedAmount = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">ফি আদায় ও রসিদ ব্যবস্থাপনা</h2>
          <p className="text-slate-500 text-xs mt-0.5">শিক্ষার্থীদের টিউশন ও অন্যান্য ফি আদায়, ইনভয়েস ও মানি রসিদ জেনারেট</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="w-36">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl border-slate-300 text-xs h-10">
                <SelectValue placeholder="সকল স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
                <SelectItem value="Paid">পরিশোধিত (Paid)</SelectItem>
                <SelectItem value="Unpaid">বকেয়া (Unpaid)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="flex-1 sm:w-56">
            <Input 
              placeholder="আইডি বা নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border-slate-300 text-xs h-10"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl h-10 px-4">
                <Plus className="w-4 h-4 mr-1.5" />
                নতুন ইনভয়েস
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">ইনভয়েস জেনারেটর</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">শিক্ষার্থী নির্বাচন করুন</Label>
                  <Select value={formData.student_id} onValueChange={(val) => setFormData({...formData, student_id: val})}>
                    <SelectTrigger className="rounded-xl border-slate-300">
                      <SelectValue placeholder="শিক্ষার্থী আইডিমুক্ত নাম..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.value} value={student.value}>
                          {student.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">ফি-এর বিবরণ / বিবরণী</Label>
                  <Input
                    placeholder="যেমন: মাসিক টিউশন ফি - মার্চ"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="rounded-xl border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">টাকার পরিমাণ</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                    className="rounded-xl border-slate-300 font-bold"
                  />
                </div>
                <Button onClick={handleGenerateInvoice} disabled={generating} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                  {generating ? "তৈরি হচ্ছে..." : "ইনভয়েস নিশ্চিত করুন"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      {/* Summary Card */}
      <Card className="border-slate-200 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">মোট সংগৃহীত ফি (পরিশোধিত)</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{totalCollectedAmount.toLocaleString('bn-BD')}</h3>
          </div>
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300">
            <Receipt className="w-8 h-8" />
          </div>
        </div>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">ইনভয়েস ও ফি আদায় তালিকা</CardTitle>
            <CardDescription className="text-xs text-slate-500">মোট ইনভয়েস: {invoices.length} টি</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-400">ইনভয়েস তালিকা লোড হচ্ছে...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400">কোনো ইনভয়েস পাওয়া যায়নি।</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">স্টুডেন্ট আইডি</TableHead>
                    <TableHead className="font-bold text-slate-700">শিক্ষার্থীর নাম</TableHead>
                    <TableHead className="font-bold text-slate-700">ফি-এর বিবরণ</TableHead>
                    <TableHead className="font-bold text-slate-700">পরিমাণ</TableHead>
                    <TableHead className="font-bold text-slate-700">স্ট্যাটাস</TableHead>
                    <TableHead className="w-[140px] text-right font-bold text-slate-700">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => (

                    <TableRow key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono font-bold text-emerald-700 text-xs">
                        {inv.students?.student_id_number}
                      </TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {inv.students?.profiles?.full_name_bn || inv.students?.profiles?.full_name_en}
                      </TableCell>
                      <TableCell className="text-slate-700">{inv.title}</TableCell>
                      <TableCell className="font-extrabold text-slate-900">
                        {Number(inv.total_amount).toLocaleString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        {inv.status === 'Paid' ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> পরিশোধিত
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-600" /> বকেয়া
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status === 'Paid' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setReceiptInvoice(inv); setIsReceiptOpen(true); }}
                            className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" /> রসিদ
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleCollectPayment(inv)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg px-3"
                          >
                            জমা নিন
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Money Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" /> মানি রসিদ (মেমো)
            </DialogTitle>
          </DialogHeader>

          {receiptInvoice && (
            <div className="space-y-4 py-2 text-slate-800 text-xs">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="text-center border-b border-slate-200 pb-3">
                  <h4 className="font-extrabold text-base text-slate-900">আল-জামিয়া ইসলামিয়া মাদ্রাসা</h4>
                  <p className="text-[11px] text-slate-500">অফিসিয়াল টাকা প্রাপ্তির অফিশিয়াল রসিদ</p>
                </div>

                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">রসিদ নম্বর:</span>
                  <span className="font-bold">REC-{receiptInvoice.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">শিক্ষার্থী নাম:</span>
                  <span className="font-bold">{receiptInvoice.students?.profiles?.full_name_bn || receiptInvoice.students?.profiles?.full_name_en}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">স্টুডেন্ট আইডি:</span>
                  <span className="font-mono font-bold text-emerald-700">{receiptInvoice.students?.student_id_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ফি-এর বিবরণ:</span>
                  <span className="font-semibold">{receiptInvoice.title}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>প্রাপ্ত টাকার পরিমাণ:</span>
                  <span className="text-emerald-600">{Number(receiptInvoice.total_amount).toLocaleString('bn-BD')}</span>
                </div>
              </div>

              <Button onClick={() => window.print()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11">
                <Printer className="w-4 h-4 mr-2" /> প্রিন্ট করুন
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

