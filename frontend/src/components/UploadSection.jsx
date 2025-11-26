import React, { useState } from 'react';
import { Upload, Camera, MapPin, X, CheckCircle, Building2 } from 'lucide-react';
import { uploadItem, CAMPUS_OPTIONS } from '../services/api';

const UploadSection = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    campus: 'Uniworld 1',
    type: 'found',
    contactInfo: ''
  });
  
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location || !formData.contactInfo) {
      alert('Please fill in all required fields including contact information');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('campus', formData.campus);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('contactInfo', formData.contactInfo);
      
      images.forEach((img) => {
        formDataToSend.append('images', img.file);
      });

      await uploadItem(formDataToSend);
      
      setUploadSuccess(true);
      setFormData({
        title: '',
        description: '',
        location: '',
        campus: 'Uniworld 1',
        type: 'found',
        contactInfo: ''
      });
      setImages([]);
      
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="bg-gradient-card rounded-xl sm:rounded-lg shadow-2xl border border-dark-border p-6 sm:p-8">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold text-dark-text-primary mb-2">Upload Successful!</h3>
          <p className="text-dark-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
            Your item has been uploaded and will be searchable by others.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-left">
            <p className="text-amber-300 text-sm">
              <strong>Note:</strong> Items are automatically archived after 2 weeks. 
              If the item is found/claimed before then, please mark it as "Found" to remove it from the active listings.
            </p>
          </div>
          <button
            onClick={() => setUploadSuccess(false)}
            className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all text-sm sm:text-base min-h-[44px]"
          >
            Upload Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-card backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-dark-border p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 sm:mb-3">
          Upload Item
        </h2>
        <p className="text-dark-text-secondary text-sm sm:text-base md:text-lg">
          Upload a lost or found item to help others find what they're looking for using AI
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
        <p className="text-blue-300 text-sm">
          <strong>⏰ Auto-Archive:</strong> Items will be automatically archived after 2 weeks. 
          You can mark items as "Found" at any time to remove them from active listings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-dark-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary placeholder-dark-text-muted text-base sm:text-lg shadow-lg transition-all duration-200 min-h-[44px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-dark-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary text-base sm:text-lg shadow-lg transition-all duration-200 min-h-[44px]"
              required
            >
              <option value="found">Found Item</option>
              <option value="lost">Lost Item</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed description..."
            rows={4}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-dark-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary placeholder-dark-text-muted text-base sm:text-lg shadow-lg transition-all duration-200 resize-none"
            required
          />
        </div>

        {/* Campus Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Campus *
            </label>
            <select
              name="campus"
              value={formData.campus}
              onChange={handleInputChange}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-dark-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-dark-surface text-dark-text-primary text-base sm:text-lg shadow-lg transition-all duration-200 min-h-[44px]"
              required
            >
              {CAMPUS_OPTIONS.map((campus) => (
                <option key={campus} value={campus}>{campus}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              Specific Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Library, Cafeteria, Room 101"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-dark-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary placeholder-dark-text-muted text-base sm:text-lg shadow-lg transition-all duration-200 min-h-[44px]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
            Contact Information *
          </label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleInputChange}
            placeholder="Phone number or email address"
            className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-dark-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary placeholder-dark-text-muted text-base sm:text-lg shadow-lg transition-all duration-200 min-h-[44px]"
            required
          />
          <p className="mt-1.5 text-xs text-dark-text-muted">
            Provide your phone number or email so people can contact you
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
            Images *
          </label>
          <div className="border-2 border-dashed border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 bg-dark-surface/50 backdrop-blur-sm hover:border-primary-500 transition-colors duration-200">
            <div className="text-center">
              <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-dark-text-muted mx-auto mb-4 sm:mb-6" />
              <p className="text-dark-text-secondary mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                Upload clear photos from different angles
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer shadow-lg transition-all duration-200 font-medium text-sm sm:text-base min-h-[44px]"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Choose Images
              </label>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.preview}
                      alt="Preview"
                      className="w-full h-24 sm:h-32 object-cover rounded-xl sm:rounded-2xl shadow-lg border border-dark-border group-hover:scale-105 transition-transform duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all duration-200"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 sm:pt-6">
          <button
            type="submit"
            disabled={isUploading}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-primary text-white rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg transition-all duration-200 font-medium text-sm sm:text-base md:text-lg min-h-[44px]"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Uploading with AI...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Item</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadSection;
