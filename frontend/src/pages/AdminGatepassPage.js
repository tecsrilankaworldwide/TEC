import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Printer } from 'lucide-react';
import { getAdminHeaders } from './AdminLayout';

const AdminGatepassPage = () => {
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGatepasses();
  }, []);

  const fetchGatepasses = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/gatepass`, {
        headers: getAdminHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setGatepasses(data || []);
      }
    } catch (error) {
      console.error('Error fetching gatepasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (gatepassId) => {
    window.open(`/admin/gatepass/print/${gatepassId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'returned': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Gatepass</h1>
          <p className="text-sm text-muted-foreground mt-1">Authorize goods movement in/out of premises</p>
        </div>
        <Link to="/admin/gatepass/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Gatepass
          </Button>
        </Link>
      </div>

      {gatepasses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <p className="mb-4">No gatepasses created yet</p>
              <Link to="/admin/gatepass/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Gatepass
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {gatepasses.map((gp) => (
            <Card key={gp.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold">{gp.gatepass_number}</h3>
                      <Badge className={getStatusColor(gp.status)}>{gp.status}</Badge>
                      <Badge variant="outline" className="capitalize">{gp.movement_type}</Badge>
                      <Badge variant="outline">{gp.items?.length || 0} items</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p>Person: {gp.person_name}</p>
                        <p>Purpose: {gp.purpose}</p>
                      </div>
                      <div>
                        <p>Date: {new Date(gp.issue_date).toLocaleDateString()}</p>
                        <p>Valid Until: {new Date(gp.valid_until).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(gp.id)}>
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

export default AdminGatepassPage;