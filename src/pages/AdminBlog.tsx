import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Wand2, Upload, Link, Save, Eye, Tag, Palette, Clock, Sparkles } from "lucide-react";
import { User } from "@supabase/supabase-js";
import RichTextEditor from "@/components/RichTextEditor";
import AdminCategories from "@/components/AdminCategories";
import BlogImportExport from "@/components/BlogImportExport";
import BlogBulkActions from "@/components/BlogBulkActions";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  category_url: string | null;
}

const AdminBlog = () => {
  const [user, setUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage, setBlogsPerPage] = useState(10);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [categoryId, setCategoryId] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Check admin role
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roleData) {
        navigate("/admin/login");
        return;
      }

      setUser(user);
      await Promise.all([loadBlogs(), loadCategories()]);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const loadBlogs = async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          color
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل المقالات",
        variant: "destructive",
      });
      return;
    }

    setBlogs((data || []) as Blog[]);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الفئات",
        variant: "destructive",
      });
      return;
    }

    setCategories((data || []) as Category[]);
  };

  const generateTitle = async () => {
    if (!excerpt.trim() && !content.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال موضوع المقال أو المحتوى أولاً",
        variant: "destructive",
      });
      return;
    }

    setGeneratingTitle(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: { 
          prompt: `اقترح عنوان جذاب ومحسن لمحركات البحث لمقال سفر عن: ${excerpt || content.substring(0, 200)}. العنوان يجب أن يكون قصير ومؤثر وباللغة العربية.`,
          type: 'title'
        }
      });

      if (error) throw error;

      setTitle(data.content.replace(/"/g, '').trim());
      
      toast({
        title: "تم توليد العنوان",
        description: "تم إنشاء عنوان محسن لمقالك",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في توليد العنوان",
        variant: "destructive",
      });
    } finally {
      setGeneratingTitle(false);
    }
  };

  const generateSEO = async () => {
    if (!title.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال العنوان أولاً",
        variant: "destructive",
      });
      return;
    }

    setGeneratingSEO(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: { 
          prompt: `اكتب عنوان SEO محسن ووصف meta مناسب لمحركات البحث (لا يتجاوز 160 حرف) لمقال سفر بعنوان: "${title}". يجب أن يكون محسن للبحث باللغة العربية ويحتوي على كلمات مفتاحية مهمة.`,
          type: 'seo'
        }
      });

      if (error) throw error;

      const content = data.content;
      // استخراج العنوان والوصف من المحتوى المولد
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      if (lines.length >= 2) {
        setMetaTitle(lines[0].replace(/^عنوان SEO:\s*/, '').trim());
        setMetaDescription(lines[1].replace(/^وصف meta:\s*/, '').trim());
      } else {
        setMetaTitle(title);
        setMetaDescription(content.substring(0, 160));
      }
      
      toast({
        title: "تم توليد بيانات SEO",
        description: "تم إنشاء عنوان ووصف محسن لمحركات البحث",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في توليد بيانات SEO",
        variant: "destructive",
      });
    } finally {
      setGeneratingSEO(false);
    }
  };

  const generateContent = async () => {
    if (!title.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال العنوان أولاً",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: { 
          prompt: `اكتب مقالة سفر شاملة ومفصلة باللغة العربية عن: ${title}. يجب أن تكون مقالة احترافية محسنة لمحركات البحث مع عناوين فرعية وقوائم ونصائح عملية.`,
          type: 'blog'
        }
      });

      if (error) throw error;

      setContent(data.content);
      
      // Auto-generate excerpt from content
      const textContent = data.content.replace(/<[^>]*>/g, '').trim();
      const firstSentences = textContent.split('.').slice(0, 2).join('.') + '.';
      setExcerpt(firstSentences.substring(0, 200) + (firstSentences.length > 200 ? '...' : ''));

      // Auto-generate meta title and description
      if (!metaTitle) {
        setMetaTitle(title);
      }
      if (!metaDescription) {
        setMetaDescription(firstSentences.substring(0, 160));
      }

      toast({
        title: "تم توليد المحتوى",
        description: "تم إضافة المحتوى المولد بالذكاء الاصطناعي إلى مقالتك",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في توليد المحتوى",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setFeaturedImage(data.publicUrl);

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة المميزة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveBlog = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "خطأ",
        description: "العنوان والمحتوى مطلوبان",
        variant: "destructive",
      });
      return;
    }

    try {
      const generateSlug = (title: string) => {
        return title.toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const blogData = {
        title,
        content,
        excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        featured_image: featuredImage || null,
        status,
        author_id: user?.id,
        slug: editingBlog ? editingBlog.slug : generateSlug(title),
        category_id: categoryId || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        article_url: articleUrl || null,
        ...(status === 'published' && { published_at: new Date().toISOString() })
      };

      let result;
      if (editingBlog) {
        result = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', editingBlog.id);
      } else {
        result = await supabase
          .from('blogs')
          .insert(blogData);
      }

      if (result.error) throw result.error;

      toast({
        title: "نجح الحفظ",
        description: `تم ${editingBlog ? 'تحديث' : 'إنشاء'} المقال بنجاح`,
      });

      resetForm();
      await loadBlogs();
    } catch (error) {
      toast({
        title: "خطأ",
        description: `فشل في ${editingBlog ? 'تحديث' : 'إنشاء'} المقال`,
        variant: "destructive",
      });
    }
  };

  const editBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setExcerpt(blog.excerpt || '');
    setFeaturedImage(blog.featured_image || '');
    setStatus(blog.status);
    setCategoryId(blog.category_id || '');
    setTags(blog.tags ? blog.tags.join(', ') : '');
    setMetaTitle(blog.meta_title || '');
    setMetaDescription(blog.meta_description || '');
    setArticleUrl(blog.article_url || '');
    setIsCreating(true);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المقال",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم الحذف",
      description: "تم حذف المقال بنجاح",
    });
    await loadBlogs();
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setFeaturedImage("");
    setStatus('draft');
    setCategoryId("");
    setTags("");
    setMetaTitle("");
    setMetaDescription("");
    setArticleUrl("");
    setIsCreating(false);
    setEditingBlog(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate("/admin")} 
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للوحة الإدارة
            </Button>
            <h1 className="text-2xl font-bold">إدارة المدونة</h1>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              إنشاء مقال جديد
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-6">
        {isCreating ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {editingBlog ? 'تحرير المقال' : 'إنشاء مقال جديد'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">المحتوى</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="categories">الفئات</TabsTrigger>
                  <TabsTrigger value="manage">إدارة المقالات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-6">
                  <div>
                    <Label htmlFor="title">العنوان</Label>
                    <div className="flex gap-2">
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="أدخل عنوان المقال..."
                      />
                      <Button 
                        onClick={generateTitle}
                        disabled={generatingTitle}
                        variant="outline"
                        size="sm"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {generatingTitle ? 'جاري التوليد...' : 'توليد العنوان'}
                      </Button>
                      <Button 
                        onClick={generateContent}
                        disabled={generating || !title.trim()}
                        variant="outline"
                        size="sm"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generating ? 'جاري التوليد...' : 'توليد المحتوى'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">الفئة</Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر فئة..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">الحالة</Label>
                      <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">مسودة</SelectItem>
                          <SelectItem value="published">منشور</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">المقدمة</Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="وصف مختصر للمقال..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">الكلمات المفتاحية</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="سفر، سياحة، رحلات (مفصولة بفواصل)"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      فصل الكلمات المفتاحية بفواصل
                    </div>
                  </div>

                  <div>
                    <Label>الصورة المميزة</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={featuredImage}
                          onChange={(e) => setFeaturedImage(e.target.value)}
                          placeholder="رابط الصورة أو ارفع أدناه..."
                        />
                        <Button variant="outline" size="sm">
                          <Link className="w-4 h-4 mr-2" />
                          رابط
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" disabled={uploading}>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'جاري الرفع...' : 'رفع'}
                        </Button>
                      </div>
                      {featuredImage && (
                        <img 
                          src={featuredImage} 
                          alt="صورة مميزة" 
                          className="w-32 h-20 object-cover rounded border"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">المحتوى</Label>
                    <RichTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="اكتب محتوى مقالك هنا..."
                      height="500px"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">تحسين محركات البحث (SEO)</h3>
                    <Button 
                      onClick={generateSEO}
                      disabled={generatingSEO || !title.trim()}
                      variant="outline"
                      size="sm"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {generatingSEO ? 'جاري التوليد...' : 'توليد بيانات SEO'}
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="meta-title">عنوان SEO</Label>
                    <Input
                      id="meta-title"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="عنوان محسن لمحركات البحث..."
                      maxLength={60}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {metaTitle.length}/60 حرف
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta-description">وصف SEO</Label>
                    <Textarea
                      id="meta-description"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="وصف محسن لمحركات البحث..."
                      rows={3}
                      maxLength={160}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {metaDescription.length}/160 حرف
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="article-url">رابط المقال (اختياري)</Label>
                    <Input
                      id="article-url"
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      type="url"
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">معاينة في نتائج البحث:</h4>
                    <div className="space-y-1">
                      <div className="text-blue-600 text-lg">{metaTitle || title || "عنوان المقال"}</div>
                      <div className="text-green-600 text-sm">yoursite.com/blog/{title ? title.toLowerCase().replace(/\s+/g, '-') : 'article-slug'}</div>
                      <div className="text-gray-600 text-sm">{metaDescription || excerpt || "وصف المقال"}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="categories">
                  <AdminCategories />
                </TabsContent>

                <TabsContent value="manage" className="space-y-6">
                  <BlogImportExport onImportComplete={loadBlogs} />
                  <BlogBulkActions 
                    blogs={blogs}
                    selectedBlogs={selectedBlogs}
                    onSelectionChange={setSelectedBlogs}
                    onBlogsUpdate={loadBlogs}
                    currentPage={currentPage}
                    blogsPerPage={blogsPerPage}
                    onPageChange={setCurrentPage}
                    onBlogsPerPageChange={setBlogsPerPage}
                  />
                </TabsContent>

                <div className="flex gap-2 mt-6">
                  <Button onClick={saveBlog}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingBlog ? 'تحديث المقال' : 'حفظ المقال'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    إلغاء
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {blogs.map((blog) => (
              <Card key={blog.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{blog.title}</h3>
                        {blog.reading_time && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {blog.reading_time} دقائق
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{blog.excerpt}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {(blog as any).categories && (
                          <Badge style={{ backgroundColor: (blog as any).categories.color + '20', color: (blog as any).categories.color }}>
                            <Tag className="w-3 h-3 mr-1" />
                            {(blog as any).categories.name}
                          </Badge>
                        )}
                        {blog.tags && blog.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>الحالة: {blog.status === 'published' ? 'منشور' : 'مسودة'}</span>
                        <span>آخر تحديث: {new Date(blog.updated_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    {blog.featured_image && (
                      <img 
                        src={blog.featured_image} 
                        alt={blog.title}
                        className="w-24 h-16 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => editBlog(blog)} variant="outline" size="sm">
                      تحرير
                    </Button>
                    <Button 
                      onClick={() => deleteBlog(blog.id)} 
                      variant="outline" 
                      size="sm"
                    >
                      حذف
                    </Button>
                    {blog.status === 'published' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        عرض
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {blogs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">لم يتم إنشاء مقالات بعد. أنشئ مقالك الأول!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBlog;