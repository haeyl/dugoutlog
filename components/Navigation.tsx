"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, BarChart2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/add", label: "기록", icon: PlusCircle },
  { href: "/insights", label: "인사이트", icon: BarChart2 },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-separator safe-bottom shadow-[0_-1px_0_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto flex items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 px-5 rounded-2xl my-1.5 transition-all ${
                isActive ? "text-primary" : "text-label3"
              }`}
            >
              <Icon
                size={23}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all"
              />
              <span className={`text-[10px] tracking-tight ${isActive ? "font-bold" : "font-medium"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
