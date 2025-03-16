"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Menu, Home, Settings, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationDropdown from "./NotificationDropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4 transition-all duration-300">
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "backdrop-blur-xl rounded-full border px-4 sm:px-6 py-3 transition-all duration-300",
          scrolled 
            ? "bg-white/8 border-white/10 shadow-lg shadow-black/5" 
            : "bg-white/5 border-white/5"
        )}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center group">
              <div className="relative overflow-hidden rounded-full p-1 bg-gradient-to-br from-primary/20 to-primary/5">
                <Image
                  src="/android-chrome-192x192.png"
                  alt="TaskMaster Logo"
                  width={30}
                  height={30}
                  className="h-7 w-7 transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="ml-2 text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">TaskMaster</span>
            </Link>
          </motion.div>
            
          {/* Centered quote with updated styling */}
          <motion.div 
            className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-white/5 border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="text-sm text-white/80 italic font-serif tracking-wide">
            &quot;There is no nobility in Mediocrity&quot;
            </span>
          </motion.div>

          {/* Right side with user menu and notifications */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="relative"
                      >
                        <NotificationDropdown />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/70 backdrop-blur-lg border-white/10 text-white">
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <motion.div 
                  className="hidden md:flex items-center"
                  whileHover={{ scale: 1.03 }}
                >
                  <Avatar className="h-8 w-8 border-2 border-primary/30 bg-black/20 ring-2 ring-black/5">
                    <AvatarFallback className="text-primary font-medium">
                      {user.name.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 font-medium text-white/90">{user.name}</span>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut} 
                    className="hidden md:inline-flex border-white/10 bg-white/5 hover:bg-white/10 hover:text-primary text-white/80 transition-all duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </motion.div>
                
                {/* Mobile Menu */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/90 transition-colors">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-lg border-white/20 bg-black/70 backdrop-blur-xl text-white animate-in fade-in-50 zoom-in-95">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Account</p>
                          <p className="text-xs leading-none text-white/60">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <Avatar className="h-6 w-6 bg-primary/20">
                          <AvatarFallback className="text-primary text-xs">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <Link href="/" className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <Link href="/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <Link href="/settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 hover:bg-white/10 focus:bg-white/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-all duration-200"
                    >
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button 
                      size="sm" 
                      asChild 
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-sm hover:shadow transition-all duration-200"
                    >
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                  </motion.div>
                </div>
                
                {/* Mobile Menu for signed out state */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white/90 transition-colors">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-lg bg-black/70 backdrop-blur-xl border-white/20 text-white animate-in fade-in-50 zoom-in-95">
                      <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <Link href="/sign-in" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer font-medium text-primary hover:bg-white/10 focus:bg-white/10">
                        <Link href="/sign-up" className="flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          Sign Up
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;