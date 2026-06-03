export interface Photo {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  imageUrl: string;
}

export interface Letter {
  title: string;
  content: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  videoUrl: string;
}

export type View = 'home' | 'slideshow' | 'letter' | 'admin' | 'login' | 'videos';
