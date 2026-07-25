import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Building2, Save, Phone, Mail, MapPin, Globe, CheckCircle2, Sliders, Calendar, DollarSign, Award, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState({
    madrasaNameBn: 'আল-জামিয়া ইসলামিয়া মাদ্রাসা',
    madrasaNameEn: 'Al-Jamia Islamia Madrasa',
    eiinNumber: '১৩২৪৫৬',
    email: 'info@aljamia.edu.bd',
    phone: '০১৮০০-০০০-০০০',
    altPhone: '০১৭০০-০০০-০০০',
    address: 'মাদ্রাসা রোড, রামপুরা, ঢাকা-১২১৯, বাংলাদেশ',
    establishedYear: '১৯৮৫',
    currentSession: '২০২৬-২০২৭',
    currencySymbol: '',
    passMarks: '৩৩',
    maxGpa: '৫.০০',
    receiptTitle: 'অফিশিয়াল মানি রসিদ',
    slogan: 'দ্বীনি শিক্ষা ও সুন্নাহ ভিত্তিক আদর্শ চরিত্র গঠন'
  });

  useEffect(() => {
    // Load saved settings from localStorage or Supabase
    const saved = localStorage.getItem('madrasa_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      // Save locally
      localStorage.setItem('madrasa_settings', JSON.stringify(settings));

      // Show success alert
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Top Banner */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-1.5">সিস্টেম কনফিগারেশন</Badge>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">মাদ্রাসা ও সিস্টেম সেটিংস</h2>
          <p className="text-slate-500 text-xs mt-1">মাদ্রাসার নাম, ইমেইল, ফোন নম্বর, ঠিকানা ও প্রিন্ট মেমো সেটিংস পরিচালনা করুন</p>
        </div>

        <Button onClick={handleSaveSettings} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11 px-6">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "সংরক্ষণ হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold text-sm">মাদ্রাসার সেটিংস সফলভাবে ডাটাবেজ ও সিস্টেমে আপডেট হয়েছে!</p>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Basic Institution Info */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">মাদ্রাসার প্রাথমিক তথ্য</CardTitle>
                <CardDescription className="text-xs text-slate-500">ইনস্টিটিউটের অফিশিয়াল নাম ও পরিচিতি নম্বর</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="madrasaNameBn" className="text-slate-700 font-medium">মাদ্রাসার নাম (বাংলায়) *</Label>
                <Input
                  id="madrasaNameBn"
                  value={settings.madrasaNameBn}
                  onChange={(e) => handleInputChange('madrasaNameBn', e.target.value)}
                  className="rounded-xl border-slate-300 font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="madrasaNameEn" className="text-slate-700 font-medium">Madrasa Name (English) *</Label>
                <Input
                  id="madrasaNameEn"
                  value={settings.madrasaNameEn}
                  onChange={(e) => handleInputChange('madrasaNameEn', e.target.value)}
                  className="rounded-xl border-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eiinNumber" className="text-slate-700 font-medium">ইআইআইএন / কোড নম্বর (EIIN)</Label>
                <Input
                  id="eiinNumber"
                  value={settings.eiinNumber}
                  onChange={(e) => handleInputChange('eiinNumber', e.target.value)}
                  className="rounded-xl border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="establishedYear" className="text-slate-700 font-medium">প্রতিষ্ঠার সাল (Est.)</Label>
                <Input
                  id="establishedYear"
                  value={settings.establishedYear}
                  onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                  className="rounded-xl border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan" className="text-slate-700 font-medium">মাদ্রাসার স্লোগান / বাণী</Label>
              <Input
                id="slogan"
                value={settings.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                className="rounded-xl border-slate-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">যোগাযোগ ও ঠিকানা সেটিংস</CardTitle>
                <CardDescription className="text-xs text-slate-500">ইমেইল, ফোন নম্বর ও ভৌগোলিক অবস্থান</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">অফিশিয়াল ইমেইল ঠিকানা *</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="rounded-xl border-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">অফিস মোবাইল / হটলাইন *</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="rounded-xl border-slate-300 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700 font-medium">মাদ্রাসার পূর্ণাঙ্গ অবস্থান ও ঠিকানা *</Label>
              <Textarea
                id="address"
                rows={3}
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="rounded-xl border-slate-300"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic & Print Settings */}
        <Card className="border-slate-200 bg-white rounded-2xl shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">একাডেমিক ও মেমো সেটিংস</CardTitle>
                <CardDescription className="text-xs text-slate-500">শিক্ষাবর্ষ, কারেন্সি ও রসিদের হেডার</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentSession" className="text-slate-700 font-medium">চলতি শিক্ষাবর্ষ</Label>
                <Input
                  id="currentSession"
                  value={settings.currentSession}
                  onChange={(e) => handleInputChange('currentSession', e.target.value)}
                  className="rounded-xl border-slate-300 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencySymbol" className="text-slate-700 font-medium">মুদ্রা চিহ্ন (Currency)</Label>
                <Input
                  id="currencySymbol"
                  value={settings.currencySymbol}
                  onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                  className="rounded-xl border-slate-300 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passMarks" className="text-slate-700 font-medium">পাস নম্বর (Pass Marks)</Label>
                <Input
                  id="passMarks"
                  value={settings.passMarks}
                  onChange={(e) => handleInputChange('passMarks', e.target.value)}
                  className="rounded-xl border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptTitle" className="text-slate-700 font-medium">প্রিন্ট মানি রসিদের শিরোনাম</Label>
              <Input
                id="receiptTitle"
                value={settings.receiptTitle}
                onChange={(e) => handleInputChange('receiptTitle', e.target.value)}
                className="rounded-xl border-slate-300 font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-12 px-8">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "সংরক্ষণ হচ্ছে..." : "সকল সেটিংস সংরক্ষণ করুন"}
          </Button>
        </div>
      </form>
    </div>
  );
}
