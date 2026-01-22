'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FlaskConical, Package, ShoppingCart, Users2,
  Wallet, Factory, UserCog, LogOut, Menu, ChevronDown,
  Wrench, Zap, UserCircle, Settings2
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

interface SubMenuItem {
  title: string;
  path: string;
  perm?: string;
}

interface MenuItem {
  name: string;
  icon: any;
  color: string;
  sub?: SubMenuItem[];
  path?: string;
  perm?: string;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onNavigate?: (path: string) => boolean;
}

export default function Sidebar({ isOpen, setIsOpen, onNavigate }: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'identifying...'
  });

  const pathname = usePathname();
  const router = useRouter();

  const menuGroups: MenuGroup[] = [
    {
      group: 'Main Menu',
      items: [
        {
          name: 'Formulation',
          icon: FlaskConical,
          color: 'text-cyan-400',
          sub: [
            { title: 'Formula', path: '/formula' },
            { title: 'R&D Schedule', path: '#' },
            { title: 'Request Form', path: '#' }
          ]
        },
        {
          name: 'Materials',
          icon: Package,
          color: 'text-amber-400',
          sub: [
            { title: 'Raw Materials', path: '/raw_materials' },
            { title: 'Packaging', path: '/packaging' }
          ]    
        },
      ]
    },
    {
      group: 'Portfolio Tools',
      items: [
        {
          name: 'App Gallery',
          icon: Wrench,
          color: 'text-indigo-400',
          sub: [
            { title: 'Unit Converter', path: '/unit_converter' },
            { title: 'Lab Calculator', path: '/lab_calculator' },
            { title: 'Batch Scaler', path: '/batch_scaler' }
          ]
        },
        {
          name: 'Experimental',
          icon: Zap,
          color: 'text-yellow-400',
          sub: [
            { title: 'AI Assistant', path: '/ai_assistant' },
            { title: 'Quick Labels', path: '/quick_labels' }
          ]
        },
      ]
    },
    {
      group: 'Administration',
      items: [
        {
          name: 'Admin',
          icon: UserCog,
          color: 'text-slate-300',
          sub: [
            { title: 'Users', path: '/users', perm: 'view_user' },
            { title: 'Roles', path: '/roles', perm: 'view_group' },
            { title: 'Activity Log', path: '#', perm: 'view_logentry' }
          ]
        },
        {
          name: 'Setup',
          icon: Settings2,
          color: 'text-emerald-500',
          path: '/setup',
          perm: 'view_category'
        }
      ]
    }
  ];

  const hasPermission = useCallback((permCode?: string) => {
    if (isAdmin) return true;
    if (!permCode) return true; 
    return userPermissions.includes(permCode);
  }, [isAdmin, userPermissions]);

  useEffect(() => {
    if (!isLoaded) return;
    let requiredPerm: string | undefined = undefined;
    let isProtectedRoute = false;

    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.path === pathname) {
          isProtectedRoute = true;
          requiredPerm = item.perm;
        }
        item.sub?.forEach(sub => {
          if (sub.path === pathname) {
            isProtectedRoute = true;
            requiredPerm = sub.perm;
          }
        });
      });
    });

    if (isProtectedRoute && !hasPermission(requiredPerm)) {
      router.push('/403');
    }
  }, [pathname, isLoaded, hasPermission, router, menuGroups]);

  const fetchUserInfo = useCallback(async () => {
    try {
      // Switched to centralized apiRequest wrapper
      const data = await apiRequest<any>('/api/auth/user-info/');
      
      setIsAdmin(data.is_superuser);
      setUserPermissions(data.permissions);
      setUserData({ 
        name: data.username, 
        email: typeof window !== 'undefined' ? localStorage.getItem('email') || 'User' : 'User' 
      });
    } catch (err) {
      console.error("Permission sync failed:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => { fetchUserInfo(); }, [fetchUserInfo]);

  const toggleSubmenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    if (onNavigate && !onNavigate(path)) {
      e.preventDefault();
      return;
    }
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const handleLogout = (e: React.MouseEvent) => {
    if (onNavigate && !onNavigate('/login')) { e.preventDefault(); return; }
    localStorage.clear();
    document.cookie = "token=; path=/; Max-Age=0; SameSite=Lax;";
    if (window.innerWidth < 1024) setIsOpen(false);
    router.push('/login');
    router.refresh(); 
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 bg-[#111827] text-slate-400
        transition-all duration-300 ease-in-out flex flex-col border-r border-white/5 overflow-hidden
        ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="p-6 border-b border-white/5 min-w-[288px] bg-slate-900/20 relative">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 mt-2">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                <UserCircle className="text-blue-400 w-7 h-7" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#111827] rounded-full shadow-lg"></div>
            </div>
            <div className="flex flex-col min-w-0 pr-6">
              <span className="text-sm font-bold text-white truncate leading-tight tracking-tight">{userData.name}</span>
              <span className="text-[11px] text-blue-400/70 truncate font-medium mt-0.5 hover:text-blue-400 transition-colors cursor-default">{userData.email}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 min-w-[288px]">
          <Link href="/dashboard" onClick={(e) => handleNavigation(e, '/dashboard')}
            className={`flex items-center px-4 py-3 rounded-xl transition-all group mx-2 ${pathname === '/dashboard' ? 'text-white bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-white/5'}`}>
            <LayoutDashboard className={`w-5 h-5 mr-3 ${pathname === '/dashboard' ? 'text-white' : 'text-blue-500'}`} />
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>

          {menuGroups.map((group) => {
            const visibleItems = group.items.filter(item => 
              (item.sub && item.sub.some(sub => hasPermission(sub.perm))) || (!item.sub && hasPermission(item.perm))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{group.group}</p>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <div key={item.name} className="px-2">
                      {item.sub ? (
                        <>
                          <button onClick={() => toggleSubmenu(item.name)}
                            className={`flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/5 hover:text-white rounded-xl transition-all group ${activeMenu === item.name ? 'bg-white/5 text-white' : ''}`}>
                            <div className="flex items-center">
                              <item.icon className={`w-5 h-5 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
                              <span className="font-medium text-sm">{item.name}</span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform opacity-40 ${activeMenu === item.name ? 'rotate-180' : ''}`} />
                          </button>
                          {activeMenu === item.name && (
                            <div className="ml-9 mt-1 space-y-1 border-l border-white/10 pl-4">
                              {item.sub.map(sub => (
                                hasPermission(sub.perm) && (
                                  <Link key={sub.title} href={sub.path} onClick={(e) => handleNavigation(e, sub.path)}
                                    className={`block py-2 text-xs transition-colors ${pathname === sub.path ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-blue-400'}`}>
                                    {sub.title}
                                  </Link>
                                )
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link href={item.path || '#'} onClick={(e) => handleNavigation(e, item.path || '#')}
                          className={`flex items-center px-4 py-2.5 rounded-xl transition-all group ${pathname === item.path ? 'bg-white/5 text-white' : 'hover:bg-white/5'}`}>
                          <item.icon className={`w-5 h-5 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
                          <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#0f172a] min-w-[288px]">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group">
            <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}