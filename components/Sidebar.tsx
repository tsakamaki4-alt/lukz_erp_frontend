'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FlaskConical, Package, ShoppingCart, Users2,
  Wallet, Factory, UserCog, LogOut, Menu, ChevronDown,
  Wrench, Zap, UserCircle
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'identifying...'
  });

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const adminStatus = localStorage.getItem('is_staff') === 'true';
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    
    setIsAdmin(adminStatus);
    
    if (storedUsername && storedEmail) {
      setUserData({
        name: storedUsername,
        email: storedEmail
      });
    }
  }, []);

  const toggleSubmenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    // 1. Clear sensitive data from local storage
    localStorage.clear();
    
    // 2. Clear the cookie 
    // We set Max-Age to 0 to tell the browser to delete it immediately
    document.cookie = "token=; path=/; Max-Age=0; SameSite=Lax;";

    // 3. Close mobile sidebar if open
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }

    // 4. Redirect to login
    // We use push + refresh to trigger the Middleware logic immediately
    router.push('/login');
    router.refresh(); 
  };

  const menuGroups = [
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
            { title: 'Raw Materials', path: '#' },
            { title: 'Packaging', path: '#' }
          ]    
        },
        { name: 'Sales', icon: ShoppingCart, color: 'text-emerald-400', sub: [{title: 'Sales Orders', path: '#'}, {title: 'Products', path: '#'}, {title: 'Accounts', path: '#'}] },
        { name: 'CRM', icon: Users2, color: 'text-pink-400', sub: [{title: 'Contacts', path: '#'}] },
        { name: 'Purchasing', icon: Wallet, color: 'text-purple-400', sub: [{title: 'Purchase Orders', path: '#'}] },
        { name: 'Manufacturing', icon: Factory, color: 'text-blue-400', sub: [{title: 'Manufacture Orders', path: '#'}] },
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
            { title: 'Users', path: '/users' },
            { title: 'Permissions', path: '#' },
            { title: 'Activity Log', path: '#' }
          ]
        },
      ]
    }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 bg-[#111827] text-slate-400
        transition-all duration-300 ease-in-out flex flex-col border-r border-white/5 overflow-hidden
        ${isOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'}
      `}>
        
        {/* HEADER AREA */}
        <div className="p-6 border-b border-white/5 min-w-[288px] bg-slate-900/20 relative">
          
          {/* HAMBURGER BUTTON - Visible on Desktop & Mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
            title="Toggle Sidebar"
          >
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
              <span className="text-sm font-bold text-white truncate leading-tight tracking-tight">
                {userData.name}
              </span>
              <span className="text-[11px] text-blue-400/70 truncate font-medium mt-0.5 hover:text-blue-400 transition-colors cursor-default">
                {userData.email}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 min-w-[288px]">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className={`flex items-center px-4 py-3 rounded-xl transition-all group mx-2 ${pathname === '/dashboard' ? 'text-white bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-white/5'}`}
          >
            <LayoutDashboard className={`w-5 h-5 mr-3 ${pathname === '/dashboard' ? 'text-white' : 'text-blue-500'}`} />
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>

          {menuGroups.map((group) => {
            if (group.group === 'Administration' && !isAdmin) return null;

            return (
              <div key={group.group}>
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <div key={item.name} className="px-2">
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/5 hover:text-white rounded-xl transition-all group ${activeMenu === item.name ? 'bg-white/5 text-white' : ''}`}
                      >
                        <div className="flex items-center">
                          <item.icon className={`w-5 h-5 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform opacity-40 ${activeMenu === item.name ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {activeMenu === item.name && (
                        <div className="ml-9 mt-1 space-y-1 border-l border-white/10 pl-4">
                          {item.sub.map(sub => (
                            <Link
                              key={sub.title}
                              href={sub.path}
                              onClick={handleLinkClick}
                              className={`block py-2 text-xs transition-colors ${pathname === sub.path ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-blue-400'}`}
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#0f172a] min-w-[288px]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}