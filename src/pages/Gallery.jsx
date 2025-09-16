import React,{useState,useCallback,useMemo} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useSupabaseData} from '../hooks/useSupabaseData';
import ProtectedPage from '../components/ProtectedPage';

const {FiCamera,FiVideo,FiPlus,FiX,FiTrash2,FiTag,FiInfo,FiPlay,FiImage,FiExternalLink}=FiIcons;

const Gallery=()=> {
  const {data: media,loading,error,addItem,deleteItem}=useSupabaseData('media');
  const [showAddForm,setShowAddForm]=useState(false);
  const [selectedMedia,setSelectedMedia]=useState(null);
  const [filter,setFilter]=useState('all');
  const [tagFilter,setTagFilter]=useState('all');

  // Form state - using useCallback to prevent unnecessary re-renders
  const [formData,setFormData]=useState({
    type: 'image',
    url: '',
    title: '',
    description: '',
    date: '',
    tags: '',
    videoType: 'youtube'
  });

  // Memoized form handlers to prevent re-creation on every render
  const handleFormChange=useCallback((field,value)=> {
    setFormData(prev=> ({...prev,[field]: value}));
  },[]);

  // Reset form
  const resetForm=useCallback(()=> {
    setFormData({
      type: 'image',
      url: '',
      title: '',
      description: '',
      date: '',
      tags: '',
      videoType: 'youtube'
    });
    setShowAddForm(false);
  },[]);

  // 🔧 NEW: Function to extract video ID and generate thumbnail URL
  const getVideoThumbnail=useCallback((url,videoType)=> {
    if (!url) return null;

    // YouTube thumbnails
    if (videoType==='youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId=null;
      
      if (url.includes('youtube.com/embed/')) {
        videoId=url.split('/embed/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/watch?v=')) {
        videoId=new URLSearchParams(new URL(url).search).get('v');
      } else if (url.includes('youtu.be/')) {
        videoId=url.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    // Vimeo thumbnails (requires API call, but we can try a pattern)
    if (videoType==='vimeo' || url.includes('vimeo.com')) {
      const videoId=url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        // Vimeo thumbnail pattern (may not always work without API)
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    }

    // For other video types, return null to show placeholder
    return null;
  },[]);

  // Process video URLs for different platforms
  const processVideoUrl=useCallback((url,videoType)=> {
    if (!url) return url;

    console.log(`Processing ${videoType} URL:`,url);

    // YouTube
    if (videoType==='youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId=new URLSearchParams(new URL(url).search).get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (url.includes('youtu.be/')) {
        const videoId=url.split('youtu.be/')[1].split('?')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (url.includes('/embed/')) {
        return url; // Already embed format
      }
      return url;
    }

    // Vimeo
    if (videoType==='vimeo' || url.includes('vimeo.com')) {
      if (url.includes('player.vimeo.com')) {
        return url; // Already embed format
      }
      const videoId=url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return url;
    }

    // Google Drive
    if (videoType==='googledrive' || url.includes('drive.google.com')) {
      const fileIdMatch=url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        const fileId=fileIdMatch[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return url;
    }

    // Dropbox
    if (videoType==='dropbox' || url.includes('dropbox.com')) {
      let processedUrl=url;
      if (url.includes('?dl=0')) {
        processedUrl=url.replace('?dl=0','?dl=1');
      } else if (!url.includes('?dl=')) {
        processedUrl=url + (url.includes('?') ? '&dl=1' : '?dl=1');
      }
      return processedUrl;
    }

    // Direct video files
    if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i)) {
      return url;
    }

    return url;
  },[]);

  // Handle form submission
  const handleAddMedia=useCallback(async (e)=> {
    e.preventDefault();
    if (!formData.url.trim() || !formData.title.trim() || !formData.date) {
      alert('Please fill in all required fields (URL,Title,and Date)');
      return;
    }

    try {
      let processedUrl=formData.url.trim();
      
      // Process video URL if it's a video
      if (formData.type==='video') {
        processedUrl=processVideoUrl(processedUrl,formData.videoType);
      }

      const mediaData={
        type: formData.type,
        url: processedUrl,
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        date: formData.date,
        tags: formData.tags ? formData.tags.split(',').map(tag=> tag.trim()).filter(tag=> tag !=='') : [],
        videoType: formData.type==='video' ? formData.videoType : null
      };

      console.log('Adding media:',mediaData);
      await addItem(mediaData);
      resetForm();
      alert('Media added successfully!');
    } catch (error) {
      console.error('Error adding media:',error);
      alert('Failed to add media. Please check the console for details and try again.');
    }
  },[formData,addItem,processVideoUrl,resetForm]);

  // Handle media deletion
  const handleDeleteMedia=useCallback(async (id,title)=> {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await deleteItem(id);
        if (selectedMedia && selectedMedia.id===id) {
          setSelectedMedia(null);
        }
        alert('Media deleted successfully!');
      } catch (error) {
        console.error('Error deleting media:',error);
        alert('Failed to delete media. Please try again.');
      }
    }
  },[deleteItem,selectedMedia]);

  // Get all unique tags - memoized to prevent recalculation
  const getAllTags=useMemo(()=> {
    const allTags=media.flatMap(item=> item.tags || []);
    return [...new Set(allTags)].sort();
  },[media]);

  // Filter media - memoized to prevent recalculation
  const filteredMedia=useMemo(()=> {
    return media.filter(item=> {
      const typeMatch=filter==='all' || item.type===filter;
      const tagMatch=tagFilter==='all' || (item.tags && item.tags.includes(tagFilter));
      return typeMatch && tagMatch;
    });
  },[media,filter,tagFilter]);

  const isAdmin=localStorage.getItem('rugbyAdminAuth')==='true';

  // 🔧 UPDATED: Video Thumbnail Component
  const VideoThumbnail=useCallback(({item})=> {
    const thumbnailUrl=getVideoThumbnail(item.url,item.videoType);
    
    if (thumbnailUrl) {
      return (
        <div className="relative w-full h-full">
          <img 
            src={thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e)=> {
              // If thumbnail fails to load, show fallback
              e.target.style.display='none';
              e.target.nextElementSibling.style.display='flex';
            }}
          />
          {/* Fallback for when thumbnail fails */}
          <div className="hidden w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 items-center justify-center">
            <SafeIcon icon={FiPlay} className="w-12 h-12 text-purple-600" />
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <SafeIcon icon={FiPlay} className="w-8 h-8 text-gray-800" />
            </div>
          </div>
        </div>
      );
    } else {
      // Fallback for videos without thumbnail support
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <SafeIcon icon={FiPlay} className="w-12 h-12 text-purple-600 mb-2" />
            <div className="text-xs text-purple-700 font-medium">
              {item.videoType ? item.videoType.toUpperCase() : 'VIDEO'}
            </div>
          </div>
        </div>
      );
    }
  },[getVideoThumbnail]);

  // Media Modal Component - memoized to prevent re-creation
  const MediaModal=useMemo(()=> {
    if (!selectedMedia) return null;

    const renderMediaContent=()=> {
      if (selectedMedia.type==='image') {
        return (
          <img 
            src={selectedMedia.url}
            alt={selectedMedia.title}
            className="w-full h-auto rounded-lg"
            onError={(e)=> {
              e.target.style.display='none';
              e.target.nextElementSibling.style.display='flex';
            }}
          />
        );
      } else {
        // Video content
        const url=selectedMedia.url;
        
        // YouTube embed
        if (url.includes('youtube.com/embed')) {
          return (
            <iframe 
              src={url}
              title={selectedMedia.title}
              className="w-full aspect-video rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
            />
          );
        }
        
        // Vimeo embed
        if (url.includes('player.vimeo.com')) {
          return (
            <iframe 
              src={url}
              title={selectedMedia.title}
              className="w-full aspect-video rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="autoplay;fullscreen;picture-in-picture"
            />
          );
        }
        
        // Google Drive
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
        
        // Direct video files or Dropbox
        if (url.includes('dropbox.com') || url.match(/\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i)) {
          return (
            <video 
              src={url}
              controls
              className="w-full h-auto rounded-lg"
              title={selectedMedia.title}
              preload="metadata"
              onError={(e)=> {
                e.target.style.display='none';
                e.target.nextElementSibling.style.display='flex';
              }}
            >
              Your browser does not support the video tag.
            </video>
          );
        }
        
        // Fallback iframe
        return (
          <iframe 
            src={url}
            title={selectedMedia.title}
            className="w-full aspect-video rounded-lg"
            frameBorder="0"
            allowFullScreen
          />
        );
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{selectedMedia.title}</h3>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <button
                  onClick={()=> {
                    handleDeleteMedia(selectedMedia.id,selectedMedia.title);
                    setSelectedMedia(null);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete media"
                >
                  <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={()=> setSelectedMedia(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4">
              {renderMediaContent()}
              {/* Fallback error message */}
              <div className="hidden w-full h-64 flex-col items-center justify-center p-8 text-center bg-gray-100 rounded-lg">
                <SafeIcon icon={selectedMedia.type==='image' ? FiImage : FiVideo} className="w-16 h-16 text-gray-400 mb-4" />
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
            <div className="space-y-2">
              {selectedMedia.description && (
                <p className="text-gray-600">{selectedMedia.description}</p>
              )}
              <p className="text-sm text-gray-500">Date: {selectedMedia.date}</p>
              {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedMedia.tags.map((tag,index)=> (
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
  },[selectedMedia,isAdmin,handleDeleteMedia]);

  const GalleryContent=()=> {
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
            <p className="text-sm text-red-600 mt-2">
              This might be due to a missing column in the database. Please check the database setup.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{opacity: 0,x: -20}}
            animate={{opacity: 1,x: 0}}
            className="text-3xl font-bold text-gray-800"
          >
            Gallery
          </motion.h1>
          {isAdmin && (
            <button
              onClick={()=> setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Media</span>
            </button>
          )}
        </div>

        {/* Permission Notice */}
        <motion.div
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-blue-700">
            All media content is shared with appropriate permissions and consent from participants/parents/guardians.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={()=> setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter==='all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={()=> setFilter('image')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filter==='image' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <SafeIcon icon={FiCamera} className="w-4 h-4" />
              <span>Photos</span>
            </button>
            <button
              onClick={()=> setFilter('video')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                filter==='video' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <SafeIcon icon={FiVideo} className="w-4 h-4" />
              <span>Videos</span>
            </button>
          </div>

          {getAllTags.length > 0 && (
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiTag} className="w-4 h-4 text-gray-600" />
              <select
                value={tagFilter}
                onChange={(e)=> setTagFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tags</option>
                {getAllTags.map(tag=> (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Add Media Form */}
        {showAddForm && isAdmin && (
          <motion.div
            initial={{opacity: 0,y: -20}}
            animate={{opacity: 1,y: 0}}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Media</h2>
            <form onSubmit={handleAddMedia} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e)=> handleFormChange('type',e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="image">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e)=> handleFormChange('date',e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {formData.type==='video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Source</label>
                    <select
                      value={formData.videoType}
                      onChange={(e)=> handleFormChange('videoType',e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="googledrive">Google Drive</option>
                      <option value="dropbox">Dropbox</option>
                      <option value="direct">Direct Video File</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e)=> handleFormChange('title',e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type==='image' ? 'Image URL' : 'Video URL'} *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e)=> handleFormChange('url',e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    formData.type==='image' 
                      ? 'https://example.com/image.jpg'
                      : formData.videoType==='youtube'
                      ? 'https://www.youtube.com/watch?v=VIDEO_ID'
                      : formData.videoType==='dropbox'
                      ? 'https://www.dropbox.com/s/abc123/video.mp4'
                      : 'https://example.com/video.mp4'
                  }
                  required
                />
                {formData.type==='video' && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-start space-x-2">
                      <SafeIcon icon={FiInfo} className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        {formData.videoType==='youtube' && (
                          <p>Paste any YouTube URL (watch or embed format)</p>
                        )}
                        {formData.videoType==='vimeo' && (
                          <p>Paste a Vimeo video URL</p>
                        )}
                        {formData.videoType==='googledrive' && (
                          <p>Share your video publicly and paste the Google Drive link</p>
                        )}
                        {formData.videoType==='dropbox' && (
                          <p>Upload to Dropbox,share,and paste the link</p>
                        )}
                        {formData.videoType==='direct' && (
                          <p>Direct link to video file (.mp4,.webm,etc.)</p>
                        )}
                        {formData.videoType==='other' && (
                          <p>Any other video URL or embed code</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description - THE FIX IS HERE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  key="description-textarea" // Added stable key
                  value={formData.description}
                  onChange={(e)=> handleFormChange('description',e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Optional description of the media content"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  key="tags-input" // Added stable key
                  type="text"
                  value={formData.tags}
                  onChange={(e)=> handleFormChange('tags',e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="training,match,team (separate with commas)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Media
                </button>
                <button
                  type="button"
                  onClick={resetForm}
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
          {filteredMedia.map((item,index)=> (
            <motion.div
              key={item.id}
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              transition={{delay: index * 0.1}}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              onClick={()=> setSelectedMedia(item)}
            >
              <div className="aspect-video relative">
                {item.type==='image' ? (
                  <img 
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e)=> {
                      e.target.style.display='none';
                      e.target.nextElementSibling.style.display='flex';
                    }}
                  />
                ) : (
                  <VideoThumbnail item={item} />
                )}
                
                {/* Fallback for broken images */}
                <div className="hidden w-full h-full flex-col items-center justify-center bg-gray-100">
                  <SafeIcon icon={FiImage} className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Image unavailable</p>
                </div>

                {/* Media type badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.type==='image' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <SafeIcon icon={item.type==='image' ? FiCamera : FiVideo} className="w-3 h-3 mr-1" />
                    {item.type==='image' ? 'Photo' : 'Video'}
                  </span>
                </div>

                {/* Admin delete button */}
                {isAdmin && (
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e)=> {
                        e.stopPropagation();
                        handleDeleteMedia(item.id,item.title);
                      }}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Delete media"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Media info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                )}
                <p className="text-xs text-gray-500 mb-2">{item.date}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0,3).map((tag,tagIndex)=> (
                      <span 
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredMedia.length===0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiCamera} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No media found</p>
            <p className="text-gray-400">
              {filter==='all' && tagFilter==='all' 
                ? 'Upload photos and videos to build your gallery'
                : 'No media matches your current filters'
              }
            </p>
          </div>
        )}

        {/* Media Modal */}
        {MediaModal}

        {/* Line clamp styles */}
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

export default Gallery;