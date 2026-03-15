import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Printer } from 'lucide-react';
import { getAdminHeaders } from './AdminLayout';

const AdminGTNPage = () => {
  const [gtns, setGtns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGTNs();
  }, []);

  const fetchGTNs = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/gtn`, {
        headers: getAdminHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setGtns(data || []);
      }
    } catch (error) {
      console.error('Error fetching GTNs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (gtnId) => {
    window.open(`/admin/gtn/print/${gtnId}`, '_blank');
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
          <h1 className="text-3xl font-semibold">GTN - Goods Transfer Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">Track inventory transfers between locations</p>
        </div>
        <Link to="/admin/gtn/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New GTN
          </Button>
        </Link>
      </div>

      {gtns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <p className="mb-4">No GTNs created yet</p>
              <Link to="/admin/gtn/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First GTN
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {gtns.map((gtn) => (
            <Card key={gtn.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{gtn.gtn_number}</h3>
                      <Badge>{gtn.from_location} → {gtn.to_location}</Badge>
                      <Badge variant="outline">{gtn.items?.length || 0} items</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Transfer Date: {new Date(gtn.transfer_date).toLocaleDateString()}</p>
                      <p>Status: {gtn.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(gtn.id)}>
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

export default AdminGTNPage;