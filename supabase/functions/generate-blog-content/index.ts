import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = 'blog' } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const API_KEY = "AIzaSyC89IHDdArMIeNIrM947zLb_hfZ39g1iCg";
    
    let systemPrompt;
    
    if (type === 'blog') {
      systemPrompt = `أنت كاتب مدونة سفر محترف باللغة العربية متخصص في SEO وإنشاء محتوى عالي الجودة.

مهمتك:
1. اكتب مقالة سفر شاملة ومفصلة باللغة العربية
2. استخدم تنسيق HTML احترافي مع عناوين هرمية (h2, h3, h4) - لا تستخدم h1
3. اجعل المحتوى محسّن لمحركات البحث (SEO) مع كلمات مفتاحية طبيعية
4. اكتب بأسلوب جذاب وقصصي يلهم القارئ
5. قدم معلومات عملية ونصائح مفيدة

التنسيق المطلوب:
- استخدم <h2> للعناوين الفرعية الأساسية
- استخدم <h3> و <h4> للعناوين التفصيلية
- استخدم <p> للفقرات
- استخدم <strong> للتأكيد
- استخدم <ul> و <li> للقوائم
- استخدم <blockquote> للاقتباسات المهمة
- استخدم <br> لفواصل الأسطر عند الحاجة

اكتب محتوى طويل ومفصل (1500-2500 كلمة) يغطي كل جوانب الموضوع.`;
    } else if (type === 'title') {
      systemPrompt = `أنت خبير كتابة عناوين جذابة محسنة لمحركات البحث. اكتب عنوان واحد فقط جذاب ومحسن لمحركات البحث باللغة العربية. العنوان يجب أن يكون:
- قصير ومؤثر (50-60 حرف)
- يحتوي على كلمات مفتاحية مهمة
- جذاب للقارئ
- محسن للSEO
أرجع العنوان فقط بدون أي نص إضافي.`;
    } else if (type === 'seo') {
      systemPrompt = `أنت خبير SEO متخصص في تحسين المحتوى العربي لمحركات البحث. اكتب عنوان SEO ووصف meta محسن. اكتب في سطرين منفصلين:
السطر الأول: عنوان SEO (60 حرف كحد أقصى)
السطر الثاني: وصف meta (155 حرف كحد أقصى)`;
    } else {
      systemPrompt = 'أنت كاتب محتوى مفيد. اكتب محتوى جذاب ومفيد باللغة العربية بناءً على طلب المستخدم. يجب أن يكون المحتوى باللغة العربية فقط.';
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser request: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: type === 'blog' ? 0.7 : 0.5,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: type === 'blog' ? 4096 : type === 'title' ? 100 : 300,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-blog-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});