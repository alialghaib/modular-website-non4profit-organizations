
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  getAllNotificationTypes, 
  getNotificationTypeLabel, 
  getNotificationPreferences,
  updateNotificationPreference,
  ensureUserHasAllPreferences
} from '@/lib/notifications';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Loader2 } from 'lucide-react';

interface NotificationPreference {
  id: string;
  user_id: string;
  type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Ensure all notification types have preferences
      await ensureUserHasAllPreferences(user.id);
      
      // Get the latest preferences
      const { preferences, error } = await getNotificationPreferences(user.id);
      
      if (error) {
        toast.error('Failed to load notification preferences');
      } else {
        setPreferences(preferences as NotificationPreference[]);
        
        // Check if user has verified phone number
        setPhoneVerified(user.isPhoneVerified || false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type: string, field: 'email_enabled' | 'sms_enabled', currentValue: boolean) => {
    if (!user) return;
    
    setSaving(type + field);
    
    try {
      const emailEnabled = field === 'email_enabled' 
        ? !currentValue 
        : preferences.find(p => p.type === type)?.email_enabled || false;
      
      const smsEnabled = field === 'sms_enabled' 
        ? !currentValue 
        : preferences.find(p => p.type === type)?.sms_enabled || false;
      
      const { success, error } = await updateNotificationPreference(
        user.id,
        type,
        emailEnabled,
        smsEnabled
      );
      
      if (!success) {
        toast.error('Failed to update preference');
        console.error('Error updating preference:', error);
        return;
      }
      
      // Update local state
      setPreferences(prev => prev.map(pref => 
        pref.type === type 
          ? { ...pref, [field]: !currentValue } 
          : pref
      ));
      
      toast.success('Preference updated');
    } catch (error) {
      console.error('Error toggling preference:', error);
      toast.error('Failed to update preference');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="mt-4 text-gray-500">Loading notification preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
        
        {!phoneVerified && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your phone number is not verified. SMS notifications will not be sent until you verify your phone number.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Verify Phone Number
            </Button>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-8 gap-4 p-4 font-medium text-sm border-b border-gray-200 dark:border-gray-700">
            <div className="col-span-4">Notification Type</div>
            <div className="col-span-2 text-center flex items-center justify-center">
              <Mail className="h-4 w-4 mr-1" /> Email
            </div>
            <div className="col-span-2 text-center flex items-center justify-center">
              <Phone className="h-4 w-4 mr-1" /> SMS
            </div>
          </div>
          
          {getAllNotificationTypes().map((type) => {
            const preference = preferences.find(p => p.type === type);
            const emailEnabled = preference?.email_enabled || false;
            const smsEnabled = preference?.sms_enabled || false;
            
            return (
              <div key={type} className="grid grid-cols-8 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="col-span-4">
                  {getNotificationTypeLabel(type)}
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch 
                    checked={emailEnabled}
                    onCheckedChange={() => handleToggle(type, 'email_enabled', emailEnabled)}
                    disabled={saving === type + 'email_enabled'}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch 
                    checked={smsEnabled}
                    onCheckedChange={() => handleToggle(type, 'sms_enabled', smsEnabled)}
                    disabled={saving === type + 'sms_enabled' || !phoneVerified}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Update your contact information to ensure you receive notifications correctly.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">Email</span>
            </div>
            <p className="mt-2 text-sm truncate">{user?.email || 'Not set'}</p>
            <div className="mt-3 flex items-center">
              <div className={`h-2 w-2 rounded-full ${user?.isEmailVerified ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {user?.isEmailVerified ? 'Verified' : 'Not verified'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">Phone Number</span>
            </div>
            <p className="mt-2 text-sm truncate">{user?.phone || 'Not set'}</p>
            <div className="mt-3 flex items-center">
              <div className={`h-2 w-2 rounded-full ${phoneVerified ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {phoneVerified ? 'Verified' : 'Not verified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
