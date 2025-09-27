import React,{useState,useEffect} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {useSupabaseData} from '../hooks/useSupabaseData';
import ProtectedPage from '../components/ProtectedPage';

const {FiCamera,FiVideo,FiPlay,FiImage,FiInfo,FiExternalLink,FiTrash2,FiEdit3,FiSave,FiX,FiLock,FiShield,FiUpload,FiSearch,FiFilter,FiCalendar,FiTag,FiType,FiRefreshCw,FiDownload}=FiIcons;

const PhotoManager=()=> {
// 🔧 FIXED: Now using Supabase instead of localStorage
const {data: media,loading,error,addItem,updateItem,deleteItem}=useSupabaseData('media');

// Enhanced state for form data - now includes thumbnail support
const [mediaType,setMediaType]=useState('image');
const [mediaUrl,setMediaUrl]=useState('');
const [title,setTitle]=useState('');
const [description,setDescription]=useState('');
const [tags,setTags]=useState('');
const [videoType,setVideoType]=useState('youtube');
const [thumbnail,setThumbnail]=useState('');// NEW: Thumbnail URL
const [autoThumbnail,setAutoThumbnail]=useState(true);// NEW: Auto-generate thumbnail
const [isSubmitting,setIsSubmitting]=useState(false);

// State for gallery
const [selectedMedia,setSelectedMedia]=useState(null);

// Edit state
const [editingMedia,setEditingMedia]=useState(null);
const [showEditForm,setShowEditForm]=useState(false);

// NEW: Search and Filter State (REMOVED selectedVideoType)
const [searchQuery,setSearchQuery]=useState('');
const [selectedTag,setSelectedTag]=useState('');
const [selectedType,setSelectedType]=useState('');
const [dateRange,setDateRange]=useState({start: '',end: ''});
const [showAdvancedFilters,setShowAdvancedFilters]=useState(false);
const [sortBy,setSortBy]=useState('newest');

// NEW: Check if user is admin
const isAdmin=localStorage.getItem('rugbyAdminAuth')==='true';

// NEW: Get all unique tags from media for filter dropdown
const getAllTags=()=> {
const allTags=new Set();
media.forEach(item=> {
if (item.tags && Array.isArray(item.tags)) {
item.tags.forEach(tag=> allTags.add(tag));
}
});
return Array.from(allTags).sort();
};

// NEW: Filter and search media (REMOVED video type filtering)
const getFilteredMedia=()=> {
let filtered=[...media];

// Text search - search in title,description,and tags
if (searchQuery.trim()) {
const query=searchQuery.toLowerCase();
filtered=filtered.filter(item=> 
item.title.toLowerCase().includes(query) ||
(item.description && item.description.toLowerCase().includes(query)) ||
(item.tags && item.tags.some(tag=> tag.toLowerCase().includes(query)))
);
}

// Filter by media type
if (selectedType) {
filtered=filtered.filter(item=> item.type===selectedType);
}

// Filter by tag
if (selectedTag) {
filtered=filtered.filter(item=> 
item.tags && item.tags.includes(selectedTag)
);
}

// Filter by date range
if (dateRange.start) {
filtered=filtered.filter(item=> item.date >=dateRange.start);
}
if (dateRange.end) {
filtered=filtered.filter(item=> item.date <=dateRange.end);
}

// Sort results
switch (sortBy) {
case 'newest':
filtered.sort((a,b)=> new Date(b.date) - new Date(a.date));
break;
case 'oldest':
filtered.sort((a,b)=> new Date(a.date) - new Date(b.date));
break;
case 'title':
filtered.sort((a,b)=> a.title.localeCompare(b.title));
break;
case 'type':
filtered.sort((a,b)=> {
if (a.type !==b.type) return a.type.localeCompare(b.type);
return a.title.localeCompare(b.title);
});
break;
default:
break;
}

return filtered;
};

// NEW: Clear all filters (REMOVED selectedVideoType)
const clearAllFilters=()=> {
setSearchQuery('');
setSelectedTag('');
setSelectedType('');
setDateRange({start: '',end: ''});
setSortBy('newest');
};

// NEW: Get active filter count (REMOVED selectedVideoType)
const getActiveFilterCount=()=> {
let count=0;
if (searchQuery.trim()) count++;
if (selectedTag) count++;
if (selectedType) count++;
if (dateRange.start || dateRange.end) count++;
return count;
};

// 🆕 ENHANCED: Google Drive thumbnail extraction with multiple methods
const extractGoogleDriveVideoId=(url)=> {
if (!url || !url.includes('drive.google.com')) return null;

// Extract file ID from various Google Drive URL formats
const patterns=[
/\/file\/d\/([a-zA-Z0-9_-]+)/,
/id=([a-zA-Z0-9_-]+)/,
/\/d\/([a-zA-Z0-9_-]+)/,
/file\/d\/([a-zA-Z0-9_-]+)\/view/,
/file\/d\/([a-zA-Z0-9_-]+)\/preview/
];

for (const pattern of patterns) {
const match=url.match(pattern);
if (match && match[1]) {
return match[1];
}
}

return null;
};

// 🆕 NEW: Generate Google Drive video thumbnail with multiple fallback methods
const generateGoogleDriveThumbnail=(url)=> {
const fileId=extractGoogleDriveVideoId(url);
if (!fileId) {
console.warn('Could not extract Google Drive file ID from:',url);
return null;
}

console.log('🎬 Generating Google Drive thumbnail for file ID:',fileId);

// Method 1: Google Drive thumbnail API (primary method)
const driveThumbUrl=`https://drive.google.com/thumbnail?id=${fileId}&sz=w480-h270`;

// Method 2: Alternative thumbnail format
const altThumbUrl=`https://lh3.googleusercontent.com/d/${fileId}=w480-h270`;

// Return primary with fallback
return {
primary: driveThumbUrl,
fallback: altThumbUrl,
fileId: fileId
};
};

// 🆕 ENHANCED: Auto-generate thumbnail with Google Drive support
const generateThumbnail=(url,videoType)=> {
if (!url || !autoThumbnail) return '';

console.log('🖼️ Generating thumbnail for:',videoType,url);

// YouTube thumbnail generation
if (videoType==='youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
let videoId='';
if (url.includes('youtube.com/watch?v=')) {
videoId=new URLSearchParams(new URL(url).search).get('v');
} else if (url.includes('youtu.be/')) {
videoId=url.split('youtu.be/')[1].split('?')[0];
} else if (url.includes('youtube.com/embed/')) {
videoId=url.split('embed/')[1].split('?')[0];
}

if (videoId) {
// Try maxresdefault first (high quality),fallback to hqdefault
return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
}

// 🆕 ENHANCED: Google Drive thumbnail generation
if (videoType==='googledrive' || url.includes('drive.google.com')) {
const driveThumb=generateGoogleDriveThumbnail(url);
if (driveThumb) {
console.log('✅ Generated Google Drive thumbnail:',driveThumb.primary);
return driveThumb.primary;
}
}

// Vimeo thumbnail (requires API call,so we'll use a placeholder for now)
if (videoType==='vimeo' || url.includes('vimeo.com')) {
const videoId=url.match(/vimeo\.com\/(\d+)/)?.[1];
if (videoId) {
// Vimeo thumbnails require API calls,so we'll use a generic video thumbnail
return `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=480&h=270&fit=crop`;
}
}

// Bunny.net - use generic video thumbnail
if (videoType==='bunny' || url.includes('.b-cdn.net')) {
return `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=480&h=270&fit=crop`;
}

// Default video thumbnail
return `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=480&h=270&fit=crop`;
};

// Update thumbnail when video URL or type changes
useEffect(()=> {
if (mediaType==='video' && mediaUrl && autoThumbnail) {
const generatedThumbnail=generateThumbnail(mediaUrl,videoType);
setThumbnail(generatedThumbnail);
}
},[mediaUrl,videoType,mediaType,autoThumbnail]);

// Process video URLs with BETTER Bunny.net handling
const processVideoUrl=(url,videoType)=> {
if (!url) return url;

console.log(`🎬 Processing ${videoType} URL:`,url);

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
}
return url;
}

// Bunny.net processing with multiple fallback strategies
if (videoType==='bunny' || url.includes('.b-cdn.net') || url.includes('iframe.mediadelivery.net')) {
console.log('🐰 Processing Bunny.net URL:',url);

// Strategy 1: If it's already an iframe URL,use it directly
if (url.includes('iframe.mediadelivery.net/embed/')) {
console.log('✅ Using existing iframe format:',url);
return url;
}

// Strategy 2: If it's a direct .b-cdn.net URL,keep it as direct video
if (url.includes('.b-cdn.net')) {
console.log('🎥 Using direct Bunny.net video URL:',url);
return url;
}

// Strategy 3: Try to convert other Bunny formats to iframe
if (url.includes('bunnycdn.com') || url.includes('bunny.net')) {
console.log('🔄 Attempting to convert Bunny URL to iframe...');
const videoIdMatch=url.match(/\/([a-zA-Z0-9_-]+)(?:\.[a-zA-Z0-9]+)?(?:\?.*)?$/);
if (videoIdMatch) {
const videoId=videoIdMatch[1];
const iframeUrl=`https://iframe.mediadelivery.net/embed/YOUR_LIBRARY_ID/${videoId}`;
console.log('🔄 Converted to iframe URL:',iframeUrl);
return iframeUrl;
}
}

return url;
}

// Vimeo
if (videoType==='vimeo' || url.includes('vimeo.com')) {
if (url.includes('player.vimeo.com')) {
return url;
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
};

// 🔧 FIXED: Handle form submission using Supabase
const handleSubmit=async (e)=> {
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

let processedUrl=mediaUrl.trim();
let finalThumbnail=thumbnail;

// Process video URL if it's a video
if (mediaType==='video') {
processedUrl=processVideoUrl(processedUrl,videoType);

// Generate thumbnail if auto-thumbnail is enabled and no manual thumbnail provided
if (autoThumbnail && !thumbnail.trim()) {
finalThumbnail=generateThumbnail(processedUrl,videoType);
}
}

const formData={
type: mediaType,
url: processedUrl,
title: title.trim(),
description: description.trim(),
date: new Date().toISOString().split('T')[0],// Current date in YYYY-MM-DD format
tags: tags.split(',').map(tag=> tag.trim()).filter(tag=> tag !==''),
videoType: mediaType==='video' ? videoType : null,
thumbnail: mediaType==='video' ? finalThumbnail : '' // NEW: Include thumbnail
};

console.log('🔧 FIXED: Saving media to Supabase:',formData);

try {
await addItem(formData);
// Reset form
setMediaUrl('');
setTitle('');
setDescription('');
setTags('');
setVideoType('youtube');
setThumbnail('');
setAutoThumbnail(true);
alert(`${mediaType==='image' ? 'Photo' : 'Video'} added successfully to database!`);
} catch (error) {
console.error('❌ Error saving to Supabase:',error);
alert('Failed to save media to database. Please try again.');
} finally {
setIsSubmitting(false);
}
};

// 🔧 FIXED: Handle edit media using Supabase
const handleEditMedia=(mediaItem)=> {
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
setTags(mediaItem.tags ? mediaItem.tags.join(',') : '');
setVideoType(mediaItem.videoType || 'youtube');
setThumbnail(mediaItem.thumbnail || '');// NEW: Load existing thumbnail
setAutoThumbnail(false);// Disable auto-thumbnail when editing
};

// 🔧 FIXED: Handle update media using Supabase
const handleUpdateMedia=async (e)=> {
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

let processedUrl=mediaUrl.trim();
let finalThumbnail=thumbnail;

if (mediaType==='video') {
processedUrl=processVideoUrl(processedUrl,videoType);

// Generate thumbnail if auto-thumbnail is enabled and no manual thumbnail provided
if (autoThumbnail && !thumbnail.trim()) {
finalThumbnail=generateThumbnail(processedUrl,videoType);
}
}

const updatedData={
type: mediaType,
url: processedUrl,
title: title.trim(),
description: description.trim(),
tags: tags.split(',').map(tag=> tag.trim()).filter(tag=> tag !==''),
videoType: mediaType==='video' ? videoType : null,
thumbnail: mediaType==='video' ? finalThumbnail : '' // NEW: Include thumbnail
};

console.log('🔧 FIXED: Updating media in Supabase:',updatedData);

try {
await updateItem(editingMedia.id,updatedData);

if (selectedMedia && selectedMedia.id===editingMedia.id) {
setSelectedMedia({...editingMedia,...updatedData});
}

handleCancelEdit();
alert(`${mediaType==='image' ? 'Photo' : 'Video'} updated successfully in database!`);
} catch (error) {
console.error('❌ Error updating in Supabase:',error);
alert('Failed to update media in database. Please try again.');
} finally {
setIsSubmitting(false);
}
};

// Cancel edit
const handleCancelEdit=()=> {
setEditingMedia(null);
setShowEditForm(false);
setMediaType('image');
setMediaUrl('');
setTitle('');
setDescription('');
setTags('');
setVideoType('youtube');
setThumbnail('');
setAutoThumbnail(true);
};

// 🔧 FIXED: Delete media using Supabase
const deleteMedia=async (mediaId)=> {
// NEW: Check admin access
if (!isAdmin) {
alert('Access denied. Admin authentication required to delete media.');
return;
}

const mediaItem=media.find(item=> item.id===mediaId);
if (window.confirm(`Are you sure you want to delete "${mediaItem.title}"?`)) {
try {
await deleteItem(mediaId);

if (selectedMedia && selectedMedia.id===mediaId) {
setSelectedMedia(null);
}

if (editingMedia && editingMedia.id===mediaId) {
handleCancelEdit();
}

console.log('✅ Media deleted from Supabase successfully');
} catch (error) {
console.error('❌ Error deleting from Supabase:',error);
alert('Failed to delete media from database. Please try again.');
}
}
};

// 🆕 ENHANCED: Get video thumbnail with Google Drive support and fallbacks
const getVideoThumbnail=(mediaItem)=> {
// Use custom thumbnail if available
if (mediaItem.thumbnail) {
return mediaItem.thumbnail;
}

// 🆕 ENHANCED: Google Drive thumbnail generation with fallbacks
if (mediaItem.type==='video' && (mediaItem.videoType==='googledrive' || mediaItem.url.includes('drive.google.com'))) {
const driveThumb=generateGoogleDriveThumbnail(mediaItem.url);
if (driveThumb) {
return driveThumb.primary;
}
}

// Auto-generate thumbnail for existing videos without thumbnails
return generateThumbnail(mediaItem.url,mediaItem.videoType || 'youtube');
};

// 🆕 NEW: Bulk update Google Drive thumbnails for existing videos
const updateGoogleDriveVideoThumbnails=async ()=> {
if (!isAdmin) {
alert('Access denied. Admin authentication required.');
return;
}

const googleDriveVideos=media.filter(item=> 
item.type==='video' && 
(item.videoType==='googledrive' || item.url.includes('drive.google.com')) &&
!item.thumbnail
);

if (googleDriveVideos.length===0) {
alert('No Google Drive videos found that need thumbnail updates.');
return;
}

if (!window.confirm(`Update thumbnails for ${googleDriveVideos.length} Google Drive videos? This will generate new thumbnails automatically.`)) {
return;
}

let updated=0;
for (const video of googleDriveVideos) {
try {
const newThumbnail=generateThumbnail(video.url,'googledrive');
if (newThumbnail) {
await updateItem(video.id,{
...video,
thumbnail: newThumbnail
});
updated++;
}
} catch (error) {
console.error(`Failed to update thumbnail for ${video.title}:`,error);
}
}

alert(`Successfully updated thumbnails for ${updated} Google Drive videos!`);
};

// Render media content with IMPROVED Bunny.net handling
const renderMediaContent=(mediaItem)=> {
if (mediaItem.type==='image') {
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
onError={(e)=> {
e.target.style.display='none';
e.target.nextElementSibling.style.display='flex';
}}
/>
);
} else {
const url=mediaItem.url;
console.log('🎬 Rendering video:',url);

const videoContainerStyle={
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
allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
/>
);
}

// Bunny.net handling with multiple strategies
if (url.includes('iframe.mediadelivery.net')) {
console.log('🐰 Rendering Bunny.net iframe:',url);
return (
<iframe
src={url}
title={mediaItem.title}
style={videoContainerStyle}
frameBorder="0"
allowFullScreen
allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;fullscreen"
sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
/>
);
}

// Direct Bunny.net video files with better error handling
if (url.includes('.b-cdn.net')) {
console.log('🎥 Rendering direct Bunny.net video:',url);
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
onError={(e)=> {
console.error('❌ Bunny video failed to load:',url);
e.target.style.display='none';
e.target.parentElement.nextElementSibling.style.display='flex';
}}
onLoadStart={()=> console.log('🎥 Bunny video loading started:',url)}
onCanPlay={()=> console.log('✅ Bunny video can play:',url)}
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
allow="autoplay;fullscreen;picture-in-picture"
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
console.log('🎥 Rendering direct video:',url);
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
onError={(e)=> {
console.error('Video failed to load:',url);
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
title={mediaItem.title}
style={videoContainerStyle}
frameBorder="0"
allowFullScreen
/>
);
}
};

// Get filtered media for display
const filteredMedia=getFilteredMedia();
const activeFilterCount=getActiveFilterCount();
const allTags=getAllTags();

// Create the PhotoManagerContent component to be wrapped by ProtectedPage
const PhotoManagerContent=()=> {
// 🔧 FIXED: Show loading state from Supabase
if (loading) {
return (
<div style={{maxWidth: '1200px',margin: '0 auto',padding: '20px'}}>
<div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '300px'}}>
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
<div style={{maxWidth: '1200px',margin: '0 auto',padding: '20px'}}>
<div style={{
backgroundColor: '#fef2f2',
border: '1px solid #fca5a5',
borderRadius: '8px',
padding: '16px',
color: '#dc2626'
}}>
<p><strong>Database Error:</strong> {error}</p>
<p style={{fontSize: '14px',marginTop: '8px'}}>
Unable to load media from database. Please check your connection and try again.
</p>
</div>
</div>
);
}

return (
<div style={{maxWidth: '1200px',margin: '0 auto',padding: '20px'}}>
<motion.h1
initial={{opacity: 0,y: -20}}
animate={{opacity: 1,y: 0}}
style={{
fontSize: '2rem',
marginBottom: '1rem',
color: '#333',
display: 'flex',
alignItems: 'center',
gap: '12px'
}}
>
<SafeIcon icon={FiCamera} style={{fontSize: '1.8rem',color: '#059669'}} />
Media Gallery
{!isAdmin && (
<span style={{
fontSize: '1rem',
color: '#dc2626',
display: 'flex',
alignItems: 'center',
gap: '6px'
}}>
<SafeIcon icon={FiLock} style={{fontSize: '1rem'}} />
(View Only)
</span>
)}
</motion.h1>

<p style={{color: '#666',marginBottom: '2rem',fontSize: '1.1rem'}}>
{isAdmin ? 'Upload and manage photos and videos for your rugby team (saves to database)' : 'Browse photos and videos from the rugby team'}
</p>

{/* Admin status notices - only show to admin */}
{isAdmin && (
<>
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
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
<SafeIcon icon={FiShield} style={{color: '#f59e0b',fontSize: '1.2rem'}} />
<div>
<strong style={{color: '#92400e'}}>Admin Mode Active:</strong>
<p style={{color: '#92400e',margin: '4px 0 0 0',fontSize: '14px'}}>
You can add,edit,and delete media items. All changes are saved to the database.
</p>
</div>
</motion.div>

<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
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
<SafeIcon icon={FiShield} style={{color: '#16a34a',fontSize: '1.2rem'}} />
<div>
<strong style={{color: '#14532d'}}>✅ Database Connected:</strong>
<p style={{color: '#14532d',margin: '4px 0 0 0',fontSize: '14px'}}>
All media is now stored in Supabase database and will persist across devices and sessions. Showing {media.length} items from database.
<strong> Enhanced Google Drive video thumbnails now supported!</strong>
</p>
</div>
</motion.div>

{/* 🆕 NEW: Google Drive Thumbnail Update Tool */}
{media.filter(item=> item.type==='video' && (item.videoType==='googledrive' || item.url.includes('drive.google.com')) && !item.thumbnail).length > 0 && (
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
style={{
backgroundColor: '#dbeafe',
border: '1px solid #3b82f6',
borderRadius: '12px',
padding: '16px',
marginBottom: '30px'
}}
>
<div style={{display: 'flex',alignItems: 'center',justifyContent: 'space-between'}}>
<div style={{flex: 1}}>
<strong style={{color: '#1e40af',display: 'flex',alignItems: 'center',gap: '8px'}}>
<SafeIcon icon={FiDownload} />
Google Drive Thumbnail Update Available
</strong>
<p style={{color: '#1e40af',margin: '4px 0 0 0',fontSize: '14px'}}>
Found {media.filter(item=> item.type==='video' && (item.videoType==='googledrive' || item.url.includes('drive.google.com')) && !item.thumbnail).length} Google Drive videos without thumbnails. 
Click to auto-generate thumbnails for better gallery display.
</p>
</div>
<button
onClick={updateGoogleDriveVideoThumbnails}
style={{
backgroundColor: '#3b82f6',
color: 'white',
border: 'none',
borderRadius: '8px',
padding: '8px 16px',
cursor: 'pointer',
fontSize: '14px',
fontWeight: '600',
display: 'flex',
alignItems: 'center',
gap: '6px'
}}
>
<SafeIcon icon={FiRefreshCw} />
Update Thumbnails
</button>
</div>
</motion.div>
)}
</>
)}

{/* Add/Edit Form - ADMIN ONLY */}
{isAdmin && (
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
transition={{delay: 0.1}}
style={{
backgroundColor: 'white',
padding: '30px',
borderRadius: '12px',
boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
marginBottom: '40px'
}}
>
<h2 style={{
marginBottom: '20px',
color: '#555',
display: 'flex',
alignItems: 'center',
gap: '8px'
}}>
<SafeIcon icon={mediaType==='image' ? FiCamera : FiVideo} />
{showEditForm ? `Edit ${editingMedia?.type==='image' ? 'Photo' : 'Video'}` : `Add New ${mediaType==='image' ? 'Photo' : 'Video'} (Database)`}
</h2>

<form onSubmit={showEditForm ? handleUpdateMedia : handleSubmit}>
{/* Media Type Selection */}
<div style={{marginBottom: '20px'}}>
<label style={{
display: 'block',
marginBottom: '8px',
fontWeight: 'bold',
color: '#333'
}}>
Media Type *
</label>
<div style={{display: 'flex',gap: '12px'}}>
<label style={{
display: 'flex',
alignItems: 'center',
cursor: 'pointer',
padding: '8px 12px',
border: '2px solid',
borderColor: mediaType==='image' ? '#059669' : '#ddd',
borderRadius: '8px',
backgroundColor: mediaType==='image' ? '#f0fdf4' : 'white'
}}>
<input
type="radio"
value="image"
checked={mediaType==='image'}
onChange={(e)=> setMediaType(e.target.value)}
style={{marginRight: '8px'}}
/>
<SafeIcon icon={FiCamera} style={{marginRight: '6px'}} />
Photo
</label>
<label style={{
display: 'flex',
alignItems: 'center',
cursor: 'pointer',
padding: '8px 12px',
border: '2px solid',
borderColor: mediaType==='video' ? '#059669' : '#ddd',
borderRadius: '8px',
backgroundColor: mediaType==='video' ? '#f0fdf4' : 'white'
}}>
<input
type="radio"
value="video"
checked={mediaType==='video'}
onChange={(e)=> setMediaType(e.target.value)}
style={{marginRight: '8px'}}
/>
<SafeIcon icon={FiVideo} style={{marginRight: '6px'}} />
Video
</label>
</div>
</div>

{/* Video Source Selection (only for videos) */}
{mediaType==='video' && (
<div style={{marginBottom: '20px'}}>
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
onChange={(e)=> setVideoType(e.target.value)}
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
<div style={{marginBottom: '20px'}}>
<label htmlFor="mediaUrl" style={{
display: 'block',
marginBottom: '8px',
fontWeight: 'bold',
color: '#333'
}}>
{mediaType==='image' ? 'Image URL' : 'Video URL'} *
</label>
<input
type="url"
id="mediaUrl"
value={mediaUrl}
onChange={(e)=> setMediaUrl(e.target.value)}
placeholder={
mediaType==='image' ? 'https://example.com/image.jpg' :
videoType==='youtube' ? 'https://www.youtube.com/watch?v=VIDEO_ID' :
videoType==='bunny' ? 'https://your-zone.b-cdn.net/video.mp4 OR https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID' :
videoType==='googledrive' ? 'https://drive.google.com/file/d/FILE_ID/view' :
'https://example.com/video.mp4'
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
{mediaType==='video' && (
<div style={{
marginTop: '8px',
padding: '12px',
backgroundColor: '#f0f9ff',
borderRadius: '8px',
border: '1px solid #0ea5e9'
}}>
<div style={{display: 'flex',alignItems: 'flex-start',gap: '8px'}}>
<SafeIcon icon={FiInfo} style={{color: '#0ea5e9',marginTop: '2px'}} />
<div style={{fontSize: '14px',color: '#0c4a6e'}}>
{videoType==='youtube' && (
<div>
<p><strong>YouTube:</strong> Paste any YouTube URL</p>
<p style={{fontSize: '12px',marginTop: '4px'}}>
• https://www.youtube.com/watch?v=VIDEO_ID<br/>
• https://youtu.be/VIDEO_ID
</p>
</div>
)}
{videoType==='bunny' && (
<div>
<p><strong>Bunny.net:</strong> Professional video hosting</p>
<p style={{fontSize: '12px',marginTop: '4px'}}>
<strong>✅ Direct Video URL (Recommended):</strong><br/>
• https://your-pullzone.b-cdn.net/video.mp4<br/>
<strong>🔄 Iframe URL (Alternative):</strong><br/>
• https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
</p>
</div>
)}
{videoType==='vimeo' && (
<p><strong>Vimeo:</strong> https://vimeo.com/VIDEO_ID</p>
)}
{videoType==='googledrive' && (
<div>
<p><strong>Google Drive:</strong> Share video publicly</p>
<p style={{fontSize: '12px',marginTop: '4px'}}>
1. Upload video to Google Drive<br/>
2. Share → Anyone with link can view<br/>
3. Copy and paste the link<br/>
<strong>🖼️ Automatic thumbnail generation supported!</strong>
</p>
</div>
)}
{videoType==='dropbox' && (
<div>
<p><strong>Dropbox:</strong> Share video file</p>
<p style={{fontSize: '12px',marginTop: '4px'}}>
Upload video and share the Dropbox link
</p>
</div>
)}
{videoType==='direct' && (
<p><strong>Direct Video:</strong> Link to video file (.mp4,.webm,etc.)</p>
)}
</div>
</div>
</div>
)}
</div>

{/* Title Field */}
<div style={{marginBottom: '20px'}}>
<label htmlFor="title" style={{
display: 'block',
marginBottom: '8px',
fontWeight: 'bold',
color: '#333'
}}>
Title *
</label>
<input
type="text"
id="title"
value={title}
onChange={(e)=> setTitle(e.target.value)}
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
<div style={{marginBottom: '20px'}}>
<label htmlFor="description" style={{
display: 'block',
marginBottom: '8px',
fontWeight: 'bold',
color: '#333'
}}>
Description
</label>
<textarea
id="description"
value={description}
onChange={(e)=> setDescription(e.target.value)}
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

{/* 🆕 ENHANCED: Thumbnail Section for Videos with Google Drive support */}
{mediaType==='video' && (
<div style={{marginBottom: '20px'}}>
<label style={{
display: 'block',
marginBottom: '8px',
fontWeight: 'bold',
color: '#333'
}}>
Video Thumbnail
</label>

{/* Auto-generate toggle */}
<div style={{marginBottom: '12px'}}>
<label style={{
display: 'flex',
alignItems: 'center',
cursor: 'pointer'
}}>
<input
type="checkbox"
checked={autoThumbnail}
onChange={(e)=> setAutoThumbnail(e.target.checked)}
style={{marginRight: '8px'}}
/>
<span style={{fontSize: '14px',color: '#374151'}}>
Auto-generate thumbnail from video URL
{videoType==='googledrive' && (
<span style={{color: '#16a34a',fontWeight: '600'}}> (Enhanced for Google Drive!)</span>
)}
</span>
</label>
</div>

{/* Manual thumbnail URL input */}
{!autoThumbnail && (
<div>
<input
type="url"
value={thumbnail}
onChange={(e)=> setThumbnail(e.target.value)}
placeholder="https://example.com/thumbnail.jpg"
style={{
width: '100%',
padding: '12px',
border: '2px solid #ddd',
borderRadius: '8px',
fontSize: '16px',
boxSizing: 'border-box'
}}
/>
<p style={{fontSize: '12px',color: '#6b7280',marginTop: '4px'}}>
Enter a custom thumbnail URL,or leave empty to use auto-generated thumbnail
</p>
</div>
)}

{/* Thumbnail preview */}
{(thumbnail || (autoThumbnail && mediaUrl)) && (
<div style={{marginTop: '12px'}}>
<p style={{
fontSize: '14px',
fontWeight: '600',
color: '#374151',
marginBottom: '8px'
}}>
Thumbnail Preview:
</p>
<img
src={thumbnail || (autoThumbnail ? generateThumbnail(mediaUrl,videoType) : '')}
alt="Video thumbnail preview"
style={{
width: '200px',
height: '112px',
objectFit: 'cover',
borderRadius: '8px',
border: '2px solid #e5e7eb'
}}
onError={(e)=> {
e.target.style.display='none';
e.target.nextElementSibling.style.display='block';
}}
/>
<div style={{
display: 'none',
width: '200px',
height: '112px',
backgroundColor: '#f3f4f6',
borderRadius: '8px',
border: '2px solid #e5e7eb',
alignItems: 'center',
justifyContent: 'center',
color: '#6b7280',
fontSize: '12px'
}}>
Thumbnail not available
</div>
</div>
)}

<div style={{
marginTop: '8px',
padding: '12px',
backgroundColor: '#f0f9ff',
borderRadius: '8px',
border: '1px solid #0ea5e9'
}}>
<div style={{display: 'flex',alignItems: 'flex-start',gap: '8px'}}>
<SafeIcon icon={FiImage} style={{color: '#0ea5e9',marginTop: '2px'}} />
<div style={{fontSize: '14px',color: '#0c4a6e'}}>
<p><strong>🖼️ Thumbnail Support!</strong></p>
<ul style={{fontSize: '12px',marginTop: '4px',paddingLeft: '16px'}}>
<li><strong>Auto-generate:</strong> YouTube & Google Drive videos get high-quality thumbnails automatically</li>
<li><strong>Google Drive:</strong> Enhanced thumbnail extraction using Google Drive API endpoints</li>
<li><strong>Custom thumbnails:</strong> Upload your own thumbnail to any image hosting service</li>
<li><strong>Better browsing:</strong> Videos now show preview images in the gallery</li>
<li><strong>Fallback:</strong> Generic video thumbnails for unsupported platforms</li>
</ul>
</div>
</div>
</div>
</div>
)}

{/* Tags Field */}
<div style={{marginBottom: '30px'}}>
<label htmlFor="tags" style={{
display: 'block',
marginBottom: '8px',
fontWeight: 'bold',
color: '#333'
}}>
Tags
</label>
<input
type="text"
id="tags"
value={tags}
onChange={(e)=> setTags(e.target.value)}
placeholder="training,match,team,highlights (separate with commas)"
style={{
width: '100%',
padding: '12px',
border: '2px solid #ddd',
borderRadius: '8px',
fontSize: '16px',
boxSizing: 'border-box'
}}
/>
<small style={{color: '#666',fontSize: '14px'}}>
Separate multiple tags with commas
</small>
</div>

{/* Media Preview */}
{mediaUrl && title && (
<motion.div
initial={{opacity: 0,y: 10}}
animate={{opacity: 1,y: 0}}
style={{marginBottom: '20px'}}
>
<h3 style={{
marginBottom: '10px',
color: '#555',
display: 'flex',
alignItems: 'center',
gap: '8px'
}}>
<SafeIcon icon={FiImage} />
Preview
</h3>
<div style={{
border: '2px solid #e5e7eb',
borderRadius: '12px',
padding: '16px',
backgroundColor: '#f9fafb'
}}>
{mediaType==='image' ? (
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
onError={(e)=> {
e.target.style.display='none';
e.target.nextElementSibling.style.display='block';
}}
/>
) : (
<div style={{display: 'flex',gap: '16px',alignItems: 'flex-start'}}>
{/* Video preview placeholder */}
<div style={{
width: '300px',
aspectRatio: '16/9',
backgroundColor: '#f3f4f6',
borderRadius: '8px',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
border: '2px dashed #d1d5db',
flexShrink: 0
}}>
<div style={{textAlign: 'center',color: '#6b7280'}}>
<SafeIcon icon={FiPlay} style={{fontSize: '3rem',marginBottom: '8px'}} />
<p>Video Preview</p>
<p style={{fontSize: '14px'}}>Ready to {showEditForm ? 'Update' : 'Save to Database'}</p>
</div>
</div>

{/* Thumbnail preview */}
{(thumbnail || (autoThumbnail && mediaUrl)) && (
<div style={{flex: 1}}>
<p style={{
fontSize: '14px',
fontWeight: '600',
color: '#374151',
marginBottom: '8px'
}}>
Thumbnail:
</p>
<img
src={thumbnail || (autoThumbnail ? generateThumbnail(mediaUrl,videoType) : '')}
alt="Thumbnail preview"
style={{
width: '160px',
height: '90px',
objectFit: 'cover',
borderRadius: '8px',
border: '2px solid #e5e7eb'
}}
onError={(e)=> {
e.target.style.display='none';
e.target.nextElementSibling.style.display='block';
}}
/>
<div style={{
display: 'none',
width: '160px',
height: '90px',
backgroundColor: '#f3f4f6',
borderRadius: '8px',
border: '2px solid #e5e7eb',
alignItems: 'center',
justifyContent: 'center',
color: '#6b7280',
fontSize: '12px'
}}>
Thumbnail not available
</div>
</div>
)}
</div>
)}
<div style={{
display: 'none',
textAlign: 'center',
color: '#ef4444',
padding: '20px'
}}>
Unable to load preview
</div>
<div style={{
marginTop: '12px',
padding: '8px',
backgroundColor: 'white',
borderRadius: '8px',
border: '1px solid #e5e7eb'
}}>
<strong style={{color: '#374151'}}>Title: {title}</strong>
{description && (
<p style={{
margin: '4px 0 0 0',
color: '#6b7280',
fontSize: '14px'
}}>
{description}
</p>
)}
</div>
</div>
</motion.div>
)}

{/* Submit Buttons */}
<div style={{display: 'flex',gap: '12px'}}>
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
onMouseOver={(e)=> {
if (!isSubmitting && mediaUrl.trim() && title.trim()) {
e.target.style.backgroundColor='#047857';
e.target.style.transform='translateY(-1px)';
}
}}
onMouseOut={(e)=> {
if (!isSubmitting && mediaUrl.trim() && title.trim()) {
e.target.style.backgroundColor='#059669';
e.target.style.transform='translateY(0)';
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
<SafeIcon icon={showEditForm ? FiSave : (mediaType==='image' ? FiCamera : FiVideo)} />
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
onMouseOver={(e)=> {
e.target.style.backgroundColor='#4b5563';
}}
onMouseOut={(e)=> {
e.target.style.backgroundColor='#6b7280';
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

{/* NEW: Search and Filter Section */}
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
transition={{delay: 0.2}}
style={{
backgroundColor: 'white',
padding: '24px',
borderRadius: '12px',
boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
marginBottom: '30px'
}}
>
<div style={{
display: 'flex',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: '20px'
}}>
<h2 style={{
color: '#555',
margin: 0,
display: 'flex',
alignItems: 'center',
gap: '8px'
}}>
<SafeIcon icon={FiSearch} />
Search & Filter Media
</h2>
<div style={{display: 'flex',alignItems: 'center',gap: '12px'}}>
{activeFilterCount > 0 && (
<span style={{
backgroundColor: '#dbeafe',
color: '#1e40af',
padding: '4px 8px',
borderRadius: '12px',
fontSize: '12px',
fontWeight: '600'
}}>
{activeFilterCount} filter{activeFilterCount !==1 ? 's' : ''} active
</span>
)}
<button
onClick={()=> setShowAdvancedFilters(!showAdvancedFilters)}
style={{
backgroundColor: '#f3f4f6',
color: '#374151',
border: '1px solid #d1d5db',
padding: '8px 12px',
borderRadius: '8px',
cursor: 'pointer',
fontSize: '14px',
display: 'flex',
alignItems: 'center',
gap: '6px'
}}
>
<SafeIcon icon={FiFilter} />
{showAdvancedFilters ? 'Hide' : 'Show'} Filters
</button>
{activeFilterCount > 0 && (
<button
onClick={clearAllFilters}
style={{
backgroundColor: '#fee2e2',
color: '#dc2626',
border: '1px solid #fca5a5',
padding: '8px 12px',
borderRadius: '8px',
cursor: 'pointer',
fontSize: '14px',
display: 'flex',
alignItems: 'center',
gap: '6px'
}}
>
<SafeIcon icon={FiRefreshCw} />
Clear All
</button>
)}
</div>
</div>

{/* Main Search Bar */}
<div style={{marginBottom: showAdvancedFilters ? '20px' : '0'}}>
<div style={{position: 'relative'}}>
<SafeIcon icon={FiSearch} style={{
position: 'absolute',
left: '12px',
top: '50%',
transform: 'translateY(-50%)',
color: '#6b7280',
fontSize: '18px'
}} />
<input
type="text"
value={searchQuery}
onChange={(e)=> setSearchQuery(e.target.value)}
placeholder="Search by title,description,or tags..."
style={{
width: '100%',
padding: '12px 12px 12px 44px',
border: '2px solid #d1d5db',
borderRadius: '8px',
fontSize: '16px',
boxSizing: 'border-box'
}}
/>
</div>
</div>

{/* Advanced Filters - REMOVED Video Source Filter */}
{showAdvancedFilters && (
<motion.div
initial={{opacity: 0,height: 0}}
animate={{opacity: 1,height: 'auto'}}
exit={{opacity: 0,height: 0}}
style={{
borderTop: '1px solid #e5e7eb',
paddingTop: '20px'
}}
>
<div style={{
display: 'grid',
gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
gap: '16px',
marginBottom: '16px'
}}>
{/* Media Type Filter */}
<div>
<label style={{
display: 'block',
fontSize: '14px',
fontWeight: '600',
color: '#374151',
marginBottom: '6px'
}}>
<SafeIcon icon={FiType} style={{marginRight: '6px'}} />
Media Type
</label>
<select
value={selectedType}
onChange={(e)=> setSelectedType(e.target.value)}
style={{
width: '100%',
padding: '8px',
border: '1px solid #d1d5db',
borderRadius: '6px',
fontSize: '14px'
}}
>
<option value="">All Types</option>
<option value="image">Photos Only</option>
<option value="video">Videos Only</option>
</select>
</div>

{/* Tag Filter */}
{allTags.length > 0 && (
<div>
<label style={{
display: 'block',
fontSize: '14px',
fontWeight: '600',
color: '#374151',
marginBottom: '6px'
}}>
<SafeIcon icon={FiTag} style={{marginRight: '6px'}} />
Tag
</label>
<select
value={selectedTag}
onChange={(e)=> setSelectedTag(e.target.value)}
style={{
width: '100%',
padding: '8px',
border: '1px solid #d1d5db',
borderRadius: '6px',
fontSize: '14px'
}}
>
<option value="">All Tags</option>
{allTags.map(tag=> (
<option key={tag} value={tag}>
{tag}
</option>
))}
</select>
</div>
)}

{/* Sort By */}
<div>
<label style={{
display: 'block',
fontSize: '14px',
fontWeight: '600',
color: '#374151',
marginBottom: '6px'
}}>
<SafeIcon icon={FiCalendar} style={{marginRight: '6px'}} />
Sort By
</label>
<select
value={sortBy}
onChange={(e)=> setSortBy(e.target.value)}
style={{
width: '100%',
padding: '8px',
border: '1px solid #d1d5db',
borderRadius: '6px',
fontSize: '14px'
}}
>
<option value="newest">Newest First</option>
<option value="oldest">Oldest First</option>
<option value="title">Title A-Z</option>
<option value="type">Type (Photos/Videos)</option>
</select>
</div>
</div>

{/* Date Range Filter */}
<div style={{
display: 'grid',
gridTemplateColumns: '1fr 1fr',
gap: '12px'
}}>
<div>
<label style={{
display: 'block',
fontSize: '14px',
fontWeight: '600',
color: '#374151',
marginBottom: '6px'
}}>
From Date
</label>
<input
type="date"
value={dateRange.start}
onChange={(e)=> setDateRange({...dateRange,start: e.target.value})}
style={{
width: '100%',
padding: '8px',
border: '1px solid #d1d5db',
borderRadius: '6px',
fontSize: '14px'
}}
/>
</div>
<div>
<label style={{
display: 'block',
fontSize: '14px',
fontWeight: '600',
color: '#374151',
marginBottom: '6px'
}}>
To Date
</label>
<input
type="date"
value={dateRange.end}
onChange={(e)=> setDateRange({...dateRange,end: e.target.value})}
style={{
width: '100%',
padding: '8px',
border: '1px solid #d1d5db',
borderRadius: '6px',
fontSize: '14px'
}}
/>
</div>
</div>
</motion.div>
)}
</motion.div>

{/* Media Gallery Section */}
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
transition={{delay: 0.3}}
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
<h2 style={{
color: '#555',
margin: 0,
display: 'flex',
alignItems: 'center',
gap: '8px'
}}>
<SafeIcon icon={FiImage} />
Media Gallery {isAdmin && '(Database)'}
</h2>
<div style={{display: 'flex',alignItems: 'center',gap: '12px'}}>
{searchQuery || selectedTag || selectedType || dateRange.start || dateRange.end ? (
<span style={{
color: '#666',
fontSize: '14px',
backgroundColor: '#dbeafe',
padding: '6px 12px',
borderRadius: '20px',
fontWeight: '500'
}}>
Showing {filteredMedia.length} of {media.length} items
</span>
) : (
<span style={{
color: '#666',
fontSize: '14px',
backgroundColor: '#f3f4f6',
padding: '6px 12px',
borderRadius: '20px',
fontWeight: '500'
}}>
{media.length} item{media.length !==1 ? 's' : ''} {isAdmin && 'in database'}
</span>
)}
</div>
</div>

{filteredMedia.length===0 ? (
<div style={{
textAlign: 'center',
padding: '60px 20px',
color: '#6b7280',
backgroundColor: '#f9fafb',
borderRadius: '12px',
border: '2px dashed #d1d5db'
}}>
<div style={{fontSize: '4rem',marginBottom: '20px'}}>
{media.length===0 ? '📸🎥' : '🔍'}
</div>
<h3 style={{marginBottom: '10px',color: '#374151'}}>
{media.length===0 ? `No media ${isAdmin ? 'in database' : ''} yet` : 'No media matches your search'}
</h3>
<p>
{media.length===0 ? 
(isAdmin ? 'Upload your first photo or video using the form above to get started!' : 'No media has been uploaded yet. Check back later for updates!') : 
'Try adjusting your search terms or filters to find what you\'re looking for.'
}
</p>
{activeFilterCount > 0 && (
<button
onClick={clearAllFilters}
style={{
marginTop: '16px',
backgroundColor: '#3b82f6',
color: 'white',
border: 'none',
padding: '8px 16px',
borderRadius: '8px',
cursor: 'pointer',
fontSize: '14px'
}}
>
Clear All Filters
</button>
)}
</div>
) : (
<div style={{
display: 'grid',
gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
gap: '20px'
}}>
{filteredMedia.map((item)=> (
<motion.div
key={item.id}
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
whileHover={{y: -4}}
transition={{duration: 0.2}}
style={{
border: '1px solid #e5e7eb',
borderRadius: '12px',
overflow: 'hidden',
backgroundColor: 'white',
boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
cursor: 'pointer'
}}
onClick={()=> setSelectedMedia(item)}
>
{/* Media Thumbnail */}
<div style={{position: 'relative',height: '200px',overflow: 'hidden'}}>
{item.type==='image' ? (
<img
src={item.url}
alt={item.title}
style={{
width: '100%',
height: '100%',
objectFit: 'cover'
}}
onError={(e)=> {
e.target.style.display='none';
e.target.nextElementSibling.style.display='flex';
}}
/>
) : (
// 🔧 REMOVED: All Google Drive badges and indicators from thumbnail
<div style={{position: 'relative',width: '100%',height: '100%'}}>
<img
src={getVideoThumbnail(item)}
alt={`${item.title} thumbnail`}
style={{
width: '100%',
height: '100%',
objectFit: 'cover'
}}
onError={(e)=> {
e.target.style.display='none';
e.target.nextElementSibling.style.display='flex';
}}
/>
{/* Play button overlay */}
<div style={{
position: 'absolute',
top: '50%',
left: '50%',
transform: 'translate(-50%,-50%)',
width: '60px',
height: '60px',
backgroundColor: 'rgba(0,0,0,0.7)',
borderRadius: '50%',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
color: 'white'
}}>
<SafeIcon icon={FiPlay} style={{fontSize: '24px',marginLeft: '4px'}} />
</div>
{/* 🔧 REMOVED: Google Drive indicator badge */}
{/* Fallback for broken thumbnails */}
<div style={{
display: 'none',
width: '100%',
height: '100%',
background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
alignItems: 'center',
justifyContent: 'center',
color: 'white'
}}>
<div style={{textAlign: 'center'}}>
<SafeIcon icon={FiPlay} style={{fontSize: '3rem',marginBottom: '8px'}} />
<p style={{fontSize: '14px'}}>Video</p>
</div>
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
<SafeIcon icon={item.type==='image' ? FiImage : FiVideo} style={{fontSize: '2rem',marginBottom: '8px'}} />
<span style={{fontSize: '14px'}}>Media not available</span>
</div>

{/* Media type badge */}
<div style={{position: 'absolute',top: '8px',right: '8px'}}>
<span style={{
display: 'inline-flex',
alignItems: 'center',
gap: '4px',
backgroundColor: item.type==='image' ? 'rgba(59,130,246,0.9)' : 'rgba(139,69,19,0.9)',
color: 'white',
padding: '4px 8px',
borderRadius: '6px',
fontSize: '12px',
fontWeight: '600'
}}>
<SafeIcon icon={item.type==='image' ? FiCamera : FiVideo} />
{item.type==='image' ? 'Photo' : 'Video'}
</span>
</div>

{/* Admin action buttons - only show if admin */}
{isAdmin && (
<div style={{
position: 'absolute',
top: '8px',
left: '8px',
display: 'flex',
gap: '6px'
}}>
{/* Edit button */}
<button
onClick={(e)=> {
e.stopPropagation();
handleEditMedia(item);
}}
style={{
backgroundColor: 'rgba(34,197,94,0.9)',
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
onMouseOver={(e)=> {
e.target.style.backgroundColor='rgba(34,197,94,1)';
e.target.style.transform='scale(1.1)';
}}
onMouseOut={(e)=> {
e.target.style.backgroundColor='rgba(34,197,94,0.9)';
e.target.style.transform='scale(1)';
}}
title="Edit media"
>
<SafeIcon icon={FiEdit3} />
</button>
{/* Delete button */}
<button
onClick={(e)=> {
e.stopPropagation();
deleteMedia(item.id);
}}
style={{
backgroundColor: 'rgba(239,68,68,0.9)',
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
onMouseOver={(e)=> {
e.target.style.backgroundColor='rgba(239,68,68,1)';
e.target.style.transform='scale(1.1)';
}}
onMouseOut={(e)=> {
e.target.style.backgroundColor='rgba(239,68,68,0.9)';
e.target.style.transform='scale(1)';
}}
title="Delete media"
>
<SafeIcon icon={FiTrash2} />
</button>
</div>
)}
</div>

{/* Media Details */}
<div style={{padding: '16px'}}>
{/* Title - Display in bold */}
<h3 style={{
margin: '0 0 8px 0',
fontSize: '16px',
fontWeight: 'bold',
color: '#1f2937',
lineHeight: '1.3'
}}>
{item.title}
{/* 🔧 REMOVED: Google Drive enhanced indicator */}
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
<div style={{marginBottom: '12px'}}>
{item.tags.slice(0,3).map((tag,index)=> (
<span
key={index}
style={{
display: 'inline-block',
backgroundColor: selectedTag===tag ? '#dbeafe' : '#f3f4f6',
color: selectedTag===tag ? '#1e40af' : '#6b7280',
padding: '2px 8px',
borderRadius: '12px',
fontSize: '12px',
marginRight: '6px',
marginBottom: '4px',
fontWeight: '500',
cursor: 'pointer',
border: selectedTag===tag ? '1px solid #3b82f6' : '1px solid transparent'
}}
onClick={(e)=> {
e.stopPropagation();
setSelectedTag(selectedTag===tag ? '' : tag);
}}
>
{tag}
</span>
))}
{item.tags.length > 3 && (
<span style={{fontSize: '12px',color: '#9ca3af'}}>
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
{isAdmin && (
<span style={{color: '#16a34a',fontSize: '11px'}}>
✅ In DB
</span>
)}
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
initial={{opacity: 0}}
animate={{opacity: 1}}
exit={{opacity: 0}}
style={{
position: 'fixed',
top: 0,
left: 0,
right: 0,
bottom: 0,
backgroundColor: 'rgba(0,0,0,0.8)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
zIndex: 1000,
padding: '20px'
}}
onClick={()=> setSelectedMedia(null)}
>
<motion.div
initial={{scale: 0.9,opacity: 0}}
animate={{scale: 1,opacity: 1}}
exit={{scale: 0.9,opacity: 0}}
style={{
backgroundColor: 'white',
borderRadius: '12px',
maxWidth: '90vw',
maxHeight: '90vh',
overflow: 'auto',
position: 'relative'
}}
onClick={(e)=> e.stopPropagation()}
>
{/* Close button */}
<button
onClick={()=> setSelectedMedia(null)}
style={{
position: 'absolute',
top: '12px',
right: '12px',
backgroundColor: 'rgba(0,0,0,0.7)',
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
onClick={(e)=> {
e.stopPropagation();
handleEditMedia(selectedMedia);
setSelectedMedia(null);
}}
style={{
position: 'absolute',
top: '12px',
left: '12px',
backgroundColor: 'rgba(34,197,94,0.9)',
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
<div style={{padding: '0'}}>
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
<SafeIcon icon={selectedMedia.type==='image' ? FiImage : FiVideo} style={{
fontSize: '4rem',
color: '#d1d5db',
marginBottom: '16px'
}} />
<p style={{color: '#6b7280',marginBottom: '16px'}}>
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

{/* 🔧 CLEANED: Simplified Media Details - Removed all technical information */}
<div style={{padding: '24px'}}>
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

{/* 🔧 SIMPLIFIED: Basic Info Only */}
<div style={{
display: 'grid',
gridTemplateColumns: '1fr 1fr',
gap: '16px',
marginBottom: '16px'
}}>
<div>
<h4 style={{fontWeight: '600',color: '#374151',marginBottom: '4px'}}>Type</h4>
<div style={{display: 'flex',alignItems: 'center',gap: '6px'}}>
<SafeIcon icon={selectedMedia.type==='image' ? FiCamera : FiVideo} />
<span>{selectedMedia.type==='image' ? 'Photo' : 'Video'}</span>
{/* 🔧 REMOVED: Video source/type details */}
</div>
</div>
<div>
<h4 style={{fontWeight: '600',color: '#374151',marginBottom: '4px'}}>Date</h4>
<p style={{color: '#6b7280'}}>{selectedMedia.date}</p>
{isAdmin && (
<p style={{color: '#16a34a',fontSize: '12px',marginTop: '2px'}}>
✅ Stored in database
</p>
)}
</div>
</div>

{/* 🔧 REMOVED: Entire Thumbnail section for videos */}

{/* Tags */}
{selectedMedia.tags && selectedMedia.tags.length > 0 && (
<div>
<h4 style={{fontWeight: '600',color: '#374151',marginBottom: '8px'}}>Tags</h4>
<div style={{display: 'flex',flexWrap: 'wrap',gap: '6px'}}>
{selectedMedia.tags.map((tag,index)=> (
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
border: '1px solid #bfdbfe',
cursor: 'pointer'
}}
onClick={(e)=> {
e.stopPropagation();
setSelectedTag(tag);
setSelectedMedia(null);
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

{/* Instructions with Google Drive thumbnail information - ONLY show for admins */}
{isAdmin && (
<motion.div
initial={{opacity: 0,y: 20}}
animate={{opacity: 1,y: 0}}
transition={{delay: 0.4}}
style={{
marginTop: '30px',
padding: '24px',
backgroundColor: '#f0f9ff',
borderRadius: '12px',
border: '1px solid #0ea5e9'
}}
>
<h3 style={{
marginBottom: '16px',
color: '#0c4a6e',
display: 'flex',
alignItems: 'center',
gap: '8px'
}}>
<SafeIcon icon={FiInfo} />
Admin Instructions & Features (Enhanced Google Drive Support)
</h3>
<div>
<div style={{
display: 'grid',
gridTemplateColumns: '1fr 1fr',
gap: '24px'
}}>
<div>
<h4 style={{fontWeight: '600',color: '#0c4a6e',marginBottom: '8px'}}>For Photos:</h4>
<ul style={{color: '#075985',lineHeight: '1.6',paddingLeft: '20px'}}>
<li>Enter a valid image URL (must start with http:// or https://)</li>
<li>Add a descriptive title - displayed prominently in bold</li>
<li>Optionally add description and tags for better organization</li>
<li><strong>✅ DATABASE:</strong> All photos are saved to Supabase database</li>
</ul>
</div>
<div>
<h4 style={{fontWeight: '600',color: '#0c4a6e',marginBottom: '8px'}}>Enhanced Google Drive Videos:</h4>
<ul style={{color: '#075985',lineHeight: '1.6',paddingLeft: '20px'}}>
<li><strong>🖼️ NEW:</strong> Automatic high-quality thumbnail extraction!</li>
<li><strong>🔄 Multiple Methods:</strong> Uses Google Drive API endpoints for thumbnails</li>
<li><strong>📱 Better Display:</strong> Videos show actual video frames instead of generic icons</li>
<li><strong>🎯 Smart Fallbacks:</strong> Multiple thumbnail URL formats for reliability</li>
<li><strong>✨ Bulk Update:</strong> Auto-update thumbnails for existing Google Drive videos</li>
</ul>
</div>
</div>

{/* Google Drive Enhanced Features Section */}
<div style={{
marginTop: '16px',
padding: '12px',
backgroundColor: '#dcfce7',
borderRadius: '8px',
border: '1px solid #16a34a'
}}>
<p style={{color: '#14532d',margin: '0 0 8px 0'}}>
<strong>GOOGLE DRIVE ENHANCEMENTS:</strong>
</p>
<ul style={{color: '#14532d',lineHeight: '1.6',paddingLeft: '20px',margin: '0 0 8px 0'}}>
<li><strong>Enhanced Thumbnail API:</strong> Uses Google Drive's thumbnail API endpoints for high-quality previews</li>
<li><strong>Multiple Extraction Methods:</strong> Supports various Google Drive URL formats and file ID patterns</li>
<li><strong>Automatic Detection:</strong> Detects Google Drive videos and applies enhanced thumbnail generation</li>
<li><strong>Bulk Update Tool:</strong> Update existing Google Drive videos with new thumbnails in one click</li>
<li><strong>Smart Fallbacks:</strong> Multiple thumbnail URL formats ensure maximum compatibility</li>
<li><strong>Clean Interface:</strong> Technical labels hidden from users for better viewing experience</li>
</ul>
</div>

{/* Search Features Section */}
<div style={{
marginTop: '16px',
padding: '12px',
backgroundColor: '#e0f2fe',
borderRadius: '8px',
border: '1px solid #0891b2'
}}>
<p style={{color: '#0e7490',margin: '0 0 8px 0'}}>
<strong>🔍 POWERFUL SEARCH & FILTERING:</strong>
</p>
<ul style={{color: '#0e7490',lineHeight: '1.6',paddingLeft: '20px',margin: '0 0 8px 0'}}>
<li><strong>Text Search:</strong> Search titles,descriptions,and tags simultaneously</li>
<li><strong>Filter by Type:</strong> Show only photos or videos</li>
<li><strong>Tag Filtering:</strong> Click any tag to filter by that tag instantly</li>
<li><strong>Date Range:</strong> Filter media by upload date range</li>
<li><strong>Smart Sorting:</strong> Sort by date,title,or media type</li>
<li><strong>Active Filter Count:</strong> Always see how many filters are active</li>
<li><strong>Quick Clear:</strong> Clear all filters with one click</li>
</ul>
</div>

<div style={{
marginTop: '16px',
padding: '12px',
backgroundColor: 'white',
borderRadius: '8px'
}}>
<p style={{color: '#075985',margin: '0 0 8px 0'}}>
<strong>🗄️ DATABASE FEATURES:</strong>
</p>
<ul style={{color: '#075985',lineHeight: '1.6',paddingLeft: '20px',margin: '0 0 8px 0'}}>
<li><strong>Cross-Device Access:</strong> Media persists across all devices and browsers</li>
<li><strong>Real-Time Sync:</strong> Changes appear instantly on all connected devices</li>
<li><strong>Full CRUD Operations:</strong> Create,read,update,and delete with database storage</li>
<li><strong>Data Persistence:</strong> No more lost media when clearing browser cache</li>
<li><strong>Backup & Recovery:</strong> All data is safely stored in Supabase cloud</li>
<li><strong>Advanced Search:</strong> Powerful filtering and search capabilities</li>
</ul>
<p style={{color: '#075985',margin: '0'}}>
<strong>💡 Tip:</strong> Use tags strategically (e.g.,"training","match","highlights") to make content easy to find later!
</p>
</div>
</div>
</motion.div>
)}

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

// Wrap the content with ProtectedPage using "Gallery" as the pageName
return (
<ProtectedPage pageName="Gallery">
<PhotoManagerContent />
</ProtectedPage>
);
};

export default PhotoManager;