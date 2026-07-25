import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, Users, BookOpen, Layers, UserCheck, CreditCard, 
  DollarSign, FileText, Settings, LogOut, Menu, X, Bell, Search, 
  Calendar, Award, CheckSquare, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const adminLinks = [
    { label: 'ড্যাশবোর্ড ওভারভিউ', link: '/dashboard/admin', icon: Building2 },
    { label: 'শ্রেণি ও বিষয় ব্যবস্থাপনা', link: '/dashboard/admin/classes', icon: Layers },
    { label: 'শিক্ষার্থী রেজিস্টার & ভর্তি', link: '/dashboard/admin/students', icon: Users },
    { label: 'শিক্ষক ও স্টাফ ডিরেক্টরি', link: '/dashboard/admin/teachers', icon: UserCheck },
    { label: 'বক্স-ওয়াইজ ক্লাস রুটিন', link: '/dashboard/admin/routine', icon: Calendar },
    { label: 'ফি ও টিউশন কালেকশন', link: '/dashboard/admin/fees', icon: CreditCard },
    { label: 'মাদ্রাসা হিসাব ও ব্যয় রেজিস্টার', link: '/dashboard/admin/expenses', icon: DollarSign },
    { label: 'নোটিশ বোর্ড প্রকাশ', link: '/dashboard/admin/notices', icon: Bell },
    { label: 'রিপোর্ট ও ট্যাবুলেশন শিট', link: '/dashboard/admin/reports', icon: FileText },
    { label: 'মাদ্রাসা সেটিংস', link: '/dashboard/admin/settings', icon: Settings },
  ];

  const teacherLinks = [
    { label: 'শিক্ষক ড্যাশবোর্ড', link: '/dashboard/teacher', icon: Building2 },
    { label: 'দৈনিক হাজিরা খাতা', link: '/dashboard/teacher/attendance', icon: CheckSquare },
    { label: 'পরীক্ষার নম্বর ইনপুট', link: '/dashboard/teacher/marks', icon: Award },
  ];

  const studentLinks = [
    { label: 'শিক্ষার্থী পোর্টাল', link: '/dashboard/student', icon: Building2 },
  ];

  const getLinks = () => {
    if (role === 'admin') return adminLinks;
    if (role === 'teacher') return teacherLinks;
    if (role === 'student') return studentLinks;
    return adminLinks;
  };

  const navLinks = getLinks();

  const getRoleBadgeLabel = () => {
    if (role === 'admin') return 'প্রধান এডমিন';
    if (role === 'teacher') return 'সম্মানিত শিক্ষক';
    if (role === 'student') return 'শিক্ষার্থী';
    return 'ইউজার';
  };

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-100 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between shadow-2xl h-full lg:h-screen lg:sticky lg:top-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          <Link to="/" className="flex items-center gap-3 min-w-0" onClick={() => setSidebarOpen(false)}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full bg-white p-0.5 shadow-md flex-shrink-0" 
            />
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base leading-tight text-white truncate">মাদ্রাসা ইআরপি</h2>
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block truncate">ডিজিটাল সিস্টেম</span>
            </div>
          </Link>

          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-1.5 custom-scrollbar">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={item.label}
                to={item.link}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl text-xs font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950 font-bold" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-emerald-400")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile & Desktop Always Visible Logout Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 w-full rounded-xl text-xs font-bold bg-red-950/70 text-red-200 hover:bg-red-900 hover:text-white transition-all border border-red-800/60 shadow-md"
          >
            <LogOut className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">লগআউট করুন (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        
        {/* Top Header */}
        <header className="h-16 sm:h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-700 hover:text-slate-900 p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 border border-slate-200"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-slate-100/80 rounded-xl border border-slate-200 text-slate-500 w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="খুঁজুন (আইডি, নাম, শ্রেণি)..." className="bg-transparent text-xs w-full focus:outline-none text-slate-800" />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative h-9 w-9 sm:h-10 sm:w-10">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
              </Button>
            </div>

            <div className="h-6 sm:h-8 w-px bg-slate-200" />

            {/* Quick Header Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-8 sm:h-9 px-2 sm:px-3 border border-red-200/80 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-slate-800 leading-none">মাদ্রাসা প্যানেল</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{getRoleBadgeLabel()}</p>
              </div>
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md">
                <AvatarFallback className="text-xs sm:text-sm">{role?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-6 space-y-4 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Footer with Developer Credits */}
        <footer className="py-3 sm:py-4 px-4 sm:px-6 border-t border-slate-200 bg-white text-center text-[11px] sm:text-xs text-slate-600 font-medium shrink-0">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} রংগিয়াঘোনা মনছুরিয়া ফাযিল (ডিগ্রী) মাদ্রাসা | Developed By: <span className="font-extrabold text-slate-900">Md Arif Uddin</span> | <a href="https://wa.me/8801825334505" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-600 font-bold hover:underline font-mono inline-flex items-center gap-1">💬 01825334505</a>
          </p>
        </footer>

      </div>
    </div>
  );
}
