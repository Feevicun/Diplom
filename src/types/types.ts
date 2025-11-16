import type { LucideIcon } from 'lucide-react';

// types/AIAssistant
export interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type IconComponent = React.FC<IconProps>;

export interface SuggestedTopic {
  title: string;
  relevance: number;
  category: string;
  description: string;
}

export interface AIFeature {
  icon: IconComponent;
  title: string;
  description: string;
  status: 'active' | 'coming-soon';
}

export interface TopicAPIResponse {
  topics: Array<{
    title?: string;
    category?: string;
    description?: string;
  }>;
}

export interface StructureAPIResponse {
  structure: StructureItem[];
  error?: string;
}

export interface GenerateTopicsRequest {
  idea: string;
}

export interface GenerateStructureRequest {
  topic: string;
}

// types/Resource
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'student' | 'teacher' | 'admin';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
}

export interface Resource {
  id: string;
  icon: IconComponent;
  title: string;
  description: string;
  action: string;
  link: string;
  category?: string;
  tags?: string[];
}

export interface ResourcesState {
  search: string;
  favorites: string[];
  showOnlyFavorites: boolean;
}

// Типізація для react-i18next
export type TFunction = (
  key: string, 
  options?: Record<string, unknown>
) => string;

export interface TranslationOptions {
  [key: string]: string | number | boolean | null | undefined;
}

export type TranslationFunction = (
  key: string, 
  options?: TranslationOptions
) => string;

export interface ResourceCardProps {
  resource: Resource;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isUserLoggedIn: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export type EventHandler<T = HTMLElement> = (event: React.SyntheticEvent<T>) => void;

export interface FormData {
  [key: string]: string | number | boolean | File | null;
}


// types/dashboard.ts
export interface ChapterData {
  id: number;
  key: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  studentNote: string;
  uploadedFile?: {
    name: string;
    uploadDate: string;
    size: string;
  };
  teacherComments: Array<{
    id: string;
    text: string;
    date: string;
    status: 'info' | 'warning' | 'error' | 'success';
  }>;
}

export interface ChapterTemplate {
  id: number;
  key: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  studentNote: string;
}

export interface UserType {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
}

export interface QuickStat {
  label: string;
  value: string;
  icon: LucideIcon;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ProjectMilestone {
  name: string;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  progress: number;
}

export interface RecentActivity {
  id: number;
  type: 'comment' | 'deadline' | 'approval';
  text: string;
  time: string;
  icon: LucideIcon;
}

export interface AIRecommendation {
  title: string;
  description: string;
  icon: LucideIcon;
  priority: 'Високий' | 'Середній' | 'Низький';
}

export interface CurrentWorkData {
  title: string;
  supervisor: string;
  progress: number;
  deadline: string;
  status: string;
  completedChapters: number;
  totalChapters: number;
  uploadedChapters: number;
}

export interface ChaptersStats {
  completed: number;
  total: number;
  displayText: string;
}

// Константи для localStorage ключів
export interface StorageKeys {
  PROJECT_TYPE: string;
  CHAPTERS: string;
}

// Тип для шаблонів розділів
export type ChapterTemplatesRecord = Record<ProjectType, ChapterTemplate[]>;


//types/forgotpass
export interface ResetPasswordData {
  email: string;
  role: string;
  newPassword: string;
  confirmPassword: string;
}

//types/sidebar
export interface MenuItemType {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | null;
}




// types/thesis.ts

export interface TeacherComment {
  id: string;
  text: string;
  date: string;
  status: 'info' | 'warning' | 'error' | 'success';
}

export interface ChapterData {
  id: number;
  key: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  studentNote: string;
  uploadedFile?: {
    name: string;
    uploadDate: string;
    size: string;
  };
  teacherComments: TeacherComment[];
}

export interface UserChapter {
  user_id: number;
  project_type: string;
  chapter_key: string;
  progress: number;
  status: string;
  student_note: string;
  uploaded_file_name?: string;
  uploaded_file_date?: string;
  uploaded_file_size?: string;
  updated_at: string;
}

export type ProjectType = 'diploma' | 'coursework' | 'practice';

export interface ProjectOption {
  type: ProjectType;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  color: string;
}

export interface WelcomeScreenProps {
  onSelectProject: (type: ProjectType) => void;
}

export interface ChapterTemplates {
  [key: string]: ChapterData[];
}

export interface ProjectTitles {
  [key: string]: string;
}

// API related types
export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface SaveChapterData {
  projectType: string;
  chapterKey: string;
  progress: number;
  status: string;
  studentNote: string;
  uploadedFileName: string | null;
  uploadedFileDate: string | null;
  uploadedFileSize: string | null;
}



export interface JwtUserPayload {
  userId: number;
  email: string;
  role: string;
}

export interface Message {
  id: string;
  studentEmail: string;
  sender: string;
  content: string;
  date: string;
}

export interface UserProject {
  projectType: string | null;
  chapters: ChapterData[];
}

export interface ChapterData {
  id: number;
  key: string;
  progress: number;
  status: 'completed' | 'review' | 'inProgress' | 'pending';
  studentNote: string;
  uploadedFile?: {
    name: string;
    uploadDate: string;
    size: string;
  };
}






export type ConversationListItem = {
  id: string;
  peerEmail: string;
  peerName: string;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
  peerOnline: boolean;
};

export type WsMessage = {
  id: string;
  conversationId: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: number;
  attachmentName?: string;
  readBy: string[];
};

export type UserLite = {
  email: string;
  firstName: string;
  lastName: string;
  role?: "student" | "supervisor";
};


export interface PremiumSuggestion {
  type: 'work' | 'direction' | 'future_topic';
  id: string;
  title: string;
  description?: string;
  work_type?: string;
  year?: number;
  url?: string;
  area?: string;
  topic_description?: string;
  relevance: number;
  created_at: string;
}

export interface PremiumSuggestionsResponse {
  suggestions: PremiumSuggestion[];
  searchQuery: string;
  totalCount: number;
}

// Додайте ці типи
export interface StructureItem {
  id: number;
  key: string;
  progress: number;
  status: string;
  content: string;
}



// Додайте до types/types.ts
export interface HuggingFaceAnalysisRequest {
  inputs: string;
  parameters?: {
    candidate_labels: string[];
  };
}

export interface HuggingFaceAnalysisResponse {
  labels: string[];
  scores: number[];
  sequence: string;
}

// В types/types.ts
export interface TextAnalysisMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  characterCount: number;
  averageSentenceLength: number;
  averageWordLength: number;
  readabilityScore: number;
  coherenceScore: number; // Додано нову метрику
}

export interface TextAnalysisResult {
  metrics: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    characterCount: number;
    averageSentenceLength: number;
    averageWordLength: number;
    readabilityScore: number;
    coherenceScore: number;
  };
  strengths: string[];
  issues: string[];
  suggestions: string[];
  overallScore: number;
}