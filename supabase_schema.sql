-- Fazil Madrasa Management System - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extended User Info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin', 'accountant', 'teacher', 'student')),
    full_name_en VARCHAR(100) NOT NULL,
    full_name_bn VARCHAR(100),
    dob DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    phone_primary VARCHAR(20),
    phone_secondary VARCHAR(20),
    address_present TEXT,
    address_permanent TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Academic Years
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    year_name VARCHAR(10) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false
);

-- 3. Classes & Sections
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(20) NOT NULL,
    UNIQUE(class_id, name)
);

-- 4. Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20),
    type VARCHAR(20) CHECK (type IN ('Dini', 'General')),
    total_marks INTEGER DEFAULT 100,
    pass_marks INTEGER DEFAULT 33,
    is_active BOOLEAN DEFAULT true
);

-- 5. Teachers & Students
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designation VARCHAR(50),
    join_date DATE,
    qualifications TEXT,
    subject_specialization TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    student_id_number VARCHAR(50) UNIQUE NOT NULL,
    admission_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Dropped', 'Alumni'))
);


-- 6. Teacher Assignments (Mapping)
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE
);

-- 7. Admissions & Promotion History
CREATE TABLE IF NOT EXISTS public.admissions_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    roll_no INTEGER,
    previous_exam_result_id UUID,
    admission_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(student_id, academic_year_id)
);

-- 8. Exams & Marks (Subject Wise Workflow)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    exam_name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_published BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.marks_entry (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2),
    is_absent BOOLEAN DEFAULT false,
    entered_by UUID REFERENCES public.teachers(id),
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(exam_id, subject_id, student_id)
);

-- 9. Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
    recorded_by UUID REFERENCES public.profiles(id),
    UNIQUE(student_id, date)
);

-- 10. Financials (Fees & Invoices)
CREATE TABLE IF NOT EXISTS public.fee_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    default_amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(20) CHECK (frequency IN ('One-time', 'Monthly', 'Yearly'))
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE,
    title VARCHAR(150),
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Partial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    received_by UUID REFERENCES public.profiles(id)
);

-- 11. Expenses (Purchases & School Costs)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    recorded_by UUID REFERENCES public.profiles(id),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. Notices (Public & Portal Announcements)
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_html TEXT,
    content TEXT,
    target_roles TEXT[] DEFAULT ARRAY['student', 'teacher', 'parent'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 13. Routines (Class Timetables)
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    room_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ALTER MIGRATIONS FOR RELATIONSHIPS AND DEFAULTS
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;

-- Disable Row Level Security (RLS) on all public tables for unrestricted API data access
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admissions_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marks_entry DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.routines DISABLE ROW LEVEL SECURITY;

-- Grant privileges for anon and authenticated API access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;

-- 14. Madrasa Settings (Single-row config table)
CREATE TABLE IF NOT EXISTS public.madrasa_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Ensure RLS is disabled for open access
ALTER TABLE IF EXISTS public.madrasa_settings DISABLE ROW LEVEL SECURITY;

-- Seed a default empty row so upsert always works
INSERT INTO public.madrasa_settings (id, settings)
VALUES (1, '{
  "madrasaNameBn": "আল-জামিয়া ইসলামিয়া মাদ্রাসা",
  "madrasaNameEn": "Al-Jamia Islamia Madrasa",
  "eiinNumber": "১৩২৪৫৬",
  "email": "info@aljamia.edu.bd",
  "phone": "০১৮০০-০০০-০০০",
  "altPhone": "০১৭০০-০০০-০০০",
  "address": "মাদ্রাসা রোড, রামপুরা, ঢাকা-১২১৯, বাংলাদেশ",
  "establishedYear": "১৯৮৫",
  "currentSession": "২০২৬-২০২৭",
  "currencySymbol": "৳",
  "passMarks": "৩৩",
  "maxGpa": "৫.০০",
  "receiptTitle": "অফিশিয়াল মানি রসিদ",
  "slogan": "দ্বীনি শিক্ষা ও সুন্নাহ ভিত্তিক আদর্শ চরিত্র গঠন"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

