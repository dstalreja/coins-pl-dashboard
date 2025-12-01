import { 
  LayoutDashboard, 
  PlusCircle, 
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
    { icon: PieChart, label: "Portfolio Analytics", page: "analytics" },
    { icon: SettingsIcon, label: "Settings", page: "settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800">
      <div className="p-8">
        
        <div className="flex items-center gap-3 mb-12">
          <img 
            src={coinsLogo}
            alt="COINS Club Logo"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="text-xl tracking-tight dark:text-white">COINS</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.page
                  ? "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </aside>
  );
}