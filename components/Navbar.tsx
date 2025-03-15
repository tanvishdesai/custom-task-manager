"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide navbar on sign-in and sign-up pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
    } catch (_error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
      <nav className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm px-4 sm:px-6 py-3 transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-900/80">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg
                className="h-8 w-8 text-purple-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
                <rect x="8" y="8" width="8" height="8" rx="1" fill="white" />
              </svg>
              <span className="ml-2 text-xl font-semibold">Taskify</span>
            </Link>
          </div>

          {/* Tagline */}
          <div className="hidden md:block">
            <p className="text-sm font-medium italic text-gray-600 dark:text-gray-300">
              &quot;There is no nobility in mediocrity&quot;
            </p>
          </div>

          {/* User info and sign out - Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign Out
                </Button>
              </>
            )}
            {!user && (
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar; 