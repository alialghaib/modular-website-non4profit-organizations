
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface EWaiverFormProps {
  bookingId: string;
  hikeName: string;
  hikeDate: string;
  onComplete?: () => void;
}

const EWaiverForm = ({ bookingId, hikeName, hikeDate, onComplete }: EWaiverFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    acceptTerms: false,
    acceptRisks: false,
    acceptLiability: false,
    signature: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.emergencyContact || !formData.emergencyPhone || 
        !formData.signature || !formData.acceptTerms || !formData.acceptRisks || !formData.acceptLiability) {
      toast.error('Please complete all required fields and accept all terms');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('E-Waiver submitted successfully');
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/hiker/dashboard');
      }
    } catch (error) {
      toast.error('Failed to submit E-Waiver. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">E-Waiver Form</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please complete this waiver for your upcoming hike: <strong>{hikeName}</strong> on <strong>{hikeDate}</strong>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your full legal name"
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Home Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your home address"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Emergency Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Emergency contact name"
              />
            </div>
            
            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Emergency Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Emergency contact phone"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Medical Conditions or Allergies
            </label>
            <textarea
              id="medicalConditions"
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Please list any medical conditions or allergies our guides should be aware of"
            />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Terms and Conditions</h3>
            
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                Hiking in wilderness areas involves inherent risks, including but not limited to: changing weather conditions, terrain, wildlife encounters, falling rocks, physical exertion, and the actions of other participants.
              </p>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="acceptTerms" className="font-medium">I have read and understand the terms and conditions <span className="text-red-500">*</span></label>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptRisks"
                    name="acceptRisks"
                    type="checkbox"
                    checked={formData.acceptRisks}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="acceptRisks" className="font-medium">I acknowledge the risks involved in hiking and outdoor activities <span className="text-red-500">*</span></label>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptLiability"
                    name="acceptLiability"
                    type="checkbox"
                    checked={formData.acceptLiability}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="acceptLiability" className="font-medium">I release Nature Hikes from liability for injuries sustained during the activity <span className="text-red-500">*</span></label>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Digital Signature <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Type your full legal name to sign this waiver
            </p>
            <input
              type="text"
              id="signature"
              name="signature"
              value={formData.signature}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your full legal name"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit E-Waiver'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EWaiverForm;
