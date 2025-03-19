
import { Helmet } from 'react-helmet';
import { useState, useEffect } from 'react';
import UserNotifications from '@/components/UserNotifications';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import NotificationSettings from '@/components/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { countUnreadNotifications } from '@/lib/notifications';

const MyHikes = () => {
  const [activeTab, setActiveTab] = useState<'completed' | 'notifications' | 'settings'>('completed');
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, activeTab]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { count } = await countUnreadNotifications(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Hikes | Community Trail Guide</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Hiking Adventures</h1>
              
              <Tabs
                defaultValue="completed"
                onValueChange={(value) => setActiveTab(value as any)}
              >
                <TabsList className="mb-8 grid grid-cols-3 w-full max-w-2xl mx-auto">
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="notifications" className="relative">
                    Notifications
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="ml-2 h-5 min-w-5 flex items-center justify-center px-1"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="completed" className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <div className="mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Past Hikes</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You don't have any completed hiking adventures yet. Your completed hikes will appear here.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications" className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <UserNotifications />
                </TabsContent>
                
                <TabsContent value="settings" className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <NotificationSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default MyHikes;
