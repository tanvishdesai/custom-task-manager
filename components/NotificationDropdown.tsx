"use client";

import React, { useState } from "react";
import { Bell, Check, Clock, AlertCircle, Filter } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,

  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { NotificationType } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const NotificationDropdown = () => {
  const {
    notifications, 
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead
  } = useAuth();
  
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [_isOpen, setIsOpen] = useState(false);

  // Filter notifications based on the current filter state
  const filteredNotifications = showAll 
    ? notifications 
    : notifications.filter(notification => !notification.isRead);

  const handleNotificationClick = async (notificationId: string, projectId?: string) => {
    await markNotificationRead(notificationId);
    toast.success("Notification marked as read");
    
    // Navigate to the related project or task
    if (projectId) {
      router.push(`/project/${projectId}`);
    }
  };

  // Mark a single notification as read (for "clearing" individual notifications)
  const handleClearNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markNotificationRead(notificationId);
    toast.success("Notification cleared");
  };

  // Mark all notifications as read (for "clearing all" notifications)
  const handleClearAllNotifications = async () => {
    await markAllNotificationsRead();
    toast.success("All notifications cleared");
    setShowAll(true); // Reset filter after clearing
  };

  // Toggle between showing all notifications and only unread ones
  const toggleNotificationFilter = () => {
    setShowAll(!showAll);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 p-1">
          <Bell className="h-3 w-3" />
        </Badge>;
      case NotificationType.TASK_UPDATED:
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 p-1">
          <AlertCircle className="h-3 w-3" />
        </Badge>;
      case NotificationType.PROJECT_SHARED:
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 p-1">
          <Check className="h-3 w-3" />
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 p-1">
          <Clock className="h-3 w-3" />
        </Badge>;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      const now = new Date();
      const notificationDate = new Date(timestamp);
      const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return notificationDate.toLocaleDateString();
    } catch  {
      return "Recently";
    }
  };

 

  return (
    <TooltipProvider>
      <DropdownMenu onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-full hover:bg-primary/10 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent 
          align="end" 
          className="w-96 rounded-lg border-primary/20 p-0"
        >
          <DropdownMenuLabel className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-medium">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {unreadNotificationsCount} new
                  </Badge>
                )}
              </div>
              

            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNotificationFilter}
                className={cn(
                  "text-xs h-7 px-3",
                  !showAll && "bg-primary/10 text-primary"
                )}
              >
                <Filter className="h-3 w-3 mr-2" />
                {showAll ? "Show All" : "Show Unread"}
              </Button>

              {unreadNotificationsCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllNotifications}
                  className="text-xs h-7 px-3 hover:bg-primary/10 hover:text-primary"
                >
                  <Check className="h-3 w-3 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </DropdownMenuLabel>
          
          {filteredNotifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">
                {showAll ? "You don't have any notifications." : "No unread notifications."}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <DropdownMenuGroup>
                {filteredNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.$id}
                    className={cn(
                      "flex flex-col items-start p-4 cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/50 space-y-2",
                      !notification.isRead && 'bg-primary/5'
                    )}
                    onClick={() => handleNotificationClick(notification.$id!, notification.projectId)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm">
                            {notification.title}
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1 inline" />
                            {getTimeAgo(typeof notification.createdAt === 'string' ? notification.createdAt : notification.createdAt.toString())}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearNotification(e, notification.$id!);
                            }}
                          >
                            Mark as read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default NotificationDropdown;