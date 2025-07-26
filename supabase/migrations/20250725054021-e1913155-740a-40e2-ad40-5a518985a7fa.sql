-- إضافة جدول الفئات
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إضافة عمود category_id إلى جدول blogs
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5;

-- تفعيل RLS على جدول الفئات
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات للفئات
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- إدراج بعض الفئات الافتراضية
INSERT INTO public.categories (name, slug, description, color) VALUES
('سياحة محلية', 'local-tourism', 'اكتشف جمال المملكة العربية السعودية', '#10b981'),
('سياحة عالمية', 'international-tourism', 'اكتشف أجمل الوجهات حول العالم', '#3b82f6'),
('نصائح سفر', 'travel-tips', 'نصائح وإرشادات للمسافرين', '#f59e0b'),
('مراجعات فنادق', 'hotel-reviews', 'مراجعات لأفضل الفنادق والمنتجعات', '#ef4444'),
('مغامرات', 'adventures', 'رحلات المغامرة والأنشطة الخارجية', '#8b5cf6'),
('ثقافة وتراث', 'culture-heritage', 'التراث والثقافة في الوجهات السياحية', '#f97316')
ON CONFLICT (slug) DO NOTHING;

-- دالة لحساب وقت القراءة
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content_text TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  word_count INTEGER;
  reading_time INTEGER;
BEGIN
  -- حساب عدد الكلمات (تقدير بناءً على المسافات)
  word_count := array_length(string_to_array(content_text, ' '), 1);
  
  -- حساب وقت القراءة (200 كلمة في الدقيقة)
  reading_time := CEIL(word_count::FLOAT / 200);
  
  -- الحد الأدنى دقيقة واحدة
  RETURN GREATEST(reading_time, 1);
END;
$$;

-- تحديث trigger لحساب وقت القراءة تلقائياً
CREATE OR REPLACE FUNCTION public.update_blog_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- توليد slug إذا لم يكن موجوداً
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = public.generate_slug(NEW.title);
  END IF;
  
  -- توليد meta_title إذا لم يكن موجوداً
  IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
    NEW.meta_title = NEW.title;
  END IF;
  
  -- توليد meta_description إذا لم يكن موجوداً
  IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
    NEW.meta_description = LEFT(NEW.excerpt, 160);
  END IF;
  
  -- حساب وقت القراءة
  NEW.reading_time = public.calculate_reading_time(NEW.content);
  
  -- تحديث التاريخ
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger جديد
DROP TRIGGER IF EXISTS update_blog_slug ON public.blogs;
CREATE TRIGGER update_blog_metadata_trigger
  BEFORE INSERT OR UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_metadata();