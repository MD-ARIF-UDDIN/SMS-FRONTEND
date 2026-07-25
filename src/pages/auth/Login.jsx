import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import {
  Building2, Lock, Mail, AlertCircle, ChevronRight,
  ShieldCheck, BookOpen, GraduationCap
} from 'lucide-react';

const PORTALS = [
  {
    id:          'admin',
    label:       'এডমিন',
    labelEn:     'Admin Portal',
    icon:        ShieldCheck,
    placeholder: 'admin@madrasa.edu',
    color:       'emerald',
    description: 'প্রশাসক অ্যাকাউন্ট দিয়ে লগইন করুন',
  },
  {
    id:          'teacher',
    label:       'শিক্ষক',
    labelEn:     'Teacher Portal',
    icon:        BookOpen,
    placeholder: 'teacher@madrasa.edu',
    color:       'teal',
    description: 'শিক্ষক অ্যাকাউন্ট দিয়ে লগইন করুন',
  },
  {
    id:          'student',
    label:       'শিক্ষার্থী',
    labelEn:     'Student Portal',
    icon:        GraduationCap,
    placeholder: 'student@madrasa.edu',
    color:       'cyan',
    description: 'শিক্ষার্থী অ্যাকাউন্ট দিয়ে লগইন করুন',
  },
];

// Tailwind color map — needed because Tailwind purges dynamic class names
const COLOR = {
  emerald: {
    tab:     'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40',
    tabOff:  'text-slate-400 hover:text-emerald-400 hover:bg-slate-800',
    icon:    'text-emerald-400',
    iconBg:  'bg-emerald-500/10 border-emerald-500/20',
    focus:   'focus:border-emerald-500',
    btn:     'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950',
  },
  teal: {
    tab:     'bg-teal-600 text-white shadow-lg shadow-teal-900/40',
    tabOff:  'text-slate-400 hover:text-teal-400 hover:bg-slate-800',
    icon:    'text-teal-400',
    iconBg:  'bg-teal-500/10 border-teal-500/20',
    focus:   'focus:border-teal-500',
    btn:     'from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-teal-950',
  },
  cyan: {
    tab:     'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40',
    tabOff:  'text-slate-400 hover:text-cyan-400 hover:bg-slate-800',
    icon:    'text-cyan-400',
    iconBg:  'bg-cyan-500/10 border-cyan-500/20',
    focus:   'focus:border-cyan-500',
    btn:     'from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-cyan-950',
  },
};

export default function Login() {
  const [activePortal, setActivePortal] = useState('admin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const navigate      = useNavigate();
  const { signIn }    = useAuth();

  const portal = PORTALS.find(p => p.id === activePortal);
  const c      = COLOR[portal.color];

  const handleTabChange = (id) => {
    setActivePortal(id);
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
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

    // DashboardRedirect in App.jsx will send the user to the right dashboard by role
    navigate('/dashboard', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl text-slate-100 relative z-10 rounded-2xl overflow-hidden">

        {/* Header */}
        <CardHeader className="space-y-3 text-center pt-8 pb-5 bg-slate-900/80 border-b border-slate-800">
          <div className={`mx-auto border w-14 h-14 rounded-2xl flex items-center justify-center mb-1 shadow-inner transition-colors duration-300 ${c.iconBg}`}>
            <portal.icon className={`w-7 h-7 transition-colors duration-300 ${c.icon}`} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            মাদ্রাসা পোর্টালে স্বাগতম
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm transition-all duration-200">
            {portal.description}
          </CardDescription>
        </CardHeader>

        {/* Portal Tabs */}
        <div className="flex bg-slate-950/60 border-b border-slate-800">
          {PORTALS.map((p) => {
            const isActive = p.id === activePortal;
            const tc = COLOR[p.color];
            return (
              <button
                key={p.id}
                onClick={() => handleTabChange(p.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-semibold transition-all duration-200 rounded-none first:rounded-none last:rounded-none relative ${
                  isActive ? tc.tab : `bg-transparent ${tc.tabOff}`
                }`}
              >
                <p.icon className="w-4 h-4" />
                <span>{p.label}</span>
                <span className="text-[10px] font-normal opacity-70 hidden sm:block">{p.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <CardContent className="pt-6 pb-6 px-8">
          <form onSubmit={handleLogin} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">ইমেইল ঠিকানা</Label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder={portal.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`h-11 pl-10 bg-slate-950 border-slate-800 text-slate-100 rounded-xl transition-colors ${c.focus}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 font-medium">পাসওয়ার্ড</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
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
                  className={`h-11 pl-10 bg-slate-950 border-slate-800 text-slate-100 rounded-xl transition-colors ${c.focus}`}
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
              className={`w-full h-11 bg-gradient-to-r text-white font-bold rounded-xl text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-300 ${c.btn}`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  প্রবেশ করা হচ্ছে...
                </>
              ) : (
                <>
                  {portal.label} পোর্টালে সাইন-ইন করুন
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
