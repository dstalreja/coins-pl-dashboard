import {
  LayoutDashboard,
  HelpCircle,
  PieChart,
  History,
  Settings as SettingsIcon
} from "lucide-react";

import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
    { icon: History, label: "Past Trades", page: "past-trades" },
    { icon: PieChart, label: "Analytics", page: "analytics" },
    { icon: SettingsIcon, label: "Settings", page: "settings" },
  ];

  return (
    <aside className="relative z-20 h-screen w-72 p-6 flex flex-col justify-between">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-r border-white/5" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Area */}
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full" />
            <img
              src={coinsLogo}
              alt="COINS Logo"
              className="w-10 h-10 rounded-full object-cover relative z-10 border border-white/10"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">COINS</h2>
            <p className="text-xs text-muted-foreground">P&L Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-primary/20"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        {/* User / Footer */}
        <button className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/5">
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Help & Support</span>
        </button>
      </div>
    </aside>
  );
}