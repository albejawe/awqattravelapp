import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  category_url: string | null;
  created_at: string;
  updated_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [categoryUrl, setCategoryUrl] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

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
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const saveCategory = async () => {
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "اسم الفئة مطلوب",
        variant: "destructive",
      });
      return;
    }

    try {
      const categoryData = {
        name,
        description: description || null,
        color,
        category_url: categoryUrl || null,
        slug: editingCategory ? editingCategory.slug : generateSlug(name),
      };

      let result;
      if (editingCategory) {
        result = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
      } else {
        result = await supabase
          .from('categories')
          .insert(categoryData);
      }

      if (result.error) throw result.error;

      toast({
        title: "نجح الحفظ",
        description: `تم ${editingCategory ? 'تحديث' : 'إنشاء'} الفئة بنجاح`,
      });

      resetForm();
      await loadCategories();
    } catch (error) {
      toast({
        title: "خطأ",
        description: `فشل في ${editingCategory ? 'تحديث' : 'إنشاء'} الفئة`,
        variant: "destructive",
      });
    }
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setColor(category.color);
    setCategoryUrl(category.category_url || '');
    setIsCreating(true);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الفئة",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم الحذف",
      description: "تم حذف الفئة بنجاح",
    });
    await loadCategories();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#6366f1");
    setCategoryUrl("");
    setIsCreating(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الفئات</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة فئة جديدة
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'تحرير الفئة' : 'إضافة فئة جديدة'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">اسم الفئة</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم الفئة..."
              />
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للفئة..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="color">اللون</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <div className="text-sm text-muted-foreground">{color}</div>
              </div>
            </div>

            <div>
              <Label htmlFor="categoryUrl">رابط الفئة (اختياري)</Label>
              <Input
                id="categoryUrl"
                value={categoryUrl}
                onChange={(e) => setCategoryUrl(e.target.value)}
                placeholder="https://example.com/category"
                type="url"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveCategory}>
                {editingCategory ? 'تحديث الفئة' : 'حفظ الفئة'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                  </div>
                  {category.description && (
                    <p className="text-muted-foreground mb-2">{category.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>الرابط: {category.slug}</div>
                    {category.category_url && (
                      <div>
                        رابط خارجي: 
                        <a 
                          href={category.category_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline mr-1"
                        >
                          {category.category_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => editCategory(category)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => deleteCategory(category.id)} 
                    variant="outline" 
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">لم يتم إنشاء فئات بعد. أنشئ فئتك الأولى!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;