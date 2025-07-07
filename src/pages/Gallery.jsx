import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCamera, FiVideo, FiPlus, FiX, FiDownload, FiTrash2, FiEdit2, FiTag } = FiIcons;

const Gallery = () => {
  const [media, setMedia] = useState([]);
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
    tags: ''
  });

  // Load media from localStorage on component mount
  useEffect(() => {
    const savedMedia = localStorage.getItem('rugbyMedia');
    if (savedMedia) {
      setMedia(JSON.parse(savedMedia));
    } else {
      // Default sample media if none exists
      const defaultMedia = [
        {
          id: 1,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
          title: 'Pre-season Training',
          description: 'Team preparing for the new season',
          date: '2025-01-15',
          tags: ['training', 'preseason']
        },
        {
          id: 2,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          title: 'Squad Photo',
          description: 'Official team photo for 2025/26 season',
          date: '2025-01-20',
          tags: ['team', 'official']
        },
        {
          id: 3,
          type: 'video',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: 'Training Highlights',
          description: 'Best moments from training sessions',
          date: '2025-01-25',
          tags: ['training', 'highlights']
        }
      ];
      setMedia(defaultMedia);
      localStorage.setItem('rugbyMedia', JSON.stringify(defaultMedia));
    }
  }, []);

  // Save media to localStorage whenever media changes
  useEffect(() => {
    localStorage.setItem('rugbyMedia', JSON.stringify(media));
  }, [media]);

  const handleAddMedia = (e) => {
    e.preventDefault();
    const mediaItem = {
      id: Date.now(),
      ...newMedia,
      tags: newMedia.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };
    setMedia([mediaItem, ...media]);
    setNewMedia({
      type: 'image',
      url: '',
      title: '',
      description: '',
      date: '',
      tags: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteMedia = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setMedia(media.filter(item => item.id !== id));
      // Close modal if the deleted item was selected
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia(null);
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
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.title}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="aspect-video">
                <iframe
                  src={media.url}
                  title={media.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            )}
            <div className="mt-4">
              <p className="text-gray-600 mb-2">{media.description}</p>
              <p className="text-sm text-gray-500 mb-2">{media.date}</p>
              {media.tags && media.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {media.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newMedia.type === 'image' ? 'Image URL' : 'Video URL (YouTube embed)'}
              </label>
              <input
                type="url"
                value={newMedia.url}
                onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={newMedia.type === 'image' ? 'https://example.com/image.jpg' : 'https://www.youtube.com/embed/...'}
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
            <div className="aspect-video relative cursor-pointer" onClick={() => setSelectedMedia(item)}>
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <SafeIcon icon={FiVideo} className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'image' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
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
                    <span key={tagIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
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
              : 'No media matches your current filters'
            }
          </p>
        </div>
      )}

      {/* Media Modal */}
      <MediaModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
    </div>
  );
};

export default Gallery;