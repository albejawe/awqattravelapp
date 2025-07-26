-- إضافة روابط للمقالات والفئات
ALTER TABLE public.blogs ADD COLUMN article_url TEXT;
ALTER TABLE public.categories ADD COLUMN category_url TEXT;

-- إضافة فهرس لتحسين البحث
CREATE INDEX idx_blogs_category_id ON public.blogs(category_id);
CREATE INDEX idx_blogs_status ON public.blogs(status);
CREATE INDEX idx_blogs_created_at ON public.blogs(created_at);

-- تحديث دالة توليد البيانات الوصفية لإضافة SEO محسن
CREATE OR REPLACE FUNCTION public.generate_seo_meta(title_text text, content_text text)
RETURNS TABLE(meta_title text, meta_description text) 
LANGUAGE plpgsql
AS $$
DECLARE
  clean_content TEXT;
  word_count INTEGER;
BEGIN
  -- تنظيف المحتوى من HTML
  clean_content := regexp_replace(content_text, '<[^>]*>', '', 'g');
  clean_content := regexp_replace(clean_content, '\s+', ' ', 'g');
  clean_content := trim(clean_content);
  
  -- توليد meta_title محسن
  meta_title := CASE 
    WHEN length(title_text) <= 60 THEN title_text || ' | أوقات السفر'
    ELSE left(title_text, 57) || '...'
  END;
  
  -- توليد meta_description محسن
  meta_description := left(clean_content, 155) || 
    CASE WHEN length(clean_content) > 155 THEN '...' ELSE '' END;
  
  RETURN NEXT;
END;
$$;

-- إنشاء دالة لتوليد slug محسن
CREATE OR REPLACE FUNCTION public.generate_slug_enhanced(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  result text;
BEGIN
  -- تحويل النص العربي إلى رابط مفهوم
  result := lower(input_text);
  result := regexp_replace(result, '[^a-zA-Z0-9\u0600-\u06FF\s]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := trim(result, '-');
  
  -- إضافة timestamp للتأكد من الفرادة
  IF length(result) = 0 THEN
    result := 'article-' || extract(epoch from now())::text;
  END IF;
  
  RETURN result;
END;
$$;