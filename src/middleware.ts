import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isStaff = token?.role === "ADMIN" || token?.role === "RECEPTIONIST";

    if (path.startsWith("/admin") && !isStaff) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Receptionists only manage appointments and patients
    if (
      token?.role === "RECEPTIONIST" &&
      ["/admin/services", "/admin/content", "/admin/media", "/admin/settings", "/admin/calendar"].some(
        (p) => path.startsWith(p)
      )
    ) {
      return NextResponse.redirect(new URL("/admin/appointments", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/book"],
};
