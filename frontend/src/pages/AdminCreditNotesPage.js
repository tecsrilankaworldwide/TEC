import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

const AdminCreditNotesPage = () => {
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCreditNotes();
  }, []);

  const fetchCreditNotes = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/credit-notes`);
      if (response.ok) {
        const data = await response.json();
        setCreditNotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching credit notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (cnId) => {
    window.open(`/admin/credit-notes/print/${cnId}`, '_blank');
  };

  const filteredNotes = creditNotes.filter((cn) =>
    cn.cn_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cn.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Credit Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage returns, refunds, and price adjustments</p>
        </div>
        <Link to="/admin/credit-notes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Credit Note
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by CN number or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No credit notes found</p>
            <Link to="/admin/credit-notes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Credit Note
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((cn) => (
            <Card key={cn.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{cn.cn_number}</h3>
                      <Badge variant="outline" className="capitalize">{cn.reason}</Badge>
                      <Badge className="bg-red-600">-${cn.credit_amount?.toFixed(2)}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p>Customer: {cn.customer_name}</p>
                        <p>Original Invoice: {cn.original_invoice_number}</p>
                      </div>
                      <div>
                        <p>Date: {new Date(cn.issue_date).toLocaleDateString()}</p>
                        <p>Status: <span className="capitalize font-medium">{cn.status}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(cn.id)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCreditNotesPage;