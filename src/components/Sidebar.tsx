/**
 * ARINUSA EQUALIZER - Navigation Sidebar
 * Clean, Collapsible (Bisa Dibuka-Tutup), and Tidy Navigation
 * ARINUSA GROUP | ARIF GUNAWAN
 */

import React from 'react';
import { 
  Home, 
  Sliders, 
  Bookmark, 
  Wand2, 
  Speaker, 
  Settings, 
  Info, 
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  UserCheck
} from 'lucide-react';

export type NavTab = 'home' | 'equalizer' | 'presets' | 'effects' | 'devices' | 'settings' | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isActivated: boolean;
  registeredUser: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isActivated,
  registeredUser,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'equalizer', label: 'Equalizer', icon: Sliders },
    { id: 'presets', label: 'Preset', icon: Bookmark },
    { id: 'effects', label: 'Efek Audio', icon: Wand2 },
    { id: 'devices', label: 'Perangkat Audio', icon: Speaker },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
    { id: 'about', label: 'Tentang', icon: Info },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-18' : 'w-64'
      } bg-[#070D1A] border-r border-[#182744] flex flex-col justify-between shrink-0 select-none transition-all duration-300 ease-in-out`}
    >
      {/* Top Nav List & Collapse Toggle */}
      <div className="p-3 space-y-1">
        {/* Header strip with toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-2 mb-1`}>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Menu Utama
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-[#122240] transition-colors"
            title={isCollapsed ? 'Buka Menu Samping' : 'Tutup Menu Samping'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
              } rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.12)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0F1C34]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:scale-105'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Branding & Profile Section */}
      <div className="p-3 border-t border-[#182744] space-y-2">
        {/* ARINUSA GROUP Banner Card */}
        {isCollapsed ? (
          <div
            className="w-10 h-10 mx-auto rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 font-black text-sm shadow-sm"
            title="ARINUSA GROUP - Tools for Better Sound"
          >
            A
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#0F1B36] to-[#0A1224] border border-[#1F335C] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 font-black text-sm shrink-0">
              A
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white tracking-wide truncate">ARINUSA GROUP</span>
              <span className="text-[11px] text-slate-400 truncate">Tools for Better Sound</span>
            </div>
          </div>
        )}

        {/* User License Profile */}
        <button
          onClick={() => onSelectTab('about')}
          title={isCollapsed ? `${registeredUser} (Premium Aktif)` : undefined}
          className={`w-full ${
            isCollapsed ? 'p-2 justify-center' : 'p-2.5 justify-between'
          } rounded-xl bg-[#0B152B] hover:bg-[#122040] border border-[#1E3358] flex items-center transition-colors text-left`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 relative">
              AG
              {isCollapsed && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0B152B]" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">{registeredUser}</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-[10px] text-cyan-400 font-medium">Premium • Aktif</span>
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
        </button>
      </div>
    </aside>
  );
};
