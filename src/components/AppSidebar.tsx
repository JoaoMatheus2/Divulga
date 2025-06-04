import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Home,
  Package,
  FileText,
  DollarSign,
  User,
  Music
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'video_manager', 'financial'] },
    { name: 'Pacotes', href: '/packages', icon: Package, roles: ['admin', 'video_manager'] },
    { name: 'Posts', href: '/posts', icon: FileText, roles: ['admin', 'video_manager'] },
    { name: 'Clientes', href: '/clients', icon: User, roles: ['admin', 'video_manager', 'financial'] },
    { name: 'Financeiro', href: '/financial', icon: DollarSign, roles: ['admin', 'financial'] },
  ];

  const visibleItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity p-2">
          <Music className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">TEM HIT</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {user && (
          <div className="p-2 text-sm text-gray-600">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs">{user.email}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
