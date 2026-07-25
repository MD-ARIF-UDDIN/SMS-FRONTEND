import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Building2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError('পাসওয়ার্ড রিসেট ইমেইল পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl text-slate-100 relative z-10 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-3 text-center pt-8 pb-6 bg-slate-900/80 border-b border-slate-800">
          <div className="mx-auto bg-emerald-500/10 border border-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-1 text-emerald-400 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">পাসওয়ার্ড রিসেট</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            আপনার নিবন্ধিত ইমেইলে একটি রিসেট লিঙ্ক পাঠানো হবে
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 pb-6 px-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">ইমেইল পাঠানো হয়েছে!</p>
                <p className="text-slate-400 text-sm mt-1">
                  <span className="text-emerald-400 font-medium">{email}</span> এ একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে। ইনবক্স চেক করুন।
                </p>
              </div>
              <p className="text-xs text-slate-500">ইমেইল না পেলে স্প্যাম ফোল্ডার চেক করুন অথবা কয়েক মিনিট পর আবার চেষ্টা করুন।</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium">ইমেইল ঠিকানা</Label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="আপনার ইমেইল লিখুন"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-950/60 text-red-300 text-sm rounded-xl border border-red-800/50">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-base shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    পাঠানো হচ্ছে...
                  </>
                ) : (
                  'রিসেট লিঙ্ক পাঠান'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-800/80 py-4 text-sm bg-slate-900/50">
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-emerald-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            লগইন পেজে ফিরে যান
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
