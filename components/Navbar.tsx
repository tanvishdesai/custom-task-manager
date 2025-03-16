"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import NotificationDropdown from "./NotificationDropdown";

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
      <nav className="backdrop-blur-md bg-background/70 rounded-full border border-border shadow-sm px-4 sm:px-6 py-3 transition-all duration-200">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/android-chrome-192x192.png"
                alt="TaskMaster Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-semibold">TaskMaster</span>
            </Link>
          </div>
            
          {/* Centered quote with updated styling */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <span className="text-sm text-foreground/80 italic font-serif tracking-wide">
              There is no nobility in Mediocrity
            </span>
          </div>

          {/* Right side with user menu and notifications */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <NotificationDropdown />
                <div className="hidden md:flex items-center">
                  <Avatar className="h-8 w-8 bg-primary/20">
                    <AvatarFallback className="text-primary">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 font-medium">{user.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:inline-flex">
                  Sign Out
                </Button>
                
                {/* Mobile Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 bg-primary/20">
                          <AvatarFallback className="text-primary text-xs">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
                
                {/* Mobile Menu for signed out state */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/sign-in">Sign In</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/sign-up">Sign Up</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar; 