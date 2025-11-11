import React from 'react';
import { MapPin, Calendar, Clock, Eye, MessageCircle, X, Phone, Mail, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lost-found-production-d3ec.up.railway.app/api';

const ResultCard = ({ item }) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [showContactModal, setShowContactModal] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
  };

  const formatContactInfo = (contactInfo) => {
    if (!contactInfo || contactInfo.trim() === '') {
      return null;
    }
    
    // Try to detect if it's an email or phone
    const trimmed = contactInfo.trim();
    const isEmail = trimmed.includes('@');
    const isPhone = /^[\d\s\-\+\(\)]+$/.test(trimmed.replace(/\s/g, ''));
    
    return {
      text: trimmed,
      type: isEmail ? 'email' : isPhone ? 'phone' : 'text',
      display: trimmed
    };
  };

  const handleContactAction = (contactInfo) => {
    if (!contactInfo) return;
    
    const formatted = formatContactInfo(contactInfo);
    if (!formatted) return;
    
    if (formatted.type === 'email') {
      window.location.href = `mailto:${formatted.text}`;
    } else if (formatted.type === 'phone') {
      const phoneNumber = formatted.text.replace(/\D/g, '');
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', item.image_url, 'for item:', item.id);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
      : 'bg-green-500/20 text-green-400 border border-green-500/30';
  };

  const getSimilarityScore = (score) => {
    if (!score && score !== 0) return null;
    // Score is now already a similarity (0-1, higher is better) from the backend
    // Convert to percentage (0-100)
    const percentage = Math.round(score * 100);
    return Math.max(0, Math.min(100, percentage)); // Clamp to 0-100 range
  };

  // Transform image URL to use proxy if it's from Supabase
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // If it's a Supabase URL, use the proxy endpoint
    if (url.includes('supabase.co') || url.includes('supabase')) {
      return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(url)}`;
    }
    
    // Otherwise, return the URL as-is
    return url;
  };

  // Check if image_url is valid
  const hasValidImageUrl = item.image_url && 
    item.image_url.trim() !== '' && 
    (item.image_url.startsWith('http://') || item.image_url.startsWith('https://'));

  const imageUrl = hasValidImageUrl ? getImageUrl(item.image_url) : null;

  return (
    <div className="bg-gradient-card backdrop-blur-sm border border-dark-border rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-dark-surface to-dark-card rounded-t-xl sm:rounded-t-2xl overflow-hidden relative">
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-surface">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-500"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={item.title}
              className={`w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-40 sm:h-48 md:h-56 flex items-center justify-center text-dark-text-muted">
            <Eye className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <h4 className="font-bold text-dark-text-primary text-base sm:text-lg line-clamp-2 leading-tight flex-1">
            {item.title}
          </h4>
          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getTypeColor(item.type)}`}>
            {item.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-dark-text-secondary text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-dark-text-muted text-xs sm:text-sm mb-2 sm:mb-3">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span className="truncate font-medium">{item.location}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-dark-text-muted text-xs sm:text-sm mb-3 sm:mb-4">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span className="font-medium">{formatDate(item.created_at)}</span>
        </div>

        {/* Similarity Score */}
        {item.similarity_score !== undefined && (
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
              <span className="text-dark-text-secondary font-medium">AI Match</span>
              <span className="font-bold text-primary-400 text-base sm:text-lg">
                {getSimilarityScore(item.similarity_score)}%
              </span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-2 sm:h-3 overflow-hidden">
              <div
                className="bg-gradient-primary h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getSimilarityScore(item.similarity_score)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={handleContact}
            className="flex-1 bg-gradient-primary text-white text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium min-h-[44px]"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Contact</span>
          </button>
          <button 
            onClick={handleViewDetails}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 border border-dark-border text-dark-text-secondary text-xs sm:text-sm rounded-xl hover:bg-dark-card hover:border-primary-500/50 transition-all duration-200 font-medium min-h-[44px]"
          >
            {showDetails ? 'Hide' : 'View'}
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-dark-surface rounded-xl border border-dark-border">
            <h5 className="font-semibold text-dark-text-primary mb-2 text-sm sm:text-base">Additional Details</h5>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-dark-text-secondary">
              <div><strong>Item ID:</strong> {item.id}</div>
              <div><strong>Full Description:</strong> {item.description}</div>
              <div><strong>Exact Location:</strong> {item.location}</div>
              <div><strong>Posted:</strong> {formatDate(item.created_at)}</div>
              {item.similarity_score && (
                <div><strong>AI Match Score:</strong> {getSimilarityScore(item.similarity_score)}%</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeContactModal}>
          <div className="bg-gradient-card rounded-xl sm:rounded-2xl shadow-2xl border border-dark-border max-w-md w-full p-6 sm:p-8 relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeContactModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-surface rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark-text-primary mb-2">
                  Contact Information
                </h3>
                <p className="text-sm sm:text-base text-dark-text-secondary">
                  Get in touch about: <span className="font-semibold text-dark-text-primary">{item.title}</span>
                </p>
              </div>

              {item.contact_info || item.contactInfo ? (
                <div className="space-y-4">
                  <div className="p-4 bg-dark-surface rounded-xl border border-dark-border">
                    <div className="flex items-start space-x-3">
                      {formatContactInfo(item.contact_info || item.contactInfo)?.type === 'email' ? (
                        <Mail className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      ) : formatContactInfo(item.contact_info || item.contactInfo)?.type === 'phone' ? (
                        <Phone className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <User className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-dark-text-muted mb-1">Contact Details</p>
                        <p className="text-sm sm:text-base font-medium text-dark-text-primary break-all">
                          {item.contact_info || item.contactInfo}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(formatContactInfo(item.contact_info || item.contactInfo)?.type === 'email' || 
                    formatContactInfo(item.contact_info || item.contactInfo)?.type === 'phone') && (
                    <button
                      onClick={() => handleContactAction(item.contact_info || item.contactInfo)}
                      className="w-full bg-gradient-primary text-white py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-sm sm:text-base min-h-[44px]"
                    >
                      {formatContactInfo(item.contact_info || item.contactInfo)?.type === 'email' ? (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Send Email</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Call Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-dark-surface rounded-xl border border-dark-border text-center">
                  <p className="text-sm sm:text-base text-dark-text-muted">
                    No contact information available for this item.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-dark-border">
                <p className="text-xs text-dark-text-muted text-center">
                  Item posted on {formatDate(item.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
