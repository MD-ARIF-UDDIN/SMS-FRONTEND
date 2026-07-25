import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, UserPlus, Wallet, Receipt, Megaphone, Calendar, LogOut, Menu, X, Building2, Bell, Search, ShieldCheck, Settings, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const adminLinks = [
    { link: '/dashboard/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { link: '/dashboard/admin/classes', label: 'শ্রেণি ও বিভাগ', icon: GraduationCap },
    { link: '/dashboard/admin/students', label: 'শিক্ষার্থী তালিকা ও ভর্তি', icon: BookOpen },
    { link: '/dashboard/admin/fees', label: 'ফি আদায় ও রসিদ', icon: Receipt },
    { link: '/dashboard/admin/expenses', label: 'হিসাব ও ব্যয়', icon: Wallet },
    { link: '/dashboard/admin/reports', label: 'রিপোর্ট ও হিসাব', icon: FileText },
    { link: '/dashboard/admin/notices', label: 'নোটিশ বোর্ড', icon: Megaphone },
    { link: '/dashboard/admin/routine', label: 'ক্লাস রুটিন', icon: Calendar },
    { link: '/dashboard/admin/teachers', label: 'শিক্ষক ও স্টাফ', icon: Users },
    { link: '/dashboard/admin/settings', label: 'মাদ্রাসা সেটিংস', icon: Settings },
  ];




  const teacherLinks = [
    { link: '/dashboard/teacher', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { link: '/dashboard/teacher/marks', label: 'নম্বর ইনপুট', icon: BookOpen },
    { link: '/dashboard/teacher/attendance', label: 'উপস্থিতি খাতা', icon: Users },
  ];

  const studentLinks = [
    { link: '/dashboard/student', label: 'আমার পোর্টাল', icon: LayoutDashboard },
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
    <div className="min-h-screen flex bg-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
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
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shadow-2xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-950">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-white">মাদ্রাসা ইআরপি</h2>
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wider uppercase">ডিজিটাল সিস্টেম</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-emerald-600 text-white font-bold border border-emerald-400/30">
            <AvatarFallback>{role?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@madrasa.edu'}</p>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] px-2 py-0.5 mt-0.5 font-semibold">
              {getRoleBadgeLabel()}
            </Badge>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-2 px-4 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">প্রধান মেনু</p>
          {navLinks.map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={item.label}
                to={item.link}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950 font-semibold" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/60 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/50"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            লগআউট করুন
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-2.5 -ml-2 rounded-xl hover:bg-slate-100 border border-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-slate-100/80 rounded-xl border border-slate-200 text-slate-500 w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="খুঁজুন (আইডি, নাম, শ্রেণি)..." className="bg-transparent text-xs w-full focus:outline-none text-slate-800" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
              </Button>
            </div>

            
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">মাদ্রাসা ম্যানেজমেন্ট</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{getRoleBadgeLabel()}</p>
              </div>
              <Avatar className="h-10 w-10 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-100">
                <AvatarFallback>{role?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto py-4 px-3 sm:px-5">
          <div className="w-full space-y-4">
            <Outlet />
          </div>
        </main>


      </div>
    </div>
  );
}

