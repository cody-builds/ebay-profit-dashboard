'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Calculator, Home, RefreshCw, Zap } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/opportunities', label: 'Deals', icon: TrendingUp },
    { href: '/calculator', label: 'Calculator', icon: Calculator },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              Deal<span className="text-green-400">Flow</span>
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  pathname === href
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Refresh Button */}
          <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <nav className="md:hidden flex border-t border-gray-800">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              pathname === href
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
