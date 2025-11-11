import React from 'react';
import { MapPin, Calendar, Clock, Eye, MessageCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lost-found-production-d3ec.up.railway.app/api';

const ResultCard = ({ item }) => {
  const [showDetails, setShowDetails] = React.useState(false);
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
    // For now, show an alert. In a real app, this would open a contact modal or redirect
    alert(`Contact information for "${item.title}"\n\nThis would typically show:\n- Contact person name\n- Phone number\n- Email\n- Preferred contact method`);
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
    <div className="bg-gradient-card backdrop-blur-sm border border-dark-border rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-primary-500/20 transition-all duration-300 hover:transform hover:scale-105 overflow-hidden group">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-dark-surface to-dark-card rounded-t-2xl overflow-hidden relative">
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-surface">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={item.title}
              className={`w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-56 flex items-center justify-center text-dark-text-muted">
            <Eye className="w-16 h-16" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-bold text-dark-text-primary text-lg line-clamp-2 leading-tight">
            {item.title}
          </h4>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ml-3 flex-shrink-0 ${getTypeColor(item.type)}`}>
            {item.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-dark-text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-dark-text-muted text-sm mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate font-medium">{item.location}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-dark-text-muted text-sm mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">{formatDate(item.created_at)}</span>
        </div>

        {/* Similarity Score */}
        {item.similarity_score !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-dark-text-secondary font-medium">AI Match</span>
              <span className="font-bold text-primary-400 text-lg">
                {getSimilarityScore(item.similarity_score)}%
              </span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getSimilarityScore(item.similarity_score)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button 
            onClick={handleContact}
            className="flex-1 bg-gradient-primary text-white text-sm py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact</span>
          </button>
          <button 
            onClick={handleViewDetails}
            className="px-4 py-3 border border-dark-border text-dark-text-secondary text-sm rounded-xl hover:bg-dark-card hover:border-primary-500/50 transition-all duration-200 font-medium"
          >
            {showDetails ? 'Hide' : 'View'}
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 p-4 bg-dark-surface rounded-xl border border-dark-border">
            <h5 className="font-semibold text-dark-text-primary mb-2">Additional Details</h5>
            <div className="space-y-2 text-sm text-dark-text-secondary">
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
    </div>
  );
};

export default ResultCard;
