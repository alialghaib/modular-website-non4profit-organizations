
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';

interface EWaiverUploaderProps {
  hikeId: string;
  bookingId?: string;
  onSuccess?: (waiverUrl: string) => void;
}

const EWaiverUploader = ({ hikeId, bookingId, onSuccess }: EWaiverUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is PDF
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const uploadWaiver = async () => {
    if (!file || !user) return;
    
    setUploading(true);
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${hikeId}-${Date.now()}.${fileExt}`;
      const filePath = `waivers/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('hiking-waivers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('hiking-waivers')
        .getPublicUrl(data.path);
      
      const waiverUrl = urlData.publicUrl;
      
      // If we have a booking ID, update the booking record
      if (bookingId) {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ 
            e_waiver_signed: true,
            e_waiver_url: waiverUrl
          })
          .eq('id', bookingId);
        
        if (updateError) {
          console.error('Error updating booking:', updateError);
        }
      }
      
      toast.success('Waiver uploaded successfully');
      
      if (onSuccess) {
        onSuccess(waiverUrl);
      }
    } catch (error) {
      console.error('Error uploading waiver:', error);
      toast.error('Failed to upload waiver. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Upload E-Waiver</h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Please download the waiver form, fill it out, sign it, and upload the completed PDF.
      </p>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Instructions:</h4>
        <ol className="list-decimal pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>Download the waiver template below</li>
          <li>Fill in all required fields including your name and emergency contact</li>
          <li>Sign the document (digitally or print, sign, and scan)</li>
          <li>Save as PDF and upload the signed document</li>
        </ol>
      </div>
      
      <a 
        href="/waiver-template.pdf" 
        download 
        className="inline-flex items-center mb-6 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Waiver Template
      </a>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <input
            type="file"
            id="waiver-upload"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <label 
            htmlFor="waiver-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400 mb-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {file ? file.name : 'Click to upload signed waiver'}
            </span>
            
            {!file && (
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                PDF only, max 5MB
              </span>
            )}
          </label>
        </div>
        
        <Button
          type="button"
          onClick={uploadWaiver}
          disabled={!file || uploading}
          className="w-full"
          variant={!file || uploading ? "outline" : "default"}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Upload Signed Waiver'
          )}
        </Button>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
          By uploading this waiver, you confirm that all information provided is accurate and you agree to the terms and conditions.
        </div>
      </div>
    </div>
  );
};

export default EWaiverUploader;
