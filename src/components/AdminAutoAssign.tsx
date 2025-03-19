
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AdminAutoAssign = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const triggerAutoAssign = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Only administrators can trigger auto-assignment');
      return;
    }

    try {
      setLoading(true);
      setResults(null);
      
      const { data, error } = await supabase.functions.invoke('auto-assign-guides', {
        body: { isManual: true, adminUserId: user.id }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('Auto-assignment completed successfully');
        setResults(data.results || []);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error triggering auto-assignment:', error);
      toast.error('Failed to complete auto-assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Auto-Assign Guides</h3>
        <Button 
          onClick={triggerAutoAssign} 
          disabled={loading}
          variant="default"
        >
          {loading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {loading ? 'Processing...' : 'Assign Guides Now'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This will automatically assign available guides to unassigned hikes that are scheduled in the next 2 days,
        based on their availability settings.
      </p>
      
      {results && (
        <div className="mt-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <h4 className="font-medium mb-2">Assignment Results:</h4>
          
          {results.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No unassigned hikes were found.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm ${
                    result.assigned 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <strong>{result.hikeName}</strong>: {result.assigned 
                    ? `Successfully assigned a guide`
                    : `Not assigned: ${result.reason}`
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAutoAssign;
