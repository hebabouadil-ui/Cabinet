"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, CalendarCheck, UserRound, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Soins" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isStaff =
    session?.user.role === "ADMIN" || session?.user.role === "RECEPTIONIST";

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100/60 bg-white/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700 text-white">
            <CalendarCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold text-primary-900">
            Cabinet Kiné Santé
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-gray-600 transition-colors hover:text-primary-700",
                pathname === link.href && "text-primary-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              {isStaff ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-700"
                >
                  <LayoutDashboard className="h-4 w-4" /> Tableau de bord
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-700"
                >
                  <UserRound className="h-4 w-4" /> Mon espace
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" /> Déconnexion
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-primary-700"
            >
              Connexion
            </Link>
          )}
          <Link href="/book">
            <Button>Prendre rendez-vous</Button>
          </Link>
        </div>

        <button
          className="rounded-md p-2 text-gray-600 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Navigation mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  href={isStaff ? "/admin" : "/account"}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  {isStaff ? "Tableau de bord" : "Mon espace"}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left text-sm font-medium text-gray-700"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700"
              >
                Connexion
              </Link>
            )}
            <Link href="/book" onClick={() => setOpen(false)}>
              <Button className="w-full">Prendre rendez-vous</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
