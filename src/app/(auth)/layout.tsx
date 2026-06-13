import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { CLINIC_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-700 text-white">
          <CalendarCheck className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-display text-xl font-semibold text-primary-900">
          {CLINIC_NAME}
        </span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-primary-100 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
