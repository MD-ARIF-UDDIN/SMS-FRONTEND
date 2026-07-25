import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Building2, Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { signIn, role } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      // Map Supabase error messages to user-friendly Bengali text
      const msg = signInError.message?.toLowerCase() || '';
      if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
        setError('ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।');
      } else if (msg.includes('email not confirmed')) {
        setError('আপনার ইমেইল এখনো যাচাই করা হয়নি। ইনবক্স চেক করুন।');
      } else if (msg.includes('too many requests')) {
        setError('অনেক বেশি চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
      } else {
        setError(signInError.message || 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
      setLoading(false);
      return;
    }

    // onAuthStateChange will update role; navigate based on what we got back
    // We wait briefly for the role to be set, then the ProtectedRoute handles redirect
    // Navigate to dashboard root — ProtectedRoute will forward by role
    navigate('/dashboard', { replace: true });
    setLoading(false);
  };

  // Pre-fill demo credentials helper (for development convenience)
  const fillDemo = (demoRole) => {
    const creds = {
      admin:   { email: 'admin@gmail.com',   password: 'admin123456' },
      teacher: { email: 'teacher@gmail.com', password: 'teacher123456' },
      student: { email: 'student@gmail.com', password: 'student123456' },
    };
    setEmail(creds[demoRole].email);
    setPassword(creds[demoRole].password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl text-slate-100 relative z-10 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-3 text-center pt-8 pb-6 bg-slate-900/80 border-b border-slate-800">
          <div className="mx-auto bg-emerald-500/10 border border-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-1 text-emerald-400 shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">মাদ্রাসা পোর্টালে স্বাগতম</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 pb-6 px-8 space-y-6">
          {/* Quick Demo Credential Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              ডেমো অ্যাকাউন্ট
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button type="button" variant="outline" size="sm"
                onClick={() => fillDemo('admin')}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-emerald-600 hover:text-white text-xs">
                এডমিন
              </Button>
              <Button type="button" variant="outline" size="sm"
                onClick={() => fillDemo('teacher')}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-emerald-600 hover:text-white text-xs">
                শিক্ষক
              </Button>
              <Button type="button" variant="outline" size="sm"
                onClick={() => fillDemo('student')}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-emerald-600 hover:text-white text-xs">
                শিক্ষার্থী
              </Button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">ইমেইল ঠিকানা</Label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@madrasa.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-10 bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 font-medium">পাসওয়ার্ড</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-400 hover:underline hover:text-emerald-300 transition-colors"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  প্রবেশ করা হচ্ছে...
                </>
              ) : (
                <>
                  পোর্টালে সাইন-ইন করুন
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-800/80 py-4 text-sm text-slate-400 bg-slate-900/50">
          <Link to="/" className="text-emerald-400 font-semibold hover:underline">
            মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
