import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

const AdminGRNPage = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGRNs();
  }, []);

  const fetchGRNs = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/grn`);
      if (response.ok) {
        const data = await response.json();
        setGrns(data || []);
      }
    } catch (error) {
      console.error('Error fetching GRNs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (grnId) => {
    window.open(`/admin/grn/print/${grnId}`, '_blank');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">GRN - Goods Received Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">Track inventory received from suppliers</p>
        </div>
        <Link to="/admin/grn/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New GRN
          </Button>
        </Link>
      </div>

      {grns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <p className="mb-4">No GRNs created yet</p>
              <Link to="/admin/grn/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First GRN
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grns.map((grn) => (
            <Card key={grn.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{grn.grn_number}</h3>
                      <Badge>{grn.supplier_name}</Badge>
                      <Badge variant="outline">{grn.items?.length || 0} items</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Date: {new Date(grn.received_date).toLocaleDateString()}</p>
                      <p>Total Value: ${grn.total_value?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(grn.id)}>
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

export default AdminGRNPage;