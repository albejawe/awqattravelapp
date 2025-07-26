import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import Papa from 'papaparse';

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  slug: string;
  status: 'draft' | 'published';
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  category_id?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  reading_time?: number;
  article_url?: string;
}

interface BlogImportExportProps {
  onImportComplete: () => void;
}

const BlogImportExport = ({ onImportComplete }: BlogImportExportProps) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: blogs, error } = await supabase
        .from('blogs')
        .select(`
          *,
          categories:category_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // تحضير البيانات للتصدير
      const exportData = blogs.map((blog: any) => ({
        العنوان: blog.title,
        المحتوى: blog.content,
        المقتطف: blog.excerpt,
        'الصورة المميزة': blog.featured_image || '',
        الرابط: blog.slug,
        الحالة: blog.status === 'published' ? 'منشور' : 'مسودة',
        الفئة: blog.categories?.name || '',
        'الكلمات المفتاحية': blog.tags ? blog.tags.join(', ') : '',
        'عنوان SEO': blog.meta_title || '',
        'وصف SEO': blog.meta_description || '',
        'وقت القراءة': blog.reading_time || '',
        'رابط المقال': blog.article_url || '',
        'تاريخ الإنشاء': new Date(blog.created_at).toLocaleDateString('ar-SA'),
        'تاريخ التحديث': new Date(blog.updated_at).toLocaleDateString('ar-SA'),
        'تاريخ النشر': blog.published_at ? new Date(blog.published_at).toLocaleDateString('ar-SA') : ''
      }));

      // إنشاء ملف CSV
      const csv = Papa.unparse(exportData, {
        header: true,
        encoding: 'utf-8'
      });

      // تحميل الملف
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `blog-articles-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${blogs.length} مقال`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير المقالات",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const articlesToImport = results.data.map((row: any) => {
              const generateSlug = (title: string) => {
                return title.toLowerCase()
                  .replace(/[^a-zA-Z0-9\s]/g, '')
                  .replace(/\s+/g, '-')
                  .trim() + '-' + Date.now();
              };

              return {
                title: row['العنوان'] || row.title || 'عنوان غير محدد',
                content: row['المحتوى'] || row.content || '',
                excerpt: row['المقتطف'] || row.excerpt || '',
                featured_image: row['الصورة المميزة'] || row.featured_image || null,
                slug: generateSlug(row['العنوان'] || row.title || 'article'),
                status: (row['الحالة'] === 'منشور' || row.status === 'published') ? 'published' : 'draft',
                author_id: user.user!.id,
                tags: row['الكلمات المفتاحية'] || row.tags ? 
                  (row['الكلمات المفتاحية'] || row.tags).split(',').map((tag: string) => tag.trim()) : [],
                meta_title: row['عنوان SEO'] || row.meta_title || '',
                meta_description: row['وصف SEO'] || row.meta_description || '',
                article_url: row['رابط المقال'] || row.article_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                published_at: (row['الحالة'] === 'منشور' || row.status === 'published') ? 
                  new Date().toISOString() : null
              };
            }).filter((article: any) => article.title && article.content);

            if (articlesToImport.length === 0) {
              toast({
                title: "لا توجد مقالات صالحة",
                description: "تأكد من أن الملف يحتوي على عمود 'العنوان' و 'المحتوى'",
                variant: "destructive",
              });
              return;
            }

            const { error } = await supabase
              .from('blogs')
              .insert(articlesToImport);

            if (error) throw error;

            toast({
              title: "تم الاستيراد بنجاح",
              description: `تم استيراد ${articlesToImport.length} مقال`,
            });

            onImportComplete();
          } catch (error) {
            console.error('Import processing error:', error);
            toast({
              title: "خطأ في معالجة الملف",
              description: "فشل في معالجة بيانات الاستيراد",
              variant: "destructive",
            });
          } finally {
            setImporting(false);
          }
        },
        error: (error) => {
          console.error('CSV parse error:', error);
          toast({
            title: "خطأ في قراءة الملف",
            description: "تأكد من أن الملف بصيغة CSV صحيحة",
            variant: "destructive",
          });
          setImporting(false);
        }
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: "فشل في استيراد المقالات",
        variant: "destructive",
      });
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          استيراد وتصدير المقالات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="import">استيراد من ملف CSV</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="import"
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={importing}
              className="flex-1"
            />
            <Button 
              disabled={importing}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? 'جاري الاستيراد...' : 'استيراد'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            يدعم ملفات CSV مع أعمدة: العنوان، المحتوى، المقتطف، الصورة المميزة، الحالة، الكلمات المفتاحية
          </p>
        </div>

        <div>
          <Label>تصدير جميع المقالات</Label>
          <div className="mt-2">
            <Button 
              onClick={handleExport}
              disabled={exporting}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'جاري التصدير...' : 'تصدير إلى CSV'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            سيتم تصدير جميع المقالات مع جميع البيانات الوصفية
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogImportExport;