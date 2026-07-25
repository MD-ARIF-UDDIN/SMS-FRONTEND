import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Building2, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sends the access token in the URL hash fragment after the redirect.
    // onAuthStateChange fires with SIGNED_IN / PASSWORD_RECOVERY events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড দুটি মিলছে না। আবার চেক করুন।');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('পাসওয়ার্ড আপডেট করা সম্ভব হয়নি। লিঙ্কটি মেয়াদোত্তীর্ণ হতে পারে।');
    } else {
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
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
          <CardTitle className="text-2xl font-bold tracking-tight text-white">নতুন পাসওয়ার্ড সেট করুন</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            আপনার নতুন পাসওয়ার্ড দুইবার লিখুন
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 pb-6 px-8">
          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">পাসওয়ার্ড পরিবর্তন সফল!</p>
                <p className="text-slate-400 text-sm mt-1">আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে...</p>
              </div>
            </div>
          ) : !sessionReady ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-10 w-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">রিসেট লিঙ্ক যাচাই করা হচ্ছে...</p>
              <p className="text-xs text-slate-600">
                যদি কোনো পরিবর্তন না হয়,{' '}
                <Link to="/forgot-password" className="text-emerald-400 hover:underline">
                  আবার রিসেট লিঙ্ক পাঠান
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-medium">নতুন পাসওয়ার্ড</Label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 pr-10 bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 font-medium">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="একই পাসওয়ার্ড আবার লিখুন"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 pl-10 bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500 rounded-xl"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400">পাসওয়ার্ড দুটি মিলছে না</p>
                )}
                {confirmPassword && password === confirmPassword && password.length >= 6 && (
                  <p className="text-xs text-emerald-400">✓ পাসওয়ার্ড মিলেছে</p>
                )}
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
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  'পাসওয়ার্ড পরিবর্তন করুন'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-800/80 py-4 text-sm bg-slate-900/50">
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            লগইন পেজে ফিরে যান
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
