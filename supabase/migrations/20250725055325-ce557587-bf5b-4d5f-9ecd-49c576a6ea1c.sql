-- إصلاح مشاكل search_path للدوال
CREATE OR REPLACE FUNCTION public.generate_seo_meta(title_text text, content_text text)
RETURNS TABLE(meta_title text, meta_description text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.generate_slug_enhanced(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- إصلاح الدوال الموجودة
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;