import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminGTNFormPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    transfer_date: new Date().toISOString().split('T')[0],
    transferred_by: '',
    received_by: '',
    status: 'pending',
    notes: '',
    items: [
      { product_name: '', quantity: '', condition: 'good' }
    ]
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_name: '', quantity: '', condition: 'good' }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/gtn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('GTN created successfully');
        navigate('/admin/gtn');
      } else {
        toast.error('Failed to create GTN');
      }
    } catch (error) {
      console.error('Error creating GTN:', error);
      toast.error('Failed to create GTN');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Create Goods Transfer Note</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from_location">From Location *</Label>
                    <Input
                      id="from_location"
                      name="from_location"
                      value={formData.from_location}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Warehouse"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="to_location">To Location *</Label>
                    <Input
                      id="to_location"
                      name="to_location"
                      value={formData.to_location}
                      onChange={handleInputChange}
                      placeholder="e.g., Colombo Branch"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="transfer_date">Transfer Date *</Label>
                    <Input
                      id="transfer_date"
                      name="transfer_date"
                      type="date"
                      value={formData.transfer_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="transferred_by">Transferred By</Label>
                    <Input
                      id="transferred_by"
                      name="transferred_by"
                      value={formData.transferred_by}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="received_by">Received By</Label>
                    <Input
                      id="received_by"
                      name="received_by"
                      value={formData.received_by}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Items to Transfer</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <Label>Product Name</Label>
                        <Input
                          value={item.product_name}
                          onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <Label>Condition</Label>
                        <Select
                          value={item.condition}
                          onValueChange={(value) => handleItemChange(index, 'condition', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                            <SelectItem value="defective">Defective</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Items:</span>
                    <span className="font-medium">{formData.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Quantity:</span>
                    <span className="font-medium">
                      {formData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Status:</span>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Additional notes or special instructions..."
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create GTN'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/gtn')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminGTNFormPage;