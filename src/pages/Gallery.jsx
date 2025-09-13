import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabaseData } from '../hooks/useSupabaseData';
import ProtectedPage from '../components/ProtectedPage';

const { FiCamera, FiVideo, FiPlus, FiX, FiDownload, FiTrash2, FiEdit2, FiTag, FiInfo } = FiIcons;

const Gallery = () => {
  const { data: media, loading, error, addItem, deleteItem } = useSupabaseData('media');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [newMedia, setNewMedia] = useState({
    type: 'image',
    url: '',
    title: '',
    description: '',
    date: '',
    tags: '',
    videoType: 'youtube'
  });

  // Enhanced function to process and convert various video URLs
  const processVideoUrl = (url, videoType) => {
    if (!url) return url;

    console.log(`Processing ${videoType} URL:`, url);

    // Handle YouTube URLs
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

    // Enhanced Dropbox URL handling
    if (videoType === 'dropbox' || url.includes('dropbox.com')) {
      console.log('Processing Dropbox URL:', url);
      
      // Handle different Dropbox URL formats
      let processedUrl = url;
      
      // Convert share links to direct links
      if (url.includes('?dl=0')) {
        processedUrl = url.replace('?dl=0', '?dl=1');
      } else if (url.includes('?dl=1')) {
        processedUrl = url;
      } else if (!url.includes('?dl=')) {
        // Add dl=1 parameter if not present
        processedUrl = url + (url.includes('?') ? '&dl=1' : '?dl=1');
      }
      
      // Handle shortened dropbox links
      if (url.includes('dropbox.com/s/') && !url.includes('?')) {
        processedUrl = url + '?dl=1';
      }
      
      console.log('Processed Dropbox URL:', processedUrl);
      return processedUrl;
    }

    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      // Extract file ID from Google Drive URL
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    // Handle OneDrive URLs
    if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) {
      // OneDrive embed format
      if (url.includes('embed')) {
        return url;
      }
      // Try to convert to embed format
      return url.replace('view', 'embed');
    }

    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    // For direct video files or other URLs, return as-is
    return url;
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();
    
    // Process video URL based on video type
    let processedUrl = newMedia.url;
    if (newMedia.type === 'video') {
      processedUrl = processVideoUrl(newMedia.url, newMedia.videoType);
      console.log('Final processed URL:', processedUrl);
    }
    
    const mediaData = {
      ...newMedia,
      url: processedUrl,
      tags: newMedia.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };
    
    try {
      await addItem(mediaData);
      setNewMedia({
        type: 'image',
        url: '',
        title: '',
        description: '',
        date: '',
        tags: '',
        videoType: 'youtube'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding media:", error);
      alert("Failed to add media. Please try again.");
    }
  };

  const handleDeleteMedia = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await deleteItem(id);
        // Close modal if the deleted item was selected
        if (selectedMedia && selectedMedia.id === id) {
          setSelectedMedia(null);
        }
      } catch (error) {
        console.error("Error deleting media:", error);
        alert("Failed to delete media. Please try again.");
      }
    }
  };

  // Get all unique tags from media
  const getAllTags = () => {
    const allTags = media.flatMap(item => item.tags || []);
    return [...new Set(allTags)].sort();
  };

  const filteredMedia = media.filter(item => {
    const typeMatch = filter === 'all' || item.type === filter;
    const tagMatch = tagFilter === 'all' || (item.tags && item.tags.includes(tagFilter));
    return typeMatch && tagMatch;
  });

  // Check if user is admin
  const isAdmin = localStorage.getItem('rugbyAdminAuth') === 'true';

  const MediaModal = ({ media, onClose }) => {
    if (!media) return null;
    
    // Enhanced function to render the appropriate media player
    const renderMediaContent = () => {
      if (media.type === 'image') {
        return <img src={media.url} alt={media.title} className="w-full h-auto rounded-lg" />;
      } else {
        // Enhanced video handling with better Dropbox support
        const url = media.url;
        console.log('Rendering video with URL:', url);
        
        // YouTube embed
        if (url.includes('youtube.com/embed')) {
          return (
            <iframe 
              src={url} 
              title={media.title} 
              className="w-full h-full rounded-lg" 
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          );
        }
        
        // Vimeo embed
        if (url.includes('player.vimeo.com')) {
          return (
            <iframe 
              src={url} 
              title={media.title} 
              className="w-full h-full rounded-lg" 
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
            />
          );
        }
        
        // Google Drive embed
        if (url.includes('drive.google.com')) {
          return (
            <iframe 
              src={url} 
              title={media.title} 
              className="w-full h-full rounded-lg" 
              allowFullScreen
              allow="autoplay"
            />
          );
        }
        
        // Enhanced Dropbox handling
        if (url.includes('dropbox.com')) {
          console.log('Rendering Dropbox video:', url);
          
          // For Dropbox, we'll use both video element and iframe as fallback
          return (
            <div className="w-full h-full rounded-lg bg-gray-100 flex flex-col">
              <video 
                src={url} 
                controls 
                className="w-full flex-1 rounded-lg" 
                title={media.title}
                preload="metadata"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.log('Video element failed, trying alternative approach');
                  // If video fails, show download link
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.nextElementSibling;
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>
              <div 
                className="hidden w-full h-full flex-col items-center justify-center p-8 text-center"
                style={{ display: 'none' }}
              >
                <SafeIcon icon={FiVideo} className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Unable to preview this Dropbox video directly.</p>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  <span>Open in Dropbox</span>
                </a>
                <p className="text-sm text-gray-500 mt-2">Click to view or download the video</p>
              </div>
            </div>
          );
        }
        
        // OneDrive embed
        if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) {
          return (
            <iframe 
              src={url} 
              title={media.title} 
              className="w-full h-full rounded-lg" 
              allowFullScreen
            />
          );
        }
        
        // Direct video file (.mp4, .webm, .mov, etc.)
        if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i)) {
          return (
            <video 
              src={url} 
              controls 
              className="w-full h-auto rounded-lg" 
              title={media.title}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          );
        }
        
        // Default iframe for other platforms
        return (
          <iframe 
            src={url} 
            title={media.title} 
            className="w-full h-full rounded-lg" 
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        );
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{media.title}</h3>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    handleDeleteMedia(media.id, media.title);
                    onClose();
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete media"
                >
                  <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="aspect-video">
              {renderMediaContent()}
            </div>
            <div className="mt-4">
              <p className="text-gray-600 mb-2">{media.description}</p>
              <p className="text-sm text-gray-500 mb-2">{media.date}</p>
              {media.tags && media.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {media.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-gray-800"
          >
            Gallery
          </motion.h1>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Media</span>
            </button>
          )}
        </div>

        {/* Permission Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-blue-700">
            All media content is shared with appropriate permissions and consent from participants/parents/guardians.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filter === 'image'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <SafeIcon icon={FiCamera} className="w-4 h-4" />
              <span>Photos</span>
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filter === 'video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <SafeIcon icon={FiVideo} className="w-4 h-4" />
              <span>Videos</span>
            </button>
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
        </div>

        {/* Add Media Form */}
        {showAddForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Media</h2>
            <form onSubmit={handleAddMedia} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newMedia.type}
                    onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="image">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newMedia.date}
                    onChange={(e) => setNewMedia({ ...newMedia, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newMedia.title}
                  onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {newMedia.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Source</label>
                  <select
                    value={newMedia.videoType}
                    onChange={(e) => setNewMedia({ ...newMedia, videoType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="direct">Direct Video URL (.mp4, etc.)</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="dropbox">Dropbox</option>
                    <option value="googledrive">Google Drive</option>
                    <option value="onedrive">OneDrive</option>
                    <option value="other">Other (Custom Embed)</option>
                  </select>
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-start space-x-2">
                      <SafeIcon icon={FiInfo} className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        {newMedia.videoType === 'youtube' && (
                          <p>Enter any YouTube URL (standard or embed). Example: https://www.youtube.com/watch?v=VIDEO_ID</p>
                        )}
                        {newMedia.videoType === 'direct' && (
                          <p>Enter a direct link to a video file (.mp4, .webm, etc.). Example: https://example.com/video.mp4</p>
                        )}
                        {newMedia.videoType === 'vimeo' && (
                          <p>Enter a Vimeo URL. Example: https://vimeo.com/VIDEO_ID</p>
                        )}
                        {newMedia.videoType === 'dropbox' && (
                          <div>
                            <p><strong>Dropbox Instructions:</strong></p>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Upload your video to Dropbox</li>
                              <li>Right-click and select "Share" or "Copy link"</li>
                              <li>Copy the share link (any Dropbox link format works)</li>
                              <li>Paste it here - the system will automatically optimize it for video playback</li>
                            </ol>
                            <p className="mt-2"><strong>Supported formats:</strong></p>
                            <p className="text-xs">• https://www.dropbox.com/s/abc123/video.mp4?dl=0</p>
                            <p className="text-xs">• https://dropbox.com/s/abc123/video.mp4</p>
                            <p className="text-xs">• Any Dropbox share link (automatically converted)</p>
                          </div>
                        )}
                        {newMedia.videoType === 'googledrive' && (
                          <div>
                            <p><strong>Google Drive Instructions:</strong></p>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Upload your video to Google Drive</li>
                              <li>Right-click and select "Share" → "Get link"</li>
                              <li>Set permissions to "Anyone with the link can view"</li>
                              <li>Copy and paste the link here</li>
                            </ol>
                            <p className="mt-2">Example: https://drive.google.com/file/d/FILE_ID/view</p>
                          </div>
                        )}
                        {newMedia.videoType === 'onedrive' && (
                          <p>Enter a OneDrive share link. Example: https://onedrive.live.com/embed?cid=...</p>
                        )}
                        {newMedia.videoType === 'other' && (
                          <p>Enter any video URL or embed URL from other services.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newMedia.type === 'image' ? 'Image URL' : 'Video URL'}
                </label>
                <input
                  type="url"
                  value={newMedia.url}
                  onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={newMedia.type === 'image' 
                    ? 'https://example.com/image.jpg' 
                    : newMedia.videoType === 'youtube' 
                      ? 'https://www.youtube.com/watch?v=VIDEO_ID'
                      : newMedia.videoType === 'dropbox'
                        ? 'https://www.dropbox.com/s/abc123/video.mp4?dl=0'
                        : 'https://example.com/video.mp4'}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newMedia.description}
                  onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={newMedia.tags}
                  onChange={(e) => setNewMedia({ ...newMedia, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., training, match, team (separate with commas)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Media
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div
                className="aspect-video relative cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <SafeIcon icon={FiVideo} className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <SafeIcon icon={item.type === 'image' ? FiCamera : FiVideo} className="w-3 h-3 mr-1" />
                    {item.type === 'image' ? 'Photo' : 'Video'}
                  </span>
                </div>
                
                {/* Admin Controls - Only show when admin is logged in */}
                {isAdmin && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(item.id, item.title);
                      }}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Delete media"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <p className="text-xs text-gray-500 mb-2">{item.date}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiCamera} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No media found</p>
            <p className="text-gray-400">
              {filter === 'all' && tagFilter === 'all'
                ? 'Upload photos and videos to build your gallery'
                : 'No media matches your current filters'}
            </p>
          </div>
        )}

        {/* Media Modal */}
        <MediaModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      </div>
    );
  };

  return (
    <ProtectedPage pageName="Gallery">
      <GalleryContent />
    </ProtectedPage>
  );
};

export default Gallery;