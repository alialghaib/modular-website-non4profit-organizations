
import { useState, useEffect } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NotificationItem {
  id: string;
  type: string;
  data: any;
  read: boolean;
  created_at: string;
}

const UserNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to update notification');
      } else {
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        ));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) {
        toast.info('No unread notifications');
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
      
      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Failed to update notifications');
      } else {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'booking_canceled':
        return <Bell className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'waiver_missing':
        return <Bell className="h-5 w-5 text-orange-500" />;
      case 'guide_assigned':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Your Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchNotifications}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">You have no notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              className={`relative p-4 rounded-lg border ${notification.read 
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                : 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20'}`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'}`}>
                    {formatNotificationMessage(notification)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getNotificationDate(notification.created_at)}
                  </p>
                  
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-xs h-7"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserNotifications;
