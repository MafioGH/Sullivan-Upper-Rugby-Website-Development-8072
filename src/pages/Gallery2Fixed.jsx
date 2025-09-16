import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabaseDataFixed } from '../hooks/useSupabaseDataFixed';
import ProtectedPage from '../components/ProtectedPage';

const { FiCamera, FiVideo, FiPlus, FiX, FiTrash2, FiTag, FiInfo, FiPlay, FiImage, FiExternalLink, FiEdit3, FiFilter, FiGrid, FiList, FiCalendar, FiEye, FiSearch } = FiIcons;

const Gallery2Fixed = () => {
  // 🔧 FIX 1: Use the fixed hook with form interaction tracking
  const { data: media, loading, error, addItem, deleteItem, setFormInteracting } = useSupabaseDataFixed('media');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // 🔧 FIX 2: Stable form state - no object spreading
  const [formType, setFormType] = useState('image');
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formVideoType, setFormVideoType] = useState('youtube');

  const isAdmin = localStorage.getItem('rugbyAdminAuth') === 'true';

  // 🔧 FIX 3: Notify hook when user starts/stops interacting with form
  const handleFormFocus = () => {
    setFormInteracting(true);
  };

  const handleFormBlur = () => {
    // Delay to allow for quick focus changes between form fields
    setTimeout(() => setFormInteracting(false), 100);
  };

  // Process video URLs for different platforms
  const processVideoUrl = (url, videoType) => {
    if (!url) return url;

    // YouTube
    if (videoType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URLSearchParams(new URL(url).search).get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      return url;
    }

    // Vimeo
    if (videoType === 'vimeo' || url.includes('vimeo.com')) {
      if (url.includes('player.vimeo.com')) {
        return url;
      }
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
    }

    // Google Drive
    if (videoType === 'googledrive' || url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return url;
    }

    return url;
  };

  // Reset form
  const resetForm = () => {
    setFormType('image');
    setFormUrl('');
    setFormTitle('');
    setFormDescription('');
    setFormDate('');
    setFormTags('');
    setFormVideoType('youtube');
    setShowAddForm(false);
    setFormInteracting(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formUrl.trim() || !formTitle.trim() || !formDate) {
      alert('Please fill in all required fields (URL, Title, and Date)');
      return;
    }

    try {
      let processedUrl = formUrl.trim();
      
      // Process video URL if it's a video
      if (formType === 'video') {
        processedUrl = processVideoUrl(processedUrl, formVideoType);
      }

      const mediaData = {
        type: formType,
        url: processedUrl,
        title: formTitle.trim(),
        description: formDescription.trim() || '',
        date: formDate,
        tags: formTags ? formTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
        videoType: formType === 'video' ? formVideoType : null
      };

      await addItem(mediaData);
      resetForm();
      alert('Media added successfully!');
    } catch (error) {
      console.error('Error adding media:', error);
      alert('Failed to add media. Please try again.');
    }
  };

  // Handle media deletion
  const handleDeleteMedia = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await deleteItem(id);
        if (selectedMedia && selectedMedia.id === id) {
          setSelectedMedia(null);
        }
        alert('Media deleted successfully!');
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Failed to delete media. Please try again.');
      }
    }
  };

  // Get all unique tags
  const getAllTags = () => {
    const allTags = media.flatMap(item => item.tags || []);
    return [...new Set(allTags)].sort();
  };

  // Filter and sort media
  const getFilteredAndSortedMedia = () => {
    let filtered = media.filter(item => {
      // Type filter
      const typeMatch = filter === 'all' || item.type === filter;
      
      // Tag filter
      const tagMatch = tagFilter === 'all' || (item.tags && item.tags.includes(tagFilter));
      
      // Search query
      const searchMatch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      return typeMatch && tagMatch && searchMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  };

  const filteredMedia = getFilteredAndSortedMedia();

  // Media Modal Component
  const MediaModal = () => {
    if (!selectedMedia) return null;

    const renderMediaContent = () => {
      if (selectedMedia.type === 'image') {
        return (
          <img 
            src={selectedMedia.url} 
            alt={selectedMedia.title}
            className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        );
      } else {
        // Video content
        const url = selectedMedia.url;
        
        if (url.includes('youtube.com/embed')) {
          return (
            <iframe
              src={url}
              title={selectedMedia.title}
              className="w-full aspect-video rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          );
        }
        
        if (url.includes('player.vimeo.com')) {
          return (
            <iframe
              src={url}
              title={selectedMedia.title}
              className="w-full aspect-video rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
            />
          );
        }
        
        if (url.includes('drive.google.com')) {
          return (
            <iframe
              src={url}
              title={selectedMedia.title}
              className="w-full aspect-video rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="autoplay"
            />
          );
        }
        
        return (
          <video
            src={url}
            controls
            className="w-full h-auto rounded-lg max-h-[70vh]"
            title={selectedMedia.title}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        );
      }
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-800">{selectedMedia.title}</h3>
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      handleDeleteMedia(selectedMedia.id, selectedMedia.title);
                      setSelectedMedia(null);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete media"
                  >
                    <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                {renderMediaContent()}
                
                {/* Fallback error message */}
                <div className="hidden w-full h-64 flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
                  <SafeIcon icon={selectedMedia.type === 'image' ? FiImage : FiVideo} className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Unable to load this {selectedMedia.type}</p>
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
              
              <div className="space-y-4">
                {selectedMedia.description && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedMedia.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Date</h4>
                    <p className="text-gray-600">{new Date(selectedMedia.date).toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Type</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMedia.type === 'image' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      <SafeIcon icon={selectedMedia.type === 'image' ? FiCamera : FiVideo} className="w-4 h-4 mr-1" />
                      {selectedMedia.type === 'image' ? 'Photo' : 'Video'}
                    </span>
                  </div>
                </div>
                
                {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 border"
                        >
                          <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const GalleryContent = () => {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading gallery: {error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-800">Gallery 2 (Fixed)</h1>
            <p className="text-gray-600 mt-1">Enhanced media gallery with focus-loss fix</p>
          </motion.div>
          
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5" />
              <span>Add Media</span>
            </button>
          )}
        </div>

        {/* Permission Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-blue-700">
            <SafeIcon icon={FiInfo} className="w-4 h-4 inline mr-1" />
            All media content is shared with appropriate permissions and consent from participants/parents/guardians.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SafeIcon icon={FiSearch} className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search media by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleFormFocus}
                  onBlur={handleFormBlur}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="image">Photos</option>
                <option value="video">Videos</option>
              </select>
            </div>

            {/* Tag Filter */}
            {getAllTags().length > 0 && (
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiTag} className="w-4 h-4 text-gray-600" />
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tags</option>
                  {getAllTags().map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Grid View"
              >
                <SafeIcon icon={FiGrid} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="List View"
              >
                <SafeIcon icon={FiList} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Add Media Form */}
        <AnimatePresence>
          {showAddForm && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-white rounded-lg shadow-lg border p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <SafeIcon icon={FiPlus} className="w-6 h-6 mr-2" />
                Add New Media
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media Type *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      onFocus={handleFormFocus}
                      onBlur={handleFormBlur}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="image">📷 Photo</option>
                      <option value="video">🎥 Video</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      onFocus={handleFormFocus}
                      onBlur={handleFormBlur}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {formType === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Source
                      </label>
                      <select
                        value={formVideoType}
                        onChange={(e) => setFormVideoType(e.target.value)}
                        onFocus={handleFormFocus}
                        onBlur={handleFormBlur}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="googledrive">Google Drive</option>
                        <option value="direct">Direct Video File</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    onFocus={handleFormFocus}
                    onBlur={handleFormBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a descriptive title for your media"
                    required
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formType === 'image' ? 'Image URL' : 'Video URL'} *
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    onFocus={handleFormFocus}
                    onBlur={handleFormBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      formType === 'image'
                        ? 'https://example.com/image.jpg'
                        : formVideoType === 'youtube'
                        ? 'https://www.youtube.com/watch?v=VIDEO_ID'
                        : 'https://example.com/video.mp4'
                    }
                    required
                  />
                  
                  {formType === 'video' && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-2">
                        <SafeIcon icon={FiInfo} className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          {formVideoType === 'youtube' && (
                            <p><strong>YouTube:</strong> Paste any YouTube URL (watch or embed format)</p>
                          )}
                          {formVideoType === 'vimeo' && (
                            <p><strong>Vimeo:</strong> Paste a Vimeo video URL</p>
                          )}
                          {formVideoType === 'googledrive' && (
                            <p><strong>Google Drive:</strong> Share your video publicly and paste the link</p>
                          )}
                          {formVideoType === 'direct' && (
                            <p><strong>Direct Video:</strong> Link to video file (.mp4, .webm, etc.)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 🔧 FIX 4: Description textarea with focus tracking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    onFocus={handleFormFocus}
                    onBlur={handleFormBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Optional description of the media content"
                  />
                </div>

                {/* 🔧 FIX 5: Tags input with focus tracking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    onFocus={handleFormFocus}
                    onBlur={handleFormBlur}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="training, match, team (separate with commas)"
                  />
                  <p className="text-xs text-gray-500 mt-2">Separate multiple tags with commas</p>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <SafeIcon icon={FiPlus} className="w-5 h-5" />
                    <span>Add Media</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiX} className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredMedia.length} of {media.length} items
          </p>
          {(searchQuery || filter !== 'all' || tagFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
                setTagFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Media Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-video relative overflow-hidden">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
                      <SafeIcon icon={FiPlay} className="w-12 h-12 text-purple-600" />
                    </div>
                  )}
                  
                  {/* Fallback for broken images */}
                  <div className="hidden w-full h-full flex-col items-center justify-center bg-gray-100">
                    <SafeIcon icon={FiImage} className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Image unavailable</p>
                  </div>

                  {/* Media type badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      item.type === 'image'
                        ? 'bg-blue-500/80 text-white'
                        : 'bg-purple-500/80 text-white'
                    }`}>
                      <SafeIcon icon={item.type === 'image' ? FiCamera : FiVideo} className="w-3 h-3 mr-1" />
                      {item.type === 'image' ? 'Photo' : 'Video'}
                    </span>
                  </div>

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMedia(item.id, item.title);
                        }}
                        className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/80 transition-colors shadow-lg"
                        title="Delete media"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* View overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-medium">
                        <SafeIcon icon={FiEye} className="w-4 h-4" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    {item.tags && item.tags.length > 0 && (
                      <span>{item.tags.length} tag{item.tags.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border"
                        >
                          <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{item.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                        <SafeIcon icon={FiPlay} className="w-8 h-8 text-purple-600" />
                      </div>
                    )}
                    <div className="hidden w-full h-full flex-col items-center justify-center bg-gray-100">
                      <SafeIcon icon={FiImage} className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'image'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            <SafeIcon icon={item.type === 'image' ? FiCamera : FiVideo} className="w-3 h-3 mr-1" />
                            {item.type === 'image' ? 'Photo' : 'Video'}
                          </span>
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border"
                              >
                                <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(item.id, item.title);
                          }}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete media"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredMedia.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <SafeIcon icon={FiCamera} className="w-20 h-20 mx-auto text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {media.length === 0 ? 'No media found' : 'No results match your filters'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {media.length === 0
                ? 'Upload photos and videos to build your gallery'
                : 'Try adjusting your search terms or filters to find what you\'re looking for'}
            </p>
            {(searchQuery || filter !== 'all' || tagFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setTagFilter('all');
                }}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Media Modal */}
        <MediaModal />

        {/* Custom styles for line clamping */}
        <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    );
  };

  return (
    <ProtectedPage pageName="Gallery">
      <GalleryContent />
    </ProtectedPage>
  );
};

export default Gallery2Fixed;