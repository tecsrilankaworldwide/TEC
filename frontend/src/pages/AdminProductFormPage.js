import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const AdminProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    brand_id: '',
    images: [''],
    regular_price: '',
    sale_price: '',
    discount_percent: '',
    stock: '',
    is_deal: false,
    is_new: false,
    specs: {},
  });

  useEffect(() => {
    fetchFilters();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchFilters = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch(`${backendUrl}/api/categories`),
        fetch(`${backendUrl}/api/brands`),
      ]);
      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          category_id: data.category_id || '',
          brand_id: data.brand_id || '',
          images: data.images || [''],
          regular_price: data.regular_price || '',
          sale_price: data.sale_price || '',
          discount_percent: data.discount_percent || '',
          stock: data.stock || '',
          is_deal: data.is_deal || false,
          is_new: data.is_new || false,
          specs: data.specs || {},
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `${backendUrl}/api/products/${id}` : `${backendUrl}/api/products`;

      // Clean up data
      const productData = {
        ...formData,
        regular_price: parseFloat(formData.regular_price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
        stock: parseInt(formData.stock),
        images: formData.images.filter((img) => img.trim() !== ''),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
        navigate('/admin/products');
      } else {
        toast.error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <div className="flex gap-2">
                    <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
                    <Button type="button" variant="outline" onClick={generateSlug}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                    />
                    {formData.images.length > 1 && (
                      <Button type="button" variant="outline" onClick={() => removeImageField(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addImageField} className="w-full">
                  Add Image URL
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand_id">Brand</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="regular_price">Regular Price *</Label>
                  <Input
                    id="regular_price"
                    name="regular_price"
                    type="number"
                    step="0.01"
                    value={formData.regular_price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale Price</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_percent">Discount %</Label>
                  <Input
                    id="discount_percent"
                    name="discount_percent"
                    type="number"
                    value={formData.discount_percent}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_deal"
                    name="is_deal"
                    checked={formData.is_deal}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_deal: checked })}
                  />
                  <Label htmlFor="is_deal" className="cursor-pointer">
                    Mark as Deal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_new"
                    name="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                  />
                  <Label htmlFor="is_new" className="cursor-pointer">
                    Mark as New
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;