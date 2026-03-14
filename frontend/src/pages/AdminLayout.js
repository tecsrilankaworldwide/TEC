import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Package, ShoppingBag, LogOut, LayoutDashboard, Tags, Layers, FileText, Truck, Archive } from 'lucide-react';
import { Cpu } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_auth');
    if (isAdmin !== 'true') {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/invoices', icon: FileText, label: 'Invoices' },
    { path: '/admin/grn', icon: Truck, label: 'GRN' },
    { path: '/admin/gtn', icon: Archive, label: 'GTN' },
    { path: '/admin/credit-notes', icon: FileText, label: 'Credit Notes' },
    { path: '/admin/gatepass', icon: FileText, label: 'Gatepass' },
    { path: '/admin/categories', icon: Layers, label: 'Categories' },
    { path: '/admin/brands', icon: Tags, label: 'Brands' },
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-heading text-lg font-bold tracking-tight">
                <span className="text-primary">TW TECH</span> <span className="text-muted-foreground">Admin</span>
              </div>
              <div className="text-[8px] tracking-[0.2em] text-muted-foreground font-medium -mt-0.5">
                MANAGEMENT PORTAL
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                View Store
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background border-r min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;