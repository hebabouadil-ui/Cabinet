"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays,
  CalendarRange,
  FileText,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CLINIC_NAME } from "@/lib/constants";

const allLinks = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, roles: ["ADMIN"] },
  {
    href: "/admin/appointments",
    label: "Rendez-vous",
    icon: CalendarDays,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  {
    href: "/admin/calendar",
    label: "Agenda & horaires",
    icon: CalendarRange,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/patients",
    label: "Patients",
    icon: Users,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
  { href: "/admin/services", label: "Soins", icon: Stethoscope, roles: ["ADMIN"] },
  { href: "/admin/content", label: "Contenu", icon: FileText, roles: ["ADMIN"] },
  { href: "/admin/media", label: "Médias", icon: ImageIcon, roles: ["ADMIN"] },
  { href: "/admin/settings", label: "Paramètres", icon: Settings, roles: ["ADMIN"] },
];

export function AdminSidebar({
  role,
  userName,
}: {
  role: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = allLinks.filter((l) => l.roles.includes(role));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Navigation admin">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary-700 text-white"
                : "text-primary-100/80 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon className="h-[18px] w-[18px]" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-4">
      <p className="mb-3 truncate px-3 text-xs text-primary-100/60">{userName}</p>
      <Link
        href="/"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-primary-100/80 hover:bg-white/10 hover:text-white"
      >
        <Home className="h-[18px] w-[18px]" aria-hidden /> Voir le site
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-primary-100/80 hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-[18px] w-[18px]" aria-hidden /> Déconnexion
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-primary-900 px-4 lg:hidden">
        <span className="font-display font-semibold text-white">Administration</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-white"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-30 flex flex-col bg-primary-900 pt-14 lg:hidden">
          {nav}
          {footer}
        </div>
      )}
      <div className="h-14 lg:hidden" aria-hidden />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col bg-primary-900 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <span className="font-display text-lg font-semibold text-white">
            {CLINIC_NAME}
          </span>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
