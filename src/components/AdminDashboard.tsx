import { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, Save, CheckCircle, Upload, Edit2, Film, Music, Sparkles, GripVertical, BarChart2, Eye, Users, Globe } from 'lucide-react';
import type { Photo, Video } from '../types';
import { API_BASE_URL } from '../config';

interface AdminDashboardProps {
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  musicUrl: string;
  setMusicUrl: React.Dispatch<React.SetStateAction<string>>;
  musicTitle: string;
  setMusicTitle: React.Dispatch<React.SetStateAction<string>>;
  chatbotEnabled: boolean;
  setChatbotEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  chatbotName: string;
  setChatbotName: React.Dispatch<React.SetStateAction<string>>;
  chatbotWelcomeMessage: string;
  setChatbotWelcomeMessage: React.Dispatch<React.SetStateAction<string>>;
  chatbotSystemPrompt: string;
  setChatbotSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
  chatbotApiKey: string;
  setChatbotApiKey: React.Dispatch<React.SetStateAction<string>>;
  creatorFacebook: string;
  setCreatorFacebook: React.Dispatch<React.SetStateAction<string>>;
  creatorLinkedin: string;
  setCreatorLinkedin: React.Dispatch<React.SetStateAction<string>>;
  creatorYoutube: string;
  setCreatorYoutube: React.Dispatch<React.SetStateAction<string>>;
  creatorGithub: string;
  setCreatorGithub: React.Dispatch<React.SetStateAction<string>>;
  creatorTiktok: string;
  setCreatorTiktok: React.Dispatch<React.SetStateAction<string>>;
  creatorInstagram: string;
  setCreatorInstagram: React.Dispatch<React.SetStateAction<string>>;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function AdminDashboard({ 
  photos, 
  setPhotos, 
  videos, 
  setVideos,
  musicUrl,
  setMusicUrl,
  musicTitle,
  setMusicTitle,
  chatbotEnabled,
  setChatbotEnabled,
  chatbotName,
  setChatbotName,
  chatbotWelcomeMessage,
  setChatbotWelcomeMessage,
  chatbotSystemPrompt,
  setChatbotSystemPrompt,
  chatbotApiKey,
  setChatbotApiKey,
  creatorFacebook,
  setCreatorFacebook,
  creatorLinkedin,
  setCreatorLinkedin,
  creatorYoutube,
  setCreatorYoutube,
  creatorGithub,
  setCreatorGithub,
  creatorTiktok,
  setCreatorTiktok,
  creatorInstagram,
  setCreatorInstagram
}: AdminDashboardProps) {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    };
  };

  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'music' | 'chatbot' | 'social' | 'analytics'>('photos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', description: '', eventDate: '', imageUrl: '' });
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  // Music editing states
  const [editMusicTitle, setEditMusicTitle] = useState(musicTitle);
  const [editMusicUrl, setEditMusicUrl] = useState(musicUrl);
  const [musicUploadMode, setMusicUploadMode] = useState<'file' | 'url'>(musicUrl.startsWith('data:audio') ? 'file' : 'url');

  // Chatbot editing states
  const [editChatbotEnabled, setEditChatbotEnabled] = useState(chatbotEnabled);
  const [editChatbotName, setEditChatbotName] = useState(chatbotName);
  const [editChatbotWelcomeMessage, setEditChatbotWelcomeMessage] = useState(chatbotWelcomeMessage);
  const [editChatbotSystemPrompt, setEditChatbotSystemPrompt] = useState(chatbotSystemPrompt);
  const [editChatbotApiKey, setEditChatbotApiKey] = useState(chatbotApiKey);

  // Social editing states
  const [editFacebook, setEditFacebook] = useState(creatorFacebook);
  const [editLinkedin, setEditLinkedin] = useState(creatorLinkedin);
  const [editYoutube, setEditYoutube] = useState(creatorYoutube);
  const [editGithub, setEditGithub] = useState(creatorGithub);
  const [editTiktok, setEditTiktok] = useState(creatorTiktok);
  const [editInstagram, setEditInstagram] = useState(creatorInstagram);

  useEffect(() => {
    setEditMusicTitle(musicTitle);
    setEditMusicUrl(musicUrl);
    setMusicUploadMode(musicUrl.startsWith('data:audio') ? 'file' : 'url');
  }, [musicTitle, musicUrl]);

  useEffect(() => {
    setEditChatbotEnabled(chatbotEnabled);
    setEditChatbotName(chatbotName);
    setEditChatbotWelcomeMessage(chatbotWelcomeMessage);
    setEditChatbotSystemPrompt(chatbotSystemPrompt);
    setEditChatbotApiKey(chatbotApiKey);
  }, [chatbotEnabled, chatbotName, chatbotWelcomeMessage, chatbotSystemPrompt, chatbotApiKey]);

  useEffect(() => {
    setEditFacebook(creatorFacebook);
    setEditLinkedin(creatorLinkedin);
    setEditYoutube(creatorYoutube);
    setEditGithub(creatorGithub);
    setEditTiktok(creatorTiktok);
    setEditInstagram(creatorInstagram);
  }, [creatorFacebook, creatorLinkedin, creatorYoutube, creatorGithub, creatorTiktok, creatorInstagram]);

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState<{
    totalViews: number;
    uniqueVisitors: number;
    recentVisits: any[];
  } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (activeTab === 'analytics') {
      const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        try {
          const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
            headers: getAuthHeaders()
          });
          if (response.ok) {
            const data = await response.json();
            setAnalyticsData(data);
          } else {
            showToast('Không thể tải thống kê truy cập!', 'error');
          }
        } catch (err) {
          showToast('Lỗi kết nối máy chủ thống kê!', 'error');
        } finally {
          setLoadingAnalytics(false);
        }
      };
      fetchAnalytics();
    }
  }, [activeTab]);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testError, setTestError] = useState('');

  const currentUsername = localStorage.getItem('admin_username') || 'levanhoang';

  const displayPhotos = currentUsername === 'admin' 
    ? photos 
    : photos.filter(p => p.username === currentUsername);

  const displayVideos = currentUsername === 'admin' 
    ? videos 
    : videos.filter(v => v.username === currentUsername);

  const handleTestApiKey = async () => {
    setTestStatus('testing');
    setTestError('');
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/test-key`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          apiKey: editChatbotApiKey
        })
      });
      const data = await response.json();
      if (data.success) {
        setTestStatus('success');
        showToast('Kết nối tới Gemini thành công! ✅', 'success');
      } else {
        setTestStatus('failed');
        setTestError(data.error || 'Lỗi không xác định');
        showToast('Kết nối thất bại! ❌', 'error');
      }
    } catch (err: any) {
      setTestStatus('failed');
      setTestError(err.message || 'Lỗi kết nối server');
      showToast('Lỗi kết nối server! ❌', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10 MB = 10 * 1024 * 1024 bytes
    if (file.size > 10 * 1024 * 1024) {
      showToast('Kích thước ảnh quá lớn! Vui lòng chọn ảnh < 10 MB để lưu trữ mượt mà.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewPhoto(prev => ({ ...prev, imageUrl: event.target!.result as string }));
        showToast('Đã nhận diện file ảnh!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Editing Photo States
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editUploadMode, setEditUploadMode] = useState<'file' | 'url'>('file');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const targetPhoto = displayPhotos[targetIndex];
    const draggedPhoto = displayPhotos[draggedIndex];

    const draggedAbsoluteIndex = photos.findIndex(p => p.id === draggedPhoto.id);
    const targetAbsoluteIndex = photos.findIndex(p => p.id === targetPhoto.id);

    if (draggedAbsoluteIndex === -1 || targetAbsoluteIndex === -1) return;

    const updatedPhotos = [...photos];
    const [draggedItem] = updatedPhotos.splice(draggedAbsoluteIndex, 1);
    updatedPhotos.splice(targetAbsoluteIndex, 0, draggedItem);

    // Optimistically update frontend state
    setPhotos(updatedPhotos);

    try {
      const ids = updatedPhotos.map(p => p.id);
      const response = await fetch(`${API_BASE_URL}/photos/reorder`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error('Không thể lưu thứ tự ảnh.');
      }
      showToast('Đã cập nhật thứ tự ảnh thành công! ↔️');
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu thứ tự', 'error');
    }

    setDraggedIndex(null);
  };


  const handleStartEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    if (photo.imageUrl.startsWith('data:')) {
      setEditUploadMode('file');
    } else {
      setEditUploadMode('url');
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Kích thước ảnh quá lớn! Vui lòng chọn ảnh < 10 MB để lưu trữ mượt mà.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingPhoto) {
        setEditingPhoto(prev => prev ? ({ ...prev, imageUrl: event.target!.result as string }) : null);
        showToast('Đã nhận diện file ảnh mới!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !editingPhoto.imageUrl) {
      showToast('Vui lòng chọn hoặc nhập nguồn ảnh!', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editingPhoto.title,
          description: editingPhoto.description,
          eventDate: editingPhoto.eventDate,
          imageUrl: editingPhoto.imageUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Không thể cập nhật ảnh.');
      }

      setPhotos(photos.map(p => p.id === editingPhoto.id ? {
        id: data._id,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        imageUrl: data.imageUrl,
        username: data.username || p.username,
        user: data.user || p.user
      } : p));
      
      setEditingPhoto(null);
      showToast('Đã cập nhật thông tin ảnh thành công! 📝');
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối server', 'error');
    }
  };

  // --- VIDEO MANAGEMENT ---
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', description: '', eventDate: '', videoUrl: '' });
  const [videoUploadMode, setVideoUploadMode] = useState<'file' | 'url'>('file');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editVideoUploadMode, setEditVideoUploadMode] = useState<'file' | 'url'>('file');

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 50MB for video storage (using IndexedDB)
    if (file.size > 50 * 1024 * 1024) {
      showToast('Kích thước video quá lớn! Vui lòng chọn file video dưới 50.0 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewVideo(prev => ({ ...prev, videoUrl: event.target!.result as string }));
        showToast('Đã nhận diện file video!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showToast('Kích thước video quá lớn! Vui lòng chọn file video dưới 50.0 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && editingVideo) {
        setEditingVideo(prev => prev ? ({ ...prev, videoUrl: event.target!.result as string }) : null);
        showToast('Đã nhận diện file video mới!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.videoUrl) {
      showToast('Vui lòng chọn hoặc nhập nguồn video!', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newVideo.title,
          description: newVideo.description,
          eventDate: newVideo.eventDate || 'Hôm nay',
          videoUrl: newVideo.videoUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Không thể thêm video mới.');
      }

      const videoToAdd: Video = {
        id: data._id,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        videoUrl: data.videoUrl,
        username: data.username || currentUsername,
        user: data.user
      };

      setVideos([videoToAdd, ...videos]);
      setNewVideo({ title: '', description: '', eventDate: '', videoUrl: '' });
      setShowAddVideoForm(false);
      showToast('Đã thêm video mới vào album! 🎥');
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối server', 'error');
    }
  };

  const handleStartVideoEdit = (video: Video) => {
    setEditingVideo(video);
    if (video.videoUrl.startsWith('data:')) {
      setEditVideoUploadMode('file');
    } else {
      setEditVideoUploadMode('url');
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editingVideo.videoUrl) {
      showToast('Vui lòng chọn hoặc nhập nguồn video!', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editingVideo.title,
          description: editingVideo.description,
          eventDate: editingVideo.eventDate,
          videoUrl: editingVideo.videoUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Không thể cập nhật video.');
      }

      setVideos(videos.map(v => v.id === editingVideo.id ? {
        id: data._id,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        videoUrl: data.videoUrl,
        username: data.username || v.username,
        user: data.user || v.user
      } : v));
      
      setEditingVideo(null);
      showToast('Đã cập nhật video thành công! 📝');
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối server', 'error');
    }
  };

  const handleDeleteVideo = async (id: any) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa video này?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Không thể xóa video. Vui lòng thử lại.');
        }

        setVideos(videos.filter(v => v.id !== id));
        showToast('Đã xóa video thành công!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Lỗi kết nối server', 'error');
      }
    }
  };
  
  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // --- BACKGROUND MUSIC HANDLERS ---
  const handleMusicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 12 MB
    if (file.size > 12 * 1024 * 1024) {
      showToast('Kích thước file nhạc quá lớn! Vui lòng chọn file < 12 MB để lưu trữ tốt nhất.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditMusicUrl(event.target!.result as string);
        showToast('Đã nhận diện file nhạc!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMusicTitle || !editMusicUrl) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          musicUrl: editMusicUrl,
          musicTitle: editMusicTitle
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Không thể cập nhật cấu hình nhạc.');
      }

      setMusicUrl(data.musicUrl);
      setMusicTitle(data.musicTitle);
      showToast('Cập nhật nhạc nền thành công! 🎵');
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối server', 'error');
    }
  };

  const handleSaveChatbot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editChatbotName || !editChatbotWelcomeMessage || !editChatbotSystemPrompt) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          chatbotEnabled: editChatbotEnabled,
          chatbotName: editChatbotName,
          chatbotWelcomeMessage: editChatbotWelcomeMessage,
          chatbotSystemPrompt: editChatbotSystemPrompt,
          chatbotApiKey: editChatbotApiKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Không thể cập nhật cấu hình chatbot.');
      }

      setChatbotEnabled(data.chatbotEnabled);
      setChatbotName(data.chatbotName);
      setChatbotWelcomeMessage(data.chatbotWelcomeMessage);
      setChatbotSystemPrompt(data.chatbotSystemPrompt);
      setChatbotApiKey(data.chatbotApiKey);
      showToast('Cập nhật cấu hình chatbot thành công! 🤖');
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối server', 'error');
    }
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          creatorFacebook: editFacebook,
          creatorLinkedin: editLinkedin,
          creatorYoutube: editYoutube,
          creatorGithub: editGithub,
          creatorTiktok: editTiktok,
          creatorInstagram: editInstagram
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Không thể cập nhật liên kết mạng xã hội.');
      }

      setCreatorFacebook(data.creatorFacebook);
      setCreatorLinkedin(data.creatorLinkedin);
      setCreatorYoutube(data.creatorYoutube);
      setCreatorGithub(data.creatorGithub);
      setCreatorTiktok(data.creatorTiktok);
      setCreatorInstagram(data.creatorInstagram);
      showToast('Cập nhật liên kết mạng xã hội thành công! 🌐');
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối server', 'error');
    }
  };

  const handleDeletePhoto = async (id: any) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Không thể xóa ảnh. Vui lòng thử lại.');
        }

        setPhotos(photos.filter(p => p.id !== id));
        showToast('Đã xóa ảnh khỏi album thành công!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Lỗi kết nối server', 'error');
      }
    }
  };

  // Xử lý Thêm ảnh
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.imageUrl) {
      showToast('Vui lòng chọn hoặc nhập nguồn ảnh!', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/photos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newPhoto.title,
          description: newPhoto.description,
          eventDate: newPhoto.eventDate || 'Hôm nay',
          imageUrl: newPhoto.imageUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Không thể thêm ảnh mới.');
      }

      const photoToAdd: Photo = {
        id: data._id,
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        imageUrl: data.imageUrl,
        username: data.username || currentUsername,
        user: data.user
      };
      
      setPhotos([photoToAdd, ...photos]); // Thêm lên đầu danh sách
      setNewPhoto({ title: '', description: '', eventDate: '', imageUrl: '' }); // Reset form
      setShowAddForm(false);
      showToast('Đã thêm ảnh mới vào album thành công! 🎉');
    } catch (err: any) {
      showToast(err.message || 'Lỗi kết nối server', 'error');
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-xl text-white font-medium flex items-center gap-2 animate-slide-in ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            <CheckCircle size={20} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-theme-accent1 mb-8">
        <h2 className="text-3xl font-bold text-theme-dark flex items-center gap-2">
          <Lock size={28}/> Bảng Điều Khiển Quản Trị
        </h2>
        <p className="text-gray-500 mt-2">Thay đổi tại đây sẽ được cập nhật trực tiếp lên trang chủ của bạn.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b-2 border-theme-accent1 mb-8 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('photos')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'photos' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Quản lý Ảnh ({displayPhotos.length})
        </button>
        <button 
          onClick={() => setActiveTab('videos')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'videos' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Quản lý Video ({displayVideos.length})
        </button>

        <button 
          onClick={() => setActiveTab('music')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'music' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Cấu hình Nhạc Nền
        </button>
        <button 
          onClick={() => setActiveTab('chatbot')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'chatbot' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Cấu hình Chatbot
        </button>
        <button 
          onClick={() => setActiveTab('social')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'social' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Mạng Xã Hội Creator
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'analytics' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Thống kê truy cập
        </button>
      </div>

      {/* Tùy chọn Quản lý Ảnh */}
      {activeTab === 'photos' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Bộ sưu tập ảnh</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-theme-dark text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-[#8A5B66] transition-all cursor-pointer"
            >
              {showAddForm ? 'Hủy' : <><Plus size={20}/> Thêm ảnh mới</>}
            </button>
          </div>

          {/* Form Thêm Ảnh */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 animate-fade-in">
              <h4 className="font-bold text-lg mb-4 text-theme-dark">Thông tin ảnh mới</h4>
              <form onSubmit={handleAddPhoto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn ảnh *</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode('file');
                        setNewPhoto(prev => ({ ...prev, imageUrl: '' }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        uploadMode === 'file' 
                          ? 'bg-white text-theme-dark shadow-xs' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tải file từ máy (PNG, JPG)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode('url');
                        setNewPhoto(prev => ({ ...prev, imageUrl: '' }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        uploadMode === 'url' 
                          ? 'bg-white text-theme-dark shadow-xs' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Nhập link URL
                    </button>
                  </div>

                  {uploadMode === 'file' ? (
                    <div>
                      {newPhoto.imageUrl ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                          <img src={newPhoto.imageUrl} alt="Upload preview" className="h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setNewPhoto(prev => ({ ...prev, imageUrl: '' }))}
                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-xl hover:bg-red-600 shadow-md transition-all cursor-pointer text-xs font-bold"
                          >
                            Xóa ảnh chọn lại
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-theme-accent2 hover:bg-theme-main/10 transition-all group">
                          <Upload className="text-gray-400 group-hover:text-theme-dark transition-colors mb-2" size={32} />
                          <span className="font-bold text-gray-600 group-hover:text-theme-dark transition-colors">Chọn ảnh từ máy tính</span>
                          <span className="text-xs text-gray-400 mt-1">Hỗ trợ PNG, JPG, JPEG, WEBP, GIF (Tối đa 10MB)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="url" 
                        placeholder="https://..." 
                        required={uploadMode === 'url'}
                        value={newPhoto.imageUrl} 
                        onChange={e => setNewPhoto({...newPhoto, imageUrl: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                      />
                      {newPhoto.imageUrl && (
                        <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                          <img src={newPhoto.imageUrl} alt="URL preview" className="h-full object-contain" onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=2029&auto=format&fit=crop';
                          }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Kỷ niệm Đà Lạt" 
                    value={newPhoto.title} 
                    onChange={e => setNewPhoto({...newPhoto, title: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày diễn ra</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: 14/02/2025"
                    value={newPhoto.eventDate} 
                    onChange={e => setNewPhoto({...newPhoto, eventDate: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                  <textarea 
                    rows={2} 
                    placeholder="Cảm xúc của bạn..."
                    value={newPhoto.description} 
                    onChange={e => setNewPhoto({...newPhoto, description: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-md transition-all cursor-pointer"
                  >
                    Lưu Ảnh Vào Album
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Danh sách ảnh */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayPhotos.map((photo, index) => (
              <div 
                key={photo.id} 
                className={`bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 relative border border-gray-100 cursor-move ${draggedIndex === index ? 'opacity-40 border-dashed border-theme-accent1 scale-95' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Drag Handle Indicator */}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none" title="Giữ kéo để đổi thứ tự">
                  <GripVertical size={16} />
                </div>
                
                <div className="h-48 overflow-hidden select-none">
                  <img src={photo.imageUrl} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                </div>
                <div className="p-4 select-none">
                  <h4 className="font-bold text-lg text-gray-800 line-clamp-1">{photo.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{photo.eventDate}</p>
                </div>
                {/* Nút thao tác hiện ra khi hover */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                  <button 
                    type="button"
                    onClick={() => handleStartEdit(photo)}
                    className="bg-blue-500/90 backdrop-blur-xs text-white p-2 rounded-full hover:bg-blue-600 shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    title="Chỉnh sửa ảnh"
                  >
                    <Edit2 size={16}/>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-red-500/90 backdrop-blur-xs text-white p-2 rounded-full hover:bg-red-600 shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    title="Xóa ảnh"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
            {displayPhotos.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">Danh sách trống. Vui lòng thêm ảnh!</div>}
          </div>
        </div>
      )}

      {/* Tùy chọn Quản lý Video */}
      {activeTab === 'videos' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Bộ sưu tập video</h3>
            <button 
              onClick={() => setShowAddVideoForm(!showAddVideoForm)}
              className="bg-theme-dark text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-[#8A5B66] transition-all cursor-pointer"
            >
              {showAddVideoForm ? 'Hủy' : <><Plus size={20}/> Thêm video mới</>}
            </button>
          </div>

          {/* Form Thêm Video */}
          {showAddVideoForm && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 animate-fade-in">
              <h4 className="font-bold text-lg mb-4 text-theme-dark">Thông tin video mới</h4>
              <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn video *</label>
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUploadMode('file');
                        setNewVideo(prev => ({ ...prev, videoUrl: '' }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        videoUploadMode === 'file' 
                          ? 'bg-white text-theme-dark shadow-xs' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tải file từ máy (MP4, WEBM)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoUploadMode('url');
                        setNewVideo(prev => ({ ...prev, videoUrl: '' }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        videoUploadMode === 'url' 
                          ? 'bg-white text-theme-dark shadow-xs' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Nhập link URL
                    </button>
                  </div>

                  {videoUploadMode === 'file' ? (
                    <div>
                      {newVideo.videoUrl ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                          <video src={newVideo.videoUrl} className="h-full object-contain" controls />
                          <button
                            type="button"
                            onClick={() => setNewVideo(prev => ({ ...prev, videoUrl: '' }))}
                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-xl hover:bg-red-600 shadow-md transition-all cursor-pointer text-xs font-bold"
                          >
                            Xóa chọn lại
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-theme-accent2 hover:bg-theme-main/10 transition-all group">
                          <Upload className="text-gray-400 group-hover:text-theme-dark transition-colors mb-2" size={32} />
                          <span className="font-bold text-gray-600 group-hover:text-theme-dark transition-colors">Chọn video từ máy tính</span>
                          <span className="text-xs text-gray-400 mt-1">Hỗ trợ MP4, WEBM (Tối đa 50.0MB)</span>
                          <input 
                            type="file" 
                            accept="video/*" 
                            className="hidden" 
                            onChange={handleVideoFileChange}
                          />
                        </label>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="url" 
                        placeholder="Đường dẫn video (ví dụ: link trực tiếp .mp4 hoặc link video trên mạng)..." 
                        required={videoUploadMode === 'url'}
                        value={newVideo.videoUrl} 
                        onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                      />
                      {newVideo.videoUrl && (
                        <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                          <video src={newVideo.videoUrl} className="h-full object-contain" controls />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề video</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Nụ cười của em" 
                    value={newVideo.title} 
                    onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kỷ niệm</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: 20/10/2024"
                    value={newVideo.eventDate} 
                    onChange={e => setNewVideo({...newVideo, eventDate: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                  <textarea 
                    rows={2} 
                    placeholder="Viết vài dòng kỷ niệm về thước phim này..."
                    value={newVideo.description} 
                    onChange={e => setNewVideo({...newVideo, description: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-md transition-all cursor-pointer"
                  >
                    Lưu Video Vào Album
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Danh sách video */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayVideos.map(video => (
              <div key={video.id} className="bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow relative border border-gray-100 flex flex-col">
                <div className="h-48 overflow-hidden bg-black flex items-center justify-center relative">
                  <video src={video.videoUrl} className="w-full h-full object-cover opacity-80" preload="metadata" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Film className="text-white/60" size={32} />
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <h4 className="font-bold text-lg text-gray-800 line-clamp-1">{video.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{video.eventDate}</p>
                </div>
                {/* Nút thao tác hiện ra khi hover */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                  <button 
                    onClick={() => handleStartVideoEdit(video)}
                    className="bg-blue-500/90 backdrop-blur-xs text-white p-2 rounded-full hover:bg-blue-600 shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    title="Chỉnh sửa video"
                  >
                    <Edit2 size={16}/>
                  </button>
                  <button 
                    onClick={() => handleDeleteVideo(video.id)}
                    className="bg-red-500/90 backdrop-blur-xs text-white p-2 rounded-full hover:bg-red-600 shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    title="Xóa video"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
            {displayVideos.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">Danh sách trống. Vui lòng thêm video!</div>}
          </div>
        </div>
      )}



      {/* Tùy chọn Nhạc Nền */}
      {activeTab === 'music' && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 animate-fade-in">
          <h3 className="text-2xl font-bold text-theme-dark mb-6 flex items-center gap-2">
            <Music size={24} className="text-theme-accent2" /> Cấu hình Nhạc nền ứng dụng
          </h3>
          
          <form onSubmit={handleSaveMusic} className="grid grid-cols-1 gap-6">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Tên bài hát *</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: Lối Nhỏ - Đen Vâu"
                value={editMusicTitle} 
                onChange={(e) => setEditMusicTitle(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all font-medium animate-fade-in"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Nguồn nhạc *</label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMusicUploadMode('file');
                    setEditMusicUrl('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    musicUploadMode === 'file' 
                      ? 'bg-white text-theme-dark shadow-xs' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tải file từ máy (.mp3, .wav)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMusicUploadMode('url');
                    setEditMusicUrl('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    musicUploadMode === 'url' 
                      ? 'bg-white text-theme-dark shadow-xs' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Nhập link URL trực tiếp
                </button>
              </div>

              {musicUploadMode === 'file' ? (
                <div>
                  {editMusicUrl && editMusicUrl.startsWith('data:audio') ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 p-6 bg-gray-50 flex flex-col items-center justify-center gap-3">
                      <audio src={editMusicUrl} controls className="w-full max-w-md" />
                      <button
                        type="button"
                        onClick={() => setEditMusicUrl('')}
                        className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 shadow-md transition-all cursor-pointer text-xs font-bold"
                      >
                        Xóa file chọn lại
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-theme-accent2 hover:bg-theme-main/10 transition-all group">
                      <Upload className="text-gray-400 group-hover:text-theme-dark transition-colors mb-2" size={32} />
                      <span className="font-bold text-gray-600 group-hover:text-theme-dark transition-colors">Chọn file nhạc từ máy tính</span>
                      <span className="text-xs text-gray-400 mt-1">Hỗ trợ các file định dạng âm thanh (Khuyên dùng MP3 dưới 12MB)</span>
                      <input 
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        onChange={handleMusicFileChange}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div>
                  <input 
                    type="url" 
                    placeholder="https://example.com/song.mp3" 
                    required={musicUploadMode === 'url'}
                    value={editMusicUrl} 
                    onChange={e => setEditMusicUrl(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all font-medium"
                  />
                  {editMusicUrl && (
                    <div className="mt-4 p-4 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <audio src={editMusicUrl} controls className="w-full max-w-md" onError={() => {
                        console.log("Audio URL load error");
                      }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button 
                type="submit"
                className="bg-theme-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#8A5B66] shadow-lg transition-all cursor-pointer"
              >
                <Save size={20}/> Cập nhật Nhạc Nền
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tùy chọn Cấu hình Chatbot */}
      {activeTab === 'chatbot' && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 animate-fade-in font-medium">
          <h3 className="text-2xl font-bold text-theme-dark mb-6 flex items-center gap-2">
            <Sparkles size={24} className="text-theme-accent2 animate-pulse" /> Cấu hình Chatbot Trò Chuyện
          </h3>

          <form onSubmit={handleSaveChatbot} className="grid grid-cols-1 gap-6">
            {/* Trạng thái hoạt động */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <label className="block font-bold text-gray-800">Trạng thái hoạt động</label>
                <p className="text-sm text-gray-500">Bật/Tắt bong bóng trò chuyện chatbot trên trang chủ.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={editChatbotEnabled} 
                  onChange={e => setEditChatbotEnabled(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-theme-accent2"></div>
              </label>
            </div>

            {/* Tên Chatbot */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">Tên hiển thị của Chatbot *</label>
              <input 
                type="text" 
                required
                placeholder="Ví dụ: AI Assistant"
                value={editChatbotName} 
                onChange={e => setEditChatbotName(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
              />
            </div>

            {/* Tin nhắn chào mừng */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">Tin nhắn chào mừng đầu tiên *</label>
              <textarea 
                rows={3}
                required
                placeholder="Lời chào mở đầu khi mở khung chat..."
                value={editChatbotWelcomeMessage} 
                onChange={e => setEditChatbotWelcomeMessage(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all leading-relaxed"
              />
            </div>

            {/* Chỉ dẫn AI / Persona */}
            <div>
              <label className="block font-bold text-gray-700 mb-2 font-semibold">Chỉ dẫn AI (System Prompt) *</label>
              <p className="text-xs text-gray-500 mb-2">Định hình tính cách, phong cách trả lời cho AI. Ví dụ: xưng hô lịch sự, hài hước, trả lời ngắn gọn...</p>
              <textarea 
                rows={6}
                required
                placeholder="Chỉ dẫn AI của bạn..."
                value={editChatbotSystemPrompt} 
                onChange={e => setEditChatbotSystemPrompt(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all leading-relaxed"
              />
            </div>

            {/* Google Gemini API Key */}
            <div>
              <label className="block font-bold text-gray-700 mb-2 font-semibold">Google Gemini API Key</label>
              <p className="text-xs text-gray-500 mb-2">
                Nhập API Key của bạn từ Google AI Studio (được cung cấp miễn phí). Khóa này sẽ được lưu bảo mật ở server.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input 
                  type="password" 
                  placeholder={editChatbotApiKey === '********' ? '******** (Đã được bảo mật ở server)' : 'Nhập Google Gemini API Key của bạn...'}
                  value={editChatbotApiKey === '********' ? '********' : editChatbotApiKey} 
                  onChange={e => {
                    setEditChatbotApiKey(e.target.value);
                    setTestStatus('idle');
                  }}
                  className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={testStatus === 'testing'}
                  className="px-6 py-4 bg-theme-accent1 hover:bg-theme-accent1/80 text-theme-dark font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {testStatus === 'testing' ? 'Đang test...' : 'Test kết nối'}
                </button>
              </div>
              
              <div className="mt-2.5 flex flex-wrap gap-2.5 items-center">
                {editChatbotApiKey === '********' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditChatbotApiKey('');
                      setTestStatus('idle');
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold transition-all cursor-pointer"
                  >
                    Xóa và cấu hình khóa mới
                  </button>
                )}
                
                {testStatus === 'success' && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 animate-fade-in border border-emerald-200">
                    Kết nối thành công ✅
                  </span>
                )}
                
                {testStatus === 'failed' && (
                  <span className="text-xs bg-rose-100 text-rose-800 font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 animate-fade-in border border-rose-200" title={testError}>
                    Key không hợp lệ ❌ ({testError.substring(0, 40)}{testError.length > 40 ? '...' : ''})
                  </span>
                )}
              </div>
            </div>

            {/* Nút lưu */}
            <div className="flex justify-end mt-4">
              <button 
                type="submit"
                className="bg-theme-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#8A5B66] shadow-lg transition-all cursor-pointer"
              >
                <Save size={20}/> Cập nhật Cấu hình Chatbot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tùy chọn Cấu hình Mạng Xã Hội Creator */}
      {activeTab === 'social' && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 animate-fade-in font-medium">
          <h3 className="text-2xl font-bold text-theme-dark mb-6 flex items-center gap-2">
            <Sparkles size={24} className="text-theme-accent2" /> Cấu hình Liên kết Mạng Xã Hội Creator
          </h3>
          <p className="text-sm text-gray-500 mb-6 font-normal">Cấu hình các đường dẫn Facebook, LinkedIn, YouTube, GitHub của người thiết kế trang web (Lê Văn Hoàng).</p>

          <form onSubmit={handleSaveSocial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Đường dẫn Facebook</label>
              <input 
                type="url" 
                placeholder="https://facebook.com/username"
                value={editFacebook} 
                onChange={e => setEditFacebook(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Đường dẫn LinkedIn</label>
              <input 
                type="url" 
                placeholder="https://linkedin.com/in/username"
                value={editLinkedin} 
                onChange={e => setEditLinkedin(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Đường dẫn YouTube</label>
              <input 
                type="url" 
                placeholder="https://youtube.com/@username"
                value={editYoutube} 
                onChange={e => setEditYoutube(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Đường dẫn GitHub</label>
              <input 
                type="url" 
                placeholder="https://github.com/username"
                value={editGithub} 
                onChange={e => setEditGithub(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Đường dẫn TikTok</label>
              <input 
                type="url" 
                placeholder="https://tiktok.com/@username"
                value={editTiktok} 
                onChange={e => setEditTiktok(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Đường dẫn Instagram</label>
              <input 
                type="url" 
                placeholder="https://instagram.com/username"
                value={editInstagram} 
                onChange={e => setEditInstagram(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button 
                type="submit"
                className="bg-theme-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#8A5B66] shadow-lg transition-all cursor-pointer"
              >
                <Save size={20}/> Cập nhật Liên kết
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tùy chọn Thống kê truy cập */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 animate-fade-in font-medium">
          <h3 className="text-2xl font-bold text-theme-dark mb-6 flex items-center gap-2">
            <BarChart2 size={24} className="text-theme-accent2" /> Thống kê truy cập hệ thống
          </h3>
          <p className="text-sm text-gray-500 mb-8 font-normal">Theo dõi tổng lượng truy cập, số lượng người truy cập duy nhất và nhật ký hoạt động.</p>

          {loadingAnalytics && !analyticsData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#A7727D] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải dữ liệu thống kê...</p>
            </div>
          ) : (
            <div>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 font-normal">
                {/* Total Views Card */}
                <div className="bg-gradient-to-br from-[#FCE4EC]/50 to-[#FFF9C4]/30 border border-[#FCE4EC] rounded-2xl p-6 flex items-center gap-5 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-white/80 border border-white/60 shadow-xs flex items-center justify-center text-[#E57373]">
                    <Eye size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Tổng lượt truy cập</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-1 font-serif">
                      {analyticsData?.totalViews || 0}
                    </p>
                  </div>
                </div>

                {/* Unique Visitors Card */}
                <div className="bg-gradient-to-br from-[#E0F7FA]/40 to-[#E8F5E9]/30 border border-[#B2EBF2]/40 rounded-2xl p-6 flex items-center gap-5 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-white/80 border border-white/60 shadow-xs flex items-center justify-center text-[#81C784]">
                    <Users size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Khách truy cập duy nhất</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-1 font-serif">
                      {analyticsData?.uniqueVisitors || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Access List */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="font-bold text-lg text-theme-dark mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-theme-accent2" /> Nhật ký truy cập gần đây (Tối đa 100)
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100/80 rounded-lg">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg font-bold">Thời gian</th>
                        <th className="px-4 py-3 font-bold">Địa chỉ IP</th>
                        <th className="px-4 py-3 font-bold text-center">Số lần truy cập (IP)</th>
                        <th className="px-4 py-3 font-bold">Vị trí</th>
                        <th className="px-4 py-3 font-bold">Nhà mạng (ISP)</th>
                        <th className="px-4 py-3 font-bold">Nguồn</th>
                        <th className="px-4 py-3 font-bold">Thiết bị</th>
                        <th className="px-4 py-3 rounded-r-lg font-bold">Trang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-normal">
                      {analyticsData?.recentVisits && analyticsData.recentVisits.length > 0 ? (
                        analyticsData.recentVisits.map((visit: any) => {
                          const date = new Date(visit.timestamp);
                          const formattedTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
                          
                          return (
                            <tr key={visit._id} className="hover:bg-white transition-colors">
                              <td className="px-4 py-3.5 whitespace-nowrap text-gray-700 font-medium">{formattedTime}</td>
                              <td className="px-4 py-3.5 font-mono text-xs text-blue-600 font-bold">{visit.ip || 'N/A'}</td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-theme-accent2/10 text-theme-dark border border-theme-accent2/20">
                                  {visit.totalIpVisits || 1} lần
                                </span>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-gray-700 font-medium">
                                {visit.country && visit.country !== 'Local/Unknown' ? (
                                  <span className="flex items-center gap-1">
                                    🌍 {visit.country}{visit.city ? `, ${visit.city}` : ''}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Nội bộ / Chưa rõ</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500 max-w-[150px] truncate" title={visit.isp}>
                                {visit.isp || <span className="text-gray-300">-</span>}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  visit.referrer === 'Facebook' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  visit.referrer === 'Instagram' ? 'bg-pink-50 text-pink-700 border border-pink-100 animate-pulse' :
                                  visit.referrer === 'Google' ? 'bg-green-50 text-green-700 border border-green-100' :
                                  visit.referrer === 'LinkedIn' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                  visit.referrer === 'YouTube' ? 'bg-red-50 text-red-700 border border-red-100' :
                                  visit.referrer === 'GitHub' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                                  visit.referrer === 'Trực tiếp' || !visit.referrer ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                                  'bg-[#FFD1DC] text-[#4A2545] border border-[#FFD1DC]/80'
                                }`}>
                                  {visit.referrer || 'Trực tiếp'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-gray-700">{visit.browser}</span>
                                  <span className="text-gray-400 text-[10px]">{visit.os}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 font-mono text-xs text-theme-dark font-semibold">{visit.page}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-gray-400 font-medium">Chưa có nhật ký truy cập nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[999] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative animate-scale-up">
            <h3 className="text-2xl font-bold text-theme-dark mb-6 flex items-center gap-2">
              <Edit2 size={24} /> Chỉnh sửa thông tin ảnh
            </h3>
            <form onSubmit={handleUpdatePhoto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn ảnh *</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditUploadMode('file');
                      setEditingPhoto(prev => prev ? ({ ...prev, imageUrl: '' }) : null);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      editUploadMode === 'file' 
                        ? 'bg-white text-theme-dark shadow-xs' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tải file từ máy (PNG, JPG)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditUploadMode('url');
                      setEditingPhoto(prev => prev ? ({ ...prev, imageUrl: '' }) : null);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      editUploadMode === 'url' 
                        ? 'bg-white text-theme-dark shadow-xs' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Nhập link URL
                  </button>
                </div>

                {editUploadMode === 'file' ? (
                  <div>
                    {editingPhoto.imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                        <img src={editingPhoto.imageUrl} alt="Upload preview" className="h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setEditingPhoto(prev => prev ? ({ ...prev, imageUrl: '' }) : null)}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-xl hover:bg-red-600 shadow-md transition-all cursor-pointer text-xs font-bold"
                        >
                          Xóa ảnh chọn lại
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-theme-accent2 hover:bg-theme-main/10 transition-all group">
                        <Upload className="text-gray-400 group-hover:text-theme-dark transition-colors mb-2" size={32} />
                        <span className="font-bold text-gray-600 group-hover:text-theme-dark transition-colors">Chọn ảnh từ máy tính</span>
                        <span className="text-xs text-gray-400 mt-1">Hỗ trợ PNG, JPG, JPEG, WEBP, GIF (Tối đa 10MB)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleEditFileChange}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      required={editUploadMode === 'url'}
                      value={editingPhoto.imageUrl} 
                      onChange={e => setEditingPhoto(prev => prev ? ({ ...prev, imageUrl: e.target.value }) : null)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                    />
                    {editingPhoto.imageUrl && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                        <img src={editingPhoto.imageUrl} alt="URL preview" className="h-full object-contain" onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=2029&auto=format&fit=crop';
                        }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Kỷ niệm Đà Lạt" 
                  value={editingPhoto.title} 
                  onChange={e => setEditingPhoto(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày diễn ra</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: 14/02/2025"
                  value={editingPhoto.eventDate} 
                  onChange={e => setEditingPhoto(prev => prev ? ({ ...prev, eventDate: e.target.value }) : null)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                <textarea 
                  rows={2} 
                  placeholder="Cảm xúc của bạn..."
                  value={editingPhoto.description} 
                  onChange={e => setEditingPhoto(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingPhoto(null)}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="bg-theme-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8A5B66] shadow-lg transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[999] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative animate-scale-up">
            <h3 className="text-2xl font-bold text-theme-dark mb-6 flex items-center gap-2">
              <Film size={24} className="text-theme-accent2" /> Chỉnh sửa thông tin video
            </h3>
            <form onSubmit={handleUpdateVideo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nguồn video *</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditVideoUploadMode('file');
                      setEditingVideo(prev => prev ? ({ ...prev, videoUrl: '' }) : null);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      editVideoUploadMode === 'file' 
                        ? 'bg-white text-theme-dark shadow-xs' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tải file từ máy (MP4, WEBM)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditVideoUploadMode('url');
                      setEditingVideo(prev => prev ? ({ ...prev, videoUrl: '' }) : null);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                      editVideoUploadMode === 'url' 
                        ? 'bg-white text-theme-dark shadow-xs' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Nhập link URL
                  </button>
                </div>

                {editVideoUploadMode === 'file' ? (
                  <div>
                    {editingVideo.videoUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                        <video src={editingVideo.videoUrl} className="h-full object-contain" controls />
                        <button
                          type="button"
                          onClick={() => setEditingVideo(prev => prev ? ({ ...prev, videoUrl: '' }) : null)}
                          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-xl hover:bg-red-600 shadow-md transition-all cursor-pointer text-xs font-bold"
                        >
                          Xóa chọn lại
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-theme-accent2 hover:bg-theme-main/10 transition-all group">
                        <Upload className="text-gray-400 group-hover:text-theme-dark transition-colors mb-2" size={32} />
                        <span className="font-bold text-gray-600 group-hover:text-theme-dark transition-colors">Chọn video từ máy tính</span>
                        <span className="text-xs text-gray-400 mt-1">Hỗ trợ MP4, WEBM (Tối đa 50.0MB)</span>
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden" 
                          onChange={handleEditVideoFileChange}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div>
                    <input 
                      type="url" 
                      placeholder="Đường dẫn video..." 
                      required={editVideoUploadMode === 'url'}
                      value={editingVideo.videoUrl} 
                      onChange={e => setEditingVideo(prev => prev ? ({ ...prev, videoUrl: e.target.value }) : null)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                    />
                    {editingVideo.videoUrl && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 h-48 bg-gray-50 flex items-center justify-center">
                        <video src={editingVideo.videoUrl} className="h-full object-contain" controls />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề video</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Nụ cười của em" 
                  value={editingVideo.title} 
                  onChange={e => setEditingVideo(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kỷ niệm</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: 20/10/2024"
                  value={editingVideo.eventDate} 
                  onChange={e => setEditingVideo(prev => prev ? ({ ...prev, eventDate: e.target.value }) : null)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                <textarea 
                  rows={2} 
                  placeholder="Viết vài dòng kỷ niệm về thước phim này..."
                  value={editingVideo.description} 
                  onChange={e => setEditingVideo(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingVideo(null)}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="bg-theme-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8A5B66] shadow-lg transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
