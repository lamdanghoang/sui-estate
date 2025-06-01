import { Map, Home, Store } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { CustomBtn } from "../wallet/ConnectButton";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { label: "Explore", path: "/", icon: Map },
    { label: "Marketplace", path: "/marketplace", icon: Store },
    { label: "My Properties", path: "/properties", icon: Home },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-web3-purple-dark/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <Map className="w-10 h-10 text-white" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white">RealEstate</h1>
            <p className="text-xs text-gray-400">
              Blockchain DEX for RealEstate
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-web3-purple text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Connect button */}
        <div className="hidden md:block">
          <CustomBtn />
        </div>
      </div>
    </header>
  );
};

export default Header;
