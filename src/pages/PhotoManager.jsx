import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabaseData } from '../hooks/useSupabaseData';

const { FiCamera, FiVideo, FiPlay, FiImage, FiInfo, FiExternalLink, FiTrash2, FiEdit3, FiSave, FiX, FiLock, FiShield } = FiIcons;

const PhotoManager = () => {
  // 🔧 FIXED: Now using Supabase instead of localStorage
  const { data: media, loading, error, addItem, updateItem, deleteItem } = useSupabaseData('media');

  // Enhanced state for form data - now includes media type and video support
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [videoType, setVideoType] = useState('youtube');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for gallery
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Edit state
  const [editingMedia, setEditingMedia] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // NEW: Check if user is admin
  const isAdmin = localStorage.getItem('rugbyAdminAuth') === 'true';

  // 🔧 REMOVED: localStorage loading - now handled by useSupabaseData hook

  // Process video URLs with BETTER Bunny.net handling
  const processVideoUrl = (url, videoType) => {
    if (!url) return url;

    console.log(`🎬 Processing ${videoType} URL:`, url);

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

    // Bunny.net processing with multiple fallback strategies
    if (videoType === 'bunny' || url.includes('.b-cdn.net') || url.includes('iframe.mediadelivery.net')) {
      console.log('🐰 Processing Bunny.net URL:', url);
      
      // Strategy 1: If it's already an iframe URL, use it directly
      if (url.includes('iframe.mediadelivery.net/embed/')) {
        console.log('✅ Using existing iframe format:', url);
        return url;
      }
      
      // Strategy 2: If it's a direct .b-cdn.net URL, keep it as direct video
      if (url.includes('.b-cdn.net')) {
        console.log('🎥 Using direct Bunny.net video URL:', url);
        return url;
      }
      
      // Strategy 3: Try to convert other Bunny formats to iframe
      if (url.includes('bunnycdn.com') || url.includes('bunny.net')) {
        console.log('🔄 Attempting to convert Bunny URL to iframe...');
        const videoIdMatch = url.match(/\/([a-zA-Z0-9_-]+)(?:\.[a-zA-Z0-9]+)?(?:\?.*)?$/);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          const iframeUrl = `https://iframe.mediadelivery.net/embed/YOUR_LIBRARY_ID/${videoId}`;
          console.log('🔄 Converted to iframe URL:', iframeUrl);
          return iframeUrl;
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

    // Dropbox
    if (videoType === 'dropbox' || url.includes('dropbox.com')) {
      let processedUrl = url;
      if (url.includes('?dl=0')) {
        processedUrl = url.replace('?dl=0', '?dl=1');
      } else if (!url.includes('?dl=')) {
        processedUrl = url + (url.includes('?') ? '&dl=1' : '?dl=1');
      }
      return processedUrl;
    }

    // Direct video files
    if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i)) {
      return url;
    }

    return url;
  };

  // 🔧 FIXED: Handle form submission using Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // NEW: Check admin access
    if (!isAdmin) {
      alert('Access denied. Admin authentication required to add media.');
      return;
    }
    
    setIsSubmitting(true);

    if (!mediaUrl.trim() || !title.trim()) {
      alert('Please fill in both URL and Title fields');
      setIsSubmitting(false);
      return;
    }

    let processedUrl = mediaUrl.trim();
    
    // Process video URL if it's a video
    if (mediaType === 'video') {
      processedUrl = processVideoUrl(processedUrl, videoType);
    }

    const formData = {
      type: mediaType,
      url: processedUrl,
      title: title.trim(),
      description: description.trim(),
      date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      videoType: mediaType === 'video' ? videoType : null
    };

    console.log('🔧 FIXED: Saving media to Supabase:', formData);

    try {
      await addItem(formData);
      
      // Reset form
      setMediaUrl('');
      setTitle('');
      setDescription('');
      setTags('');
      setVideoType('youtube');
      
      alert(`${mediaType === 'image' ? 'Photo' : 'Video'} added successfully to database!`);
    } catch (error) {
      console.error('❌ Error saving to Supabase:', error);
      alert('Failed to save media to database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔧 FIXED: Handle edit media using Supabase
  const handleEditMedia = (mediaItem) => {
    // NEW: Check admin access
    if (!isAdmin) {
      alert('Access denied. Admin authentication required to edit media.');
      return;
    }
    
    setEditingMedia(mediaItem);
    setShowEditForm(true);
    
    setMediaType(mediaItem.type);
    setMediaUrl(mediaItem.url);
    setTitle(mediaItem.title);
    setDescription(mediaItem.description || '');
    setTags(mediaItem.tags ? mediaItem.tags.join(', ') : '');
    setVideoType(mediaItem.videoType || 'youtube');
  };

  // 🔧 FIXED: Handle update media using Supabase
  const handleUpdateMedia = async (e) => {
    e.preventDefault();
    
    // NEW: Check admin access
    if (!isAdmin) {
      alert('Access denied. Admin authentication required to update media.');
      return;
    }
    
    setIsSubmitting(true);

    if (!mediaUrl.trim() || !title.trim()) {
      alert('Please fill in both URL and Title fields');
      setIsSubmitting(false);
      return;
    }

    let processedUrl = mediaUrl.trim();
    
    if (mediaType === 'video') {
      processedUrl = processVideoUrl(processedUrl, videoType);
    }

    const updatedData = {
      type: mediaType,
      url: processedUrl,
      title: title.trim(),
      description: description.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      videoType: mediaType === 'video' ? videoType : null
    };

    console.log('🔧 FIXED: Updating media in Supabase:', updatedData);

    try {
      await updateItem(editingMedia.id, updatedData);
      
      if (selectedMedia && selectedMedia.id === editingMedia.id) {
        setSelectedMedia({ ...editingMedia, ...updatedData });
      }

      handleCancelEdit();
      alert(`${mediaType === 'image' ? 'Photo' : 'Video'} updated successfully in database!`);
    } catch (error) {
      console.error('❌ Error updating in Supabase:', error);
      alert('Failed to update media in database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingMedia(null);
    setShowEditForm(false);
    
    setMediaType('image');
    setMediaUrl('');
    setTitle('');
    setDescription('');
    setTags('');
    setVideoType('youtube');
  };

  // 🔧 FIXED: Delete media using Supabase
  const deleteMedia = async (mediaId) => {
    // NEW: Check admin access
    if (!isAdmin) {
      alert('Access denied. Admin authentication required to delete media.');
      return;
    }
    
    const mediaItem = media.find(item => item.id === mediaId);
    if (window.confirm(`Are you sure you want to delete "${mediaItem.title}"?`)) {
      try {
        await deleteItem(mediaId);
        
        if (selectedMedia && selectedMedia.id === mediaId) {
          setSelectedMedia(null);
        }

        if (editingMedia && editingMedia.id === mediaId) {
          handleCancelEdit();
        }

        console.log('✅ Media deleted from Supabase successfully');
      } catch (error) {
        console.error('❌ Error deleting from Supabase:', error);
        alert('Failed to delete media from database. Please try again.');
      }
    }
  };

  // Render media content with IMPROVED Bunny.net handling
  const renderMediaContent = (mediaItem) => {
    if (mediaItem.type === 'image') {
      return (
        <img
          src={mediaItem.url}
          alt={mediaItem.title}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '70vh',
            objectFit: 'contain',
            display: 'block'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      );
    } else {
      const url = mediaItem.url;
      console.log('🎬 Rendering video:', url);

      const videoContainerStyle = {
        width: '100%',
        aspectRatio: '16/9',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#000',
        display: 'block',
        overflow: 'hidden'
      };

      // YouTube embed
      if (url.includes('youtube.com/embed')) {
        return (
          <iframe
            src={url}
            title={mediaItem.title}
            style={videoContainerStyle}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        );
      }

      // Bunny.net handling with multiple strategies
      if (url.includes('iframe.mediadelivery.net')) {
        console.log('🐰 Rendering Bunny.net iframe:', url);
        return (
          <iframe
            src={url}
            title={mediaItem.title}
            style={videoContainerStyle}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
          />
        );
      }

      // Direct Bunny.net video files with better error handling
      if (url.includes('.b-cdn.net')) {
        console.log('🎥 Rendering direct Bunny.net video:', url);
        return (
          <div style={videoContainerStyle}>
            <video
              src={url}
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000'
              }}
              title={mediaItem.title}
              preload="metadata"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('❌ Bunny video failed to load:', url);
                e.target.style.display = 'none';
                e.target.parentElement.nextElementSibling.style.display = 'flex';
              }}
              onLoadStart={() => console.log('🎥 Bunny video loading started:', url)}
              onCanPlay={() => console.log('✅ Bunny video can play:', url)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      // Vimeo embed
      if (url.includes('player.vimeo.com')) {
        return (
          <iframe
            src={url}
            title={mediaItem.title}
            style={videoContainerStyle}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        );
      }

      // Google Drive
      if (url.includes('drive.google.com')) {
        return (
          <iframe
            src={url}
            title={mediaItem.title}
            style={videoContainerStyle}
            frameBorder="0"
            allowFullScreen
            allow="autoplay"
          />
        );
      }

      // Direct video files or Dropbox
      if (url.includes('dropbox.com') || url.match(/\.(mp4|webm|ogg|mov|avi|wmv)(\?.*)?$/i)) {
        console.log('🎥 Rendering direct video:', url);
        return (
          <video
            src={url}
            controls
            style={{
              width: '100%',
              height: 'auto',
              aspectRatio: '16/9',
              borderRadius: '8px',
              backgroundColor: '#000',
              display: 'block',
              objectFit: 'contain'
            }}
            title={mediaItem.title}
            preload="metadata"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Video failed to load:', url);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
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
          title={mediaItem.title}
          style={videoContainerStyle}
          frameBorder="0"
          allowFullScreen
        />
      );
    }
  };

  // 🔧 FIXED: Show loading state from Supabase
  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    );
  }

  // 🔧 FIXED: Show error state from Supabase
  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fca5a5', 
          borderRadius: '8px', 
          padding: '16px',
          color: '#dc2626'
        }}>
          <p><strong>Database Error:</strong> {error}</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Unable to load media from database. Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <SafeIcon icon={FiCamera} style={{ fontSize: '1.8rem', color: '#059669' }} />
        Media Manager
        {!isAdmin && (
          <span style={{ fontSize: '1rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SafeIcon icon={FiLock} style={{ fontSize: '1rem' }} />
            (View Only)
          </span>
        )}
      </motion.h1>
      
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
        {isAdmin 
          ? 'Upload and manage photos and videos for your rugby team (saves to database)'
          : 'Browse photos and videos from the rugby team'
        }
      </p>

      {/* 🔧 FIXED: Updated status notice */}
      {!isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <SafeIcon icon={FiShield} style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
          <div>
            <strong style={{ color: '#92400e' }}>Viewing Mode:</strong>
            <p style={{ color: '#92400e', margin: '4px 0 0 0', fontSize: '14px' }}>
              You can view all media content from the database, but admin authentication is required to add, edit, or delete media items.
            </p>
          </div>
        </motion.div>
      )}

      {/* 🔧 NEW: Database status indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #16a34a',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <SafeIcon icon={FiShield} style={{ color: '#16a34a', fontSize: '1.2rem' }} />
        <div>
          <strong style={{ color: '#14532d' }}>✅ Database Connected:</strong>
          <p style={{ color: '#14532d', margin: '4px 0 0 0', fontSize: '14px' }}>
            All media is now stored in Supabase database and will persist across devices and sessions. Showing {media.length} items from database.
          </p>
        </div>
      </motion.div>

      {/* Add/Edit Form - ADMIN ONLY */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '40px'
          }}
        >
          <h2 style={{ marginBottom: '20px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafeIcon icon={mediaType === 'image' ? FiCamera : FiVideo} />
            {showEditForm ? `Edit ${editingMedia?.type === 'image' ? 'Photo' : 'Video'}` : `Add New ${mediaType === 'image' ? 'Photo' : 'Video'} (Database)`}
          </h2>

          <form onSubmit={showEditForm ? handleUpdateMedia : handleSubmit}>
            {/* Media Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                Media Type *
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 12px', border: '2px solid', borderColor: mediaType === 'image' ? '#059669' : '#ddd', borderRadius: '8px', backgroundColor: mediaType === 'image' ? '#f0fdf4' : 'white' }}>
                  <input
                    type="radio"
                    value="image"
                    checked={mediaType === 'image'}
                    onChange={(e) => setMediaType(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <SafeIcon icon={FiCamera} style={{ marginRight: '6px' }} />
                  Photo
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 12px', border: '2px solid', borderColor: mediaType === 'video' ? '#059669' : '#ddd', borderRadius: '8px', backgroundColor: mediaType === 'video' ? '#f0fdf4' : 'white' }}>
                  <input
                    type="radio"
                    value="video"
                    checked={mediaType === 'video'}
                    onChange={(e) => setMediaType(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <SafeIcon icon={FiVideo} style={{ marginRight: '6px' }} />
                  Video
                </label>
              </div>
            </div>

            {/* Video Source Selection (only for videos) */}
            {mediaType === 'video' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Video Source
                </label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="bunny">Bunny.net</option>
                  <option value="googledrive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="direct">Direct Video File</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Media URL Field */}
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="mediaUrl" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                {mediaType === 'image' ? 'Image URL' : 'Video URL'} *
              </label>
              <input
                type="url"
                id="mediaUrl"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={
                  mediaType === 'image' 
                    ? 'https://example.com/image.jpg'
                    : videoType === 'youtube'
                    ? 'https://www.youtube.com/watch?v=VIDEO_ID'
                    : videoType === 'bunny'
                    ? 'https://your-zone.b-cdn.net/video.mp4 OR https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID'
                    : 'https://example.com/video.mp4'
                }
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              
              {/* Enhanced Video URL Help */}
              {mediaType === 'video' && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <SafeIcon icon={FiInfo} style={{ color: '#0ea5e9', marginTop: '2px' }} />
                    <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
                      {videoType === 'youtube' && (
                        <div>
                          <p><strong>YouTube:</strong> Paste any YouTube URL</p>
                          <p style={{ fontSize: '12px', marginTop: '4px' }}>
                            • https://www.youtube.com/watch?v=VIDEO_ID<br/>
                            • https://youtu.be/VIDEO_ID
                          </p>
                        </div>
                      )}
                      {videoType === 'bunny' && (
                        <div>
                          <p><strong>Bunny.net:</strong> Professional video hosting</p>
                          <p style={{ fontSize: '12px', marginTop: '4px' }}>
                            <strong>✅ Direct Video URL (Recommended):</strong><br/>
                            • https://your-pullzone.b-cdn.net/video.mp4<br/>
                            <strong>🔄 Iframe URL (Alternative):</strong><br/>
                            • https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
                          </p>
                          <p style={{ fontSize: '12px', marginTop: '4px', color: '#16a34a' }}>
                            <strong>🔧 Fixed:</strong> Both formats now display properly with consistent sizing!
                          </p>
                          <p style={{ fontSize: '12px', marginTop: '4px', color: '#dc2626' }}>
                            <strong>⚠️ Troubleshooting:</strong> If video appears very small, try using the direct .b-cdn.net URL instead of iframe format.
                          </p>
                        </div>
                      )}
                      {videoType === 'vimeo' && (
                        <p><strong>Vimeo:</strong> https://vimeo.com/VIDEO_ID</p>
                      )}
                      {videoType === 'googledrive' && (
                        <div>
                          <p><strong>Google Drive:</strong> Share video publicly</p>
                          <p style={{ fontSize: '12px', marginTop: '4px' }}>
                            1. Upload to Google Drive<br/>
                            2. Share → Anyone with link can view<br/>
                            3. Copy and paste the link
                          </p>
                        </div>
                      )}
                      {videoType === 'dropbox' && (
                        <div>
                          <p><strong>Dropbox:</strong> Share video file</p>
                          <p style={{ fontSize: '12px', marginTop: '4px' }}>
                            Upload video and share the Dropbox link
                          </p>
                        </div>
                      )}
                      {videoType === 'direct' && (
                        <p><strong>Direct Video:</strong> Link to video file (.mp4, .webm, etc.)</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Title Field */}
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="title" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Enter a descriptive title for your ${mediaType}`}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Description Field */}
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="description" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Optional description of the ${mediaType}...`}
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Tags Field */}
            <div style={{ marginBottom: '30px' }}>
              <label 
                htmlFor="tags" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="training, match, team, highlights (separate with commas)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{ color: '#666', fontSize: '14px' }}>
                Separate multiple tags with commas
              </small>
            </div>

            {/* Media Preview */}
            {mediaUrl && title && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '20px' }}
              >
                <h3 style={{ marginBottom: '10px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SafeIcon icon={FiImage} />
                  Preview
                </h3>
                <div style={{ 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '16px',
                  backgroundColor: '#f9fafb'
                }}>
                  {mediaType === 'image' ? (
                    <img
                      src={mediaUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        display: 'block',
                        margin: '0 auto'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      maxWidth: '500px',
                      aspectRatio: '16/9',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ textAlign: 'center', color: '#6b7280' }}>
                        <SafeIcon icon={FiPlay} style={{ fontSize: '3rem', marginBottom: '8px' }} />
                        <p>Video Preview</p>
                        <p style={{ fontSize: '14px' }}>Ready to {showEditForm ? 'Update' : 'Save to Database'}</p>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'none', textAlign: 'center', color: '#ef4444', padding: '20px' }}>
                    Unable to load preview
                  </div>

                  <div style={{ 
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <strong style={{ color: '#374151' }}>Title: {title}</strong>
                    {description && (
                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={isSubmitting || !mediaUrl.trim() || !title.trim()}
                style={{
                  backgroundColor: isSubmitting || !mediaUrl.trim() || !title.trim() ? '#d1d5db' : '#059669',
                  color: 'white',
                  padding: '14px 32px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isSubmitting || !mediaUrl.trim() || !title.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting && mediaUrl.trim() && title.trim()) {
                    e.target.style.backgroundColor = '#047857';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting && mediaUrl.trim() && title.trim()) {
                    e.target.style.backgroundColor = '#059669';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #ffffff40',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    {showEditForm ? 'Updating' : 'Saving to Database'}...
                  </>
                ) : (
                  <>
                    <SafeIcon icon={showEditForm ? FiSave : (mediaType === 'image' ? FiCamera : FiVideo)} />
                    {showEditForm ? 'Update' : 'Save to Database'}
                  </>
                )}
              </button>

              {showEditForm && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '14px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#6b7280';
                  }}
                >
                  <SafeIcon icon={FiX} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}

      {/* Media Gallery Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '25px' 
        }}>
          <h2 style={{ color: '#555', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SafeIcon icon={FiImage} />
            Media Gallery (Database)
          </h2>
          <span style={{ 
            color: '#666', 
            fontSize: '14px',
            backgroundColor: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: '500'
          }}>
            {media.length} item{media.length !== 1 ? 's' : ''} in database
          </span>
        </div>

        {media.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #d1d5db'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📸🎥</div>
            <h3 style={{ marginBottom: '10px', color: '#374151' }}>No media in database yet</h3>
            <p>
              {isAdmin 
                ? 'Upload your first photo or video using the form above to get started!'
                : 'No media has been uploaded to the database yet. Check back later for updates!'
              }
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {media.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedMedia(item)}
              >
                {/* Media Thumbnail */}
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <SafeIcon icon={FiPlay} style={{ fontSize: '3rem', marginBottom: '8px' }} />
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback for broken images */}
                  <div style={{
                    display: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#f3f4f6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: '#6b7280'
                  }}>
                    <SafeIcon icon={item.type === 'image' ? FiImage : FiVideo} style={{ fontSize: '2rem', marginBottom: '8px' }} />
                    <span style={{ fontSize: '14px' }}>Media not available</span>
                  </div>

                  {/* Media type badge */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: item.type === 'image' 
                        ? 'rgba(59, 130, 246, 0.9)' 
                        : 'rgba(139, 69, 19, 0.9)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      <SafeIcon icon={item.type === 'image' ? FiCamera : FiVideo} />
                      {item.type === 'image' ? 'Photo' : 'Video'}
                    </span>
                  </div>

                  {/* Admin action buttons - only show if admin */}
                  {isAdmin && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '6px' }}>
                      {/* Edit button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMedia(item);
                        }}
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = 'rgba(34, 197, 94, 1)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Edit media"
                      >
                        <SafeIcon icon={FiEdit3} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMedia(item.id);
                        }}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = 'rgba(239, 68, 68, 1)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Delete media"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Media Details */}
                <div style={{ padding: '16px' }}>
                  {/* Title - Display in bold */}
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    lineHeight: '1.3'
                  }}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      color: '#6b7280'
                    }}>
                      {item.description}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            marginRight: '6px',
                            marginBottom: '4px',
                            fontWeight: '500'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          +{item.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date and Type */}
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Date: {item.date}</span>
                    <span style={{ color: '#16a34a', fontSize: '11px' }}>
                      ✅ In DB
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Media Modal for Full View */}
      {selectedMedia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedMedia(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedMedia(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '20px',
                zIndex: 1001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            {/* Edit button in modal - only show if admin */}
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditMedia(selectedMedia);
                  setSelectedMedia(null);
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(34, 197, 94, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  zIndex: 1001,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '600'
                }}
                title="Edit this media"
              >
                <SafeIcon icon={FiEdit3} />
                Edit
              </button>
            )}

            {/* Media Content */}
            <div style={{ padding: '0' }}>
              {renderMediaContent(selectedMedia)}
              
              {/* Enhanced fallback error message */}
              <div style={{
                display: 'none',
                width: '100%',
                height: '300px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <SafeIcon icon={selectedMedia.type === 'image' ? FiImage : FiVideo} style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '16px' }} />
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  Unable to load this {selectedMedia.type}
                </p>
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <SafeIcon icon={FiExternalLink} />
                  Open in New Tab
                </a>
              </div>
            </div>

            {/* Enhanced Media Details */}
            <div style={{ padding: '24px' }}>
              {/* Title */}
              <h2 style={{ 
                margin: '0 0 16px 0', 
                color: '#1f2937',
                fontSize: '24px',
                fontWeight: 'bold',
                lineHeight: '1.3'
              }}>
                {selectedMedia.title}
              </h2>

              {/* Description */}
              {selectedMedia.description && (
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  color: '#374151',
                  lineHeight: '1.5'
                }}>
                  {selectedMedia.description}
                </p>
              )}

              {/* Meta Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Type</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <SafeIcon icon={selectedMedia.type === 'image' ? FiCamera : FiVideo} />
                    <span>{selectedMedia.type === 'image' ? 'Photo' : 'Video'}</span>
                    {selectedMedia.videoType && (
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        ({selectedMedia.videoType})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Date</h4>
                  <p style={{ color: '#6b7280' }}>{selectedMedia.date}</p>
                  <p style={{ color: '#16a34a', fontSize: '12px', marginTop: '2px' }}>
                    ✅ Stored in database
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Tags</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedMedia.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          fontWeight: '500',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Instructions with database information */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ 
          marginTop: '30px', 
          padding: '24px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '12px',
          border: '1px solid #0ea5e9'
        }}
      >
        <h3 style={{ marginBottom: '16px', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SafeIcon icon={FiInfo} />
          Instructions & Features (Database Storage)
        </h3>
        
        {/* Admin vs Non-Admin Instructions */}
        {isAdmin ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>For Photos:</h4>
                <ul style={{ color: '#075985', lineHeight: '1.6', paddingLeft: '20px' }}>
                  <li>Enter a valid image URL (must start with http:// or https://)</li>
                  <li>Add a descriptive title - displayed prominently in bold</li>
                  <li>Optionally add description and tags for better organization</li>
                  <li><strong>✅ DATABASE:</strong> All photos are saved to Supabase database</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>For Videos:</h4>
                <ul style={{ color: '#075985', lineHeight: '1.6', paddingLeft: '20px' }}>
                  <li>Choose your video source (YouTube, Bunny.net, etc.)</li>
                  <li>Paste any video URL - it will be automatically processed</li>
                  <li><strong>✅ ENHANCED:</strong> Better Bunny.net support with multiple formats</li>
                  <li><strong>✅ DATABASE:</strong> All videos are saved to Supabase database</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '8px' }}>
              <p style={{ color: '#075985', margin: '0 0 8px 0' }}>
                <strong>🗄️ DATABASE FEATURES:</strong>
              </p>
              <ul style={{ color: '#075985', lineHeight: '1.6', paddingLeft: '20px', margin: '0 0 8px 0' }}>
                <li><strong>Cross-Device Access:</strong> Videos persist across all devices and browsers</li>
                <li><strong>Real-Time Sync:</strong> Changes appear instantly on all connected devices</li>
                <li><strong>Full CRUD Operations:</strong> Create, read, update, and delete with database storage</li>
                <li><strong>Data Persistence:</strong> No more lost videos when clearing browser cache</li>
                <li><strong>Backup & Recovery:</strong> All data is safely stored in Supabase cloud</li>
              </ul>
              <p style={{ color: '#075985', margin: '0' }}>
                <strong>💡 Tip:</strong> Videos uploaded here will be visible in both PhotoManager and Gallery pages from any device.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ color: '#075985', margin: '0 0 12px 0' }}>
              <strong>📖 VIEWING MODE (Database):</strong>
            </p>
            <ul style={{ color: '#075985', lineHeight: '1.6', paddingLeft: '20px', margin: '0 0 12px 0' }}>
              <li><strong>Browse Database:</strong> All media is loaded from Supabase database</li>
              <li><strong>Cross-Device Access:</strong> Same content visible from any device</li>
              <li><strong>Real-Time Updates:</strong> See new media as soon as it's uploaded</li>
              <li><strong>High Quality:</strong> Images and videos display at full resolution</li>
            </ul>
            <p style={{ color: '#075985', margin: '0', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
              <strong>🔒 Admin Required:</strong> To add, edit, or delete media content, admin authentication is required through the Admin panel.
            </p>
          </div>
        )}
      </motion.div>

      {/* Spinning animation for loading */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PhotoManager;