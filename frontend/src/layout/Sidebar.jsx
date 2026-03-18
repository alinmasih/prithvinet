import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Factory, 
  Activity, 
  FileWarning, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  LogOut,
  X,
  ChevronDown,
  Globe,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/client';


const Sidebar = ({ isOpen, close }) => {
  const { user, logout, isAdmin, isRegionalOfficer, isMonitoringTeam, isIndustryUser } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState(['Reports']);
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await api.get('/public/offices');
        setOffices(res.data);
      } catch (error) {
        console.error('Failed to fetch offices:', error);
      }
    };
    fetchOffices();
  }, []);

  const toggleMenu = (name) => {
    setExpandedMenus(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const navItems = [
    { 
      name: 'Regional Office', 
      icon: Map, 
      path: '/regional', 
      show: isAdmin || isRegionalOfficer
    },
    { name: 'Field Entry', icon: Activity, path: '/monitoring', show: isMonitoringTeam },
    { name: 'Corporate Grid', icon: Factory, path: '/industry', show: false },
    { name: 'Upload Report', icon: FileText, path: '/upload-report', show: isIndustryUser },
    { name: 'Industries', icon: Factory, path: '/industries', show: isAdmin || isRegionalOfficer },
    { 
      name: 'Alerts', 
      icon: FileWarning, 
      path: '/alerts', 
      show: (isAdmin || isRegionalOfficer),
      subItems: [
        { name: 'System Alerts', path: '/alerts' },
        { name: 'Citizen Complaint', path: '/alerts?type=citizen' }
      ]
    },
    { 
      name: 'Reports', 
      icon: FileText, 
      path: '/reports', 
      show: isAdmin || isRegionalOfficer || isMonitoringTeam,
      subItems: [
        { name: 'Industry Report', path: '/reports/industry' },
        { name: 'IoT Data', path: '/reports/iot' }
      ]
    },
    { name: 'AI Copilot', icon: Cpu, path: '/ai-copilot', show: isAdmin || isRegionalOfficer },
    { name: 'User Management', icon: Users, path: '/users', show: isAdmin || isRegionalOfficer },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={close}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 w-64 h-screen glass-morphism z-50 flex flex-col p-4 border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>

        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">PrithviNet</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">CECB Monitoring</p>
            </div>

          </div>
          <button 
            onClick={close}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar no-scrollbar">
          {navItems.filter(item => item.show).map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <div className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-text-muted hover:bg-white/5 hover:text-white`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {expandedMenus.includes(item.name) ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
                  </button>
                  
                  {expandedMenus.includes(item.name) && (
                    <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {item.subItems.map(sub => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={() => {
                            if (window.innerWidth < 1024) close();
                          }}
                          className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                              isActive ? 'text-primary' : 'text-text-muted hover:text-white'
                            }`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) close();
                  }}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                        : 'text-text-muted hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold uppercase shadow-lg shadow-secondary/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-[10px] text-text-muted truncate uppercase tracking-wider font-bold">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
