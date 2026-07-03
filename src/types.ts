export interface Photo {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  imageUrl: string;
  username?: string;
  user?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  videoUrl: string;
  username?: string;
  user?: string;
}

export type View = 'home' | 'slideshow' | 'admin' | 'login' | 'videos' | 'fantasy';
