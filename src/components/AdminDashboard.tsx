import { useState } from 'react';
import { Lock, Plus, Trash2, Save, CheckCircle, Upload, Edit2, Film } from 'lucide-react';
import type { Photo, Letter, Video } from '../types';

interface AdminDashboardProps {
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  letter: Letter;
  setLetter: React.Dispatch<React.SetStateAction<Letter>>;
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function AdminDashboard({ photos, setPhotos, letter, setLetter, videos, setVideos }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'letter' | 'videos'>('photos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', description: '', eventDate: '', imageUrl: '' });
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 1.5 MB = 1.5 * 1024 * 1024 bytes
    if (file.size > 1.5 * 1024 * 1024) {
      showToast('Kích thước ảnh quá lớn! Vui lòng chọn ảnh < 1.5 MB để lưu trữ mượt mà.', 'error');
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

    if (file.size > 1.5 * 1024 * 1024) {
      showToast('Kích thước ảnh quá lớn! Vui lòng chọn ảnh < 1.5 MB để lưu trữ mượt mà.', 'error');
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

  const handleUpdatePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !editingPhoto.imageUrl || !editingPhoto.title) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    setPhotos(photos.map(p => p.id === editingPhoto.id ? editingPhoto : p));
    setEditingPhoto(null);
    showToast('Đã cập nhật thông tin ảnh thành công! 📝');
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

    // Limit to 15MB for video storage (using IndexedDB)
    if (file.size > 15 * 1024 * 1024) {
      showToast('Kích thước video quá lớn! Vui lòng chọn file video dưới 15.0 MB.', 'error');
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

    if (file.size > 15 * 1024 * 1024) {
      showToast('Kích thước video quá lớn! Vui lòng chọn file video dưới 15.0 MB.', 'error');
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

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.videoUrl || !newVideo.title) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    const videoToAdd: Video = {
      id: Date.now(),
      title: newVideo.title,
      description: newVideo.description,
      eventDate: newVideo.eventDate || 'Hôm nay',
      videoUrl: newVideo.videoUrl
    };

    setVideos([videoToAdd, ...videos]);
    setNewVideo({ title: '', description: '', eventDate: '', videoUrl: '' });
    setShowAddVideoForm(false);
    showToast('Đã thêm video mới vào album! 🎥');
  };

  const handleStartVideoEdit = (video: Video) => {
    setEditingVideo(video);
    if (video.videoUrl.startsWith('data:')) {
      setEditVideoUploadMode('file');
    } else {
      setEditVideoUploadMode('url');
    }
  };

  const handleUpdateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editingVideo.videoUrl || !editingVideo.title) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
      return;
    }

    setVideos(videos.map(v => v.id === editingVideo.id ? editingVideo : v));
    setEditingVideo(null);
    showToast('Đã cập nhật video thành công! 📝');
  };

  const handleDeleteVideo = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa video này?')) {
      setVideos(videos.filter(v => v.id !== id));
      showToast('Đã xóa video thành công!', 'success');
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

  // Xử lý Xóa ảnh
  const handleDeletePhoto = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      setPhotos(photos.filter(p => p.id !== id));
      showToast('Đã xóa ảnh khỏi album thành công!', 'success');
    }
  };

  // Xử lý Thêm ảnh
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.imageUrl || !newPhoto.title) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }
    
    const photoToAdd: Photo = {
      id: Date.now(), // tạo ID duy nhất cho frontend
      title: newPhoto.title,
      description: newPhoto.description,
      eventDate: newPhoto.eventDate || 'Hôm nay',
      imageUrl: newPhoto.imageUrl
    };
    
    setPhotos([photoToAdd, ...photos]); // Thêm lên đầu danh sách
    setNewPhoto({ title: '', description: '', eventDate: '', imageUrl: '' }); // Reset form
    setShowAddForm(false);
    showToast('Đã thêm ảnh mới vào album thành công! 🎉');
  };

  const handleSaveLetter = () => {
    showToast('Đã cập nhật và lưu thư tình thành công! ❤️');
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
          Quản lý Ảnh ({photos.length})
        </button>
        <button 
          onClick={() => setActiveTab('videos')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'videos' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Quản lý Video ({videos.length})
        </button>
        <button 
          onClick={() => setActiveTab('letter')} 
          className={`pb-3 px-6 font-bold text-lg transition-colors cursor-pointer ${
            activeTab === 'letter' ? 'text-theme-dark border-b-4 border-theme-dark' : 'text-gray-400 hover:text-theme-dark'
          }`}
        >
          Chỉnh sửa Thư Tình
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
                          <span className="text-xs text-gray-400 mt-1">Hỗ trợ PNG, JPG, JPEG, WEBP, GIF (Tối đa 1.5MB)</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Kỷ niệm Đà Lạt" 
                    required
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
            {photos.map(photo => (
              <div key={photo.id} className="bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow relative border border-gray-100">
                <div className="h-48 overflow-hidden">
                  <img src={photo.imageUrl} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg text-gray-800 line-clamp-1">{photo.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{photo.eventDate}</p>
                </div>
                {/* Nút thao tác hiện ra khi hover */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                  <button 
                    onClick={() => handleStartEdit(photo)}
                    className="bg-blue-500/90 backdrop-blur-xs text-white p-2 rounded-full hover:bg-blue-600 shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    title="Chỉnh sửa ảnh"
                  >
                    <Edit2 size={16}/>
                  </button>
                  <button 
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="bg-red-500/90 backdrop-blur-xs text-white p-2 rounded-full hover:bg-red-600 shadow-lg cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    title="Xóa ảnh"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
            {photos.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">Danh sách trống. Vui lòng thêm ảnh!</div>}
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
                          <span className="text-xs text-gray-400 mt-1">Hỗ trợ MP4, WEBM (Tối đa 15.0MB)</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề video *</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Nụ cười của em" 
                    required
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
            {videos.map(video => (
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
            {videos.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">Danh sách trống. Vui lòng thêm video!</div>}
          </div>
        </div>
      )}

      {/* Tùy chọn Thư Tình */}
      {activeTab === 'letter' && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 animate-fade-in">
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-2">Tiêu đề thư</label>
            <input 
              type="text" 
              value={letter.title} 
              onChange={(e) => setLetter({...letter, title: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block font-bold text-gray-700 mb-2">Nội dung thư</label>
            <textarea 
              rows={12} 
              value={letter.content}
              onChange={(e) => setLetter({...letter, content: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-theme-accent1 outline-none focus:border-theme-dark transition-all leading-relaxed"
            />
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleSaveLetter}
              className="bg-theme-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#8A5B66] shadow-lg transition-all cursor-pointer"
            >
              <Save size={20}/> Cập nhật Thư Tình
            </button>
          </div>
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
                        <span className="text-xs text-gray-400 mt-1">Hỗ trợ PNG, JPG, JPEG, WEBP, GIF (Tối đa 1.5MB)</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Kỷ niệm Đà Lạt" 
                  required
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
                        <span className="text-xs text-gray-400 mt-1">Hỗ trợ MP4, WEBM (Tối đa 15.0MB)</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề video *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Nụ cười của em" 
                  required
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
