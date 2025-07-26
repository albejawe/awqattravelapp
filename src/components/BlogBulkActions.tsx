import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trash2, Download, Eye, EyeOff, Settings } from "lucide-react";
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
  categories?: { name: string; color: string };
}

interface BlogBulkActionsProps {
  blogs: Blog[];
  selectedBlogs: string[];
  onSelectionChange: (blogIds: string[]) => void;
  onBlogsUpdate: () => void;
  currentPage: number;
  blogsPerPage: number;
  onPageChange: (page: number) => void;
  onBlogsPerPageChange: (count: number) => void;
}

const BlogBulkActions = ({ 
  blogs, 
  selectedBlogs, 
  onSelectionChange, 
  onBlogsUpdate,
  currentPage,
  blogsPerPage,
  onPageChange,
  onBlogsPerPageChange
}: BlogBulkActionsProps) => {
  const [loading, setLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleBlogIds = blogs
        .slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage)
        .map(blog => blog.id);
      onSelectionChange(visibleBlogIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectBlog = (blogId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedBlogs, blogId]);
    } else {
      onSelectionChange(selectedBlogs.filter(id => id !== blogId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBlogs.length === 0) {
      toast({
        title: "تحذير",
        description: "لم يتم اختيار أي مقالات",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedBlogs.length} مقال؟`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .in('id', selectedBlogs);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: `تم حذف ${selectedBlogs.length} مقال بنجاح`,
      });

      onSelectionChange([]);
      onBlogsUpdate();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المقالات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: 'draft' | 'published') => {
    if (selectedBlogs.length === 0) {
      toast({
        title: "تحذير",
        description: "لم يتم اختيار أي مقالات",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blogs')
        .update(updateData)
        .in('id', selectedBlogs);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة ${selectedBlogs.length} مقال إلى ${newStatus === 'published' ? 'منشور' : 'مسودة'}`,
      });

      onSelectionChange([]);
      onBlogsUpdate();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المقالات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelected = async () => {
    if (selectedBlogs.length === 0) {
      toast({
        title: "تحذير",
        description: "لم يتم اختيار أي مقالات",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedBlogsData = blogs.filter(blog => selectedBlogs.includes(blog.id));
      
      const exportData = selectedBlogsData.map((blog) => ({
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

      const csv = Papa.unparse(exportData, {
        header: true,
        encoding: 'utf-8'
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `selected-articles-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "تم التصدير",
        description: `تم تصدير ${selectedBlogs.length} مقال`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تصدير المقالات المحددة",
        variant: "destructive",
      });
    }
  };

  const visibleBlogs = blogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const allVisibleSelected = visibleBlogs.length > 0 && visibleBlogs.every(blog => selectedBlogs.includes(blog.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>إدارة المقالات</span>
            {selectedBlogs.length > 0 && (
              <span className="text-sm text-muted-foreground">
                تم اختيار {selectedBlogs.length} مقال
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">عرض:</span>
            <Select value={blogsPerPage.toString()} onValueChange={(value) => onBlogsPerPageChange(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">مقال</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bulk Actions */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={allVisibleSelected}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              تحديد الكل في الصفحة الحالية
            </label>
          </div>
          
          {selectedBlogs.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleBulkStatusChange('published')}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                نشر المحدد
              </Button>
              <Button
                onClick={() => handleBulkStatusChange('draft')}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                إلغاء نشر المحدد
              </Button>
              <Button
                onClick={handleExportSelected}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                تصدير المحدد
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={loading}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                حذف المحدد
              </Button>
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="space-y-3">
          {visibleBlogs.map((blog) => (
            <div key={blog.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
              <Checkbox
                checked={selectedBlogs.includes(blog.id)}
                onCheckedChange={(checked) => handleSelectBlog(blog.id, checked as boolean)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{blog.title}</h3>
                  {blog.categories && (
                    <span 
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: blog.categories.color }}
                    >
                      {blog.categories.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className={blog.status === 'published' ? 'text-green-600' : 'text-orange-600'}>
                    {blog.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                  <span>{new Date(blog.updated_at).toLocaleDateString('ar-SA')}</span>
                  {blog.reading_time && <span>{blog.reading_time} دقيقة قراءة</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              السابق
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              التالي
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          عرض {((currentPage - 1) * blogsPerPage) + 1} إلى {Math.min(currentPage * blogsPerPage, blogs.length)} من {blogs.length} مقال
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogBulkActions;