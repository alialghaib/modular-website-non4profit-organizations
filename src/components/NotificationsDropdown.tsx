
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { countUnreadNotifications, markNotificationAsRead } from '@/lib/notifications';

interface NotificationItem {
  id: string;
  type: string;
  data: any;
  read: boolean;
  created_at: string;
}

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time subscription for new notifications
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}` 
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
      
      // Cleanup subscription
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get the 5 most recent notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
      }
      
      // Count unread notifications
      const { count } = await countUnreadNotifications(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error in notifications fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { success } = await markNotificationAsRead(notificationId);
      
      if (success) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatNotificationMessage = (notification: NotificationItem) => {
    const { type, data } = notification;
    
    switch (type) {
      case 'booking_confirmed':
        return `Your booking for ${data.hikeName} has been confirmed.`;
      case 'booking_canceled':
        return `Your booking for ${data.hikeName} has been canceled.`;
      case 'reminder':
        return `Reminder: Your hike ${data.hikeName} is coming up in ${data.daysUntil} days.`;
      case 'waiver_missing':
        return `Please sign the waiver for your upcoming hike: ${data.hikeName}.`;
      case 'guide_assigned':
        return `${data.guideName} has been assigned as your guide for ${data.hikeName}.`;
      default:
        return 'New notification received.';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;
    
    const months = Math.floor(days / 30);
    return `${months} months ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} unread
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="py-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <DropdownMenuItem key={notification.id} className="cursor-default p-0">
              <div className={`w-full p-3 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm">
                    {formatNotificationMessage(notification)}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {getTimeAgo(notification.created_at)}
                  </span>
                </div>
                
                {!notification.read && (
                  <div className="mt-1 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs px-2 py-1" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                    >
                      Mark as read
                    </Button>
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link to="/hiker/dashboard">
            <Button variant="outline" size="sm" className="w-full">
              View All Notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
