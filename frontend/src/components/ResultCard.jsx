import React from 'react';
import { MapPin, Calendar, Clock, Eye, MessageCircle } from 'lucide-react';

const ResultCard = ({ item }) => {
  const [showDetails, setShowDetails] = React.useState(false);

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

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  };

  const getSimilarityScore = (score) => {
    if (!score) return null;
    const percentage = Math.round((1 - score) * 100);
    return percentage;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 overflow-hidden group">
      {/* Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-56 flex items-center justify-center text-gray-400">
            <Eye className="w-16 h-16" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-bold text-gray-900 text-lg line-clamp-2 leading-tight">
            {item.title}
          </h4>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ml-3 flex-shrink-0 ${getTypeColor(item.type)}`}>
            {item.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate font-medium">{item.location}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">{formatDate(item.created_at)}</span>
        </div>

        {/* Similarity Score */}
        {item.similarity_score !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">AI Match</span>
              <span className="font-bold text-blue-600 text-lg">
                {getSimilarityScore(item.similarity_score)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getSimilarityScore(item.similarity_score)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button 
            onClick={handleContact}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact</span>
          </button>
          <button 
            onClick={handleViewDetails}
            className="px-4 py-3 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            {showDetails ? 'Hide' : 'View'}
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">Additional Details</h5>
            <div className="space-y-2 text-sm text-gray-600">
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
