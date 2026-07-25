import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserPlus, CheckCircle2, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function StudentAdmission() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Form State
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
    fetchClasses();
    generateStudentId();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from('classes').select('*').eq('is_active', true);
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error.message);
    }
  };

  const generateStudentId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, studentIdNumber: `2026-ST-${randomNum}` }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    
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
          class_id: formData.classId || (classes[0]?.id || null),
          status: 'Active'
        }]);

      if (studentError) throw studentError;
      
      setSuccessMessage(`শিক্ষার্থীর ভর্তি সফল হয়েছে! স্টুডেন্ট আইডি: ${formData.studentIdNumber}`);
      
      // Reset form
      setFormData({
        fullNameEn: '', fullNameBn: '', studentIdNumber: '', classId: '', gender: 'Male', phonePrimary: '', addressPresent: ''
      });
      generateStudentId();
      
    } catch (error) {
      console.error('Error in admission:', error.message);
      alert('ভর্তি প্রক্রিয়া ব্যর্থ হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-2">সেশন ২০২৬-২০২৭</Badge>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">শিক্ষার্থী ভর্তি ফরম</h2>
          <p className="text-slate-500 text-xs mt-1">নতুন শিক্ষার্থীর তথ্য এন্ট্রি ও ভর্তি সুসম্পন্ন করুন</p>
        </div>

        <Button type="button" variant="outline" onClick={generateStudentId} className="border-slate-300 text-xs rounded-xl">
          <UserPlus className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> নতুন আইডি তৈরি করুন
        </Button>

      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullNameBn" className="text-slate-700 font-medium">শিক্ষার্থীর নাম (বাংলায়) *</Label>
                <Input
                  id="fullNameBn"
                  placeholder="যেমন: আব্দুল্লাহ আল মামুন"
                  required
                  value={formData.fullNameBn}
                  onChange={(e) => handleInputChange('fullNameBn', e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullNameEn" className="text-slate-700 font-medium">শিক্ষার্থীর নাম (ইংরেজি) *</Label>
                <Input
                  id="fullNameEn"
                  placeholder="e.g. Abdullah Al Mamun"
                  required
                  value={formData.fullNameEn}
                  onChange={(e) => handleInputChange('fullNameEn', e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentIdNumber" className="text-slate-700 font-medium">স্টুডেন্ট নম্বর / আইডি *</Label>
                <Input
                  id="studentIdNumber"
                  required
                  value={formData.studentIdNumber}
                  onChange={(e) => handleInputChange('studentIdNumber', e.target.value)}
                  className="rounded-xl border-slate-300 font-mono bg-slate-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classId" className="text-slate-700 font-medium">ভর্তিকৃত শ্রেণি *</Label>
                <Select value={formData.classId} onValueChange={(val) => handleInputChange('classId', val)}>
                  <SelectTrigger id="classId" className="rounded-xl border-slate-300">
                    <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.level} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-slate-700 font-medium">লিঙ্গ (Gender) *</Label>
                <Select value={formData.gender} onValueChange={(val) => handleInputChange('gender', val)}>
                  <SelectTrigger id="gender" className="rounded-xl border-slate-300">
                    <SelectValue placeholder="লিঙ্গ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">ছাত্র (Male)</SelectItem>
                    <SelectItem value="Female">ছাত্রী (Female)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phonePrimary" className="text-slate-700 font-medium">অভিভাবকের মোবাইল নম্বর *</Label>
                <Input
                  id="phonePrimary"
                  placeholder="017XXXXXXXX"
                  required
                  value={formData.phonePrimary}
                  onChange={(e) => handleInputChange('phonePrimary', e.target.value)}
                  className="rounded-xl border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressPresent" className="text-slate-700 font-medium">বর্তমান ঠিকানা *</Label>
              <Textarea
                id="addressPresent"
                placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
                rows={3}
                required
                value={formData.addressPresent}
                onChange={(e) => handleInputChange('addressPresent', e.target.value)}
                className="rounded-xl border-slate-300"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 h-11">
                {loading ? "প্রক্রিয়াকরণ হচ্ছে..." : "ভর্তি সুসম্পন্ন করুন"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

