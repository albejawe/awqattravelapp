-- إصلاح دالة calculate_reading_time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content_text text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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