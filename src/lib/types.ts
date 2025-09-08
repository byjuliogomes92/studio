

import { Timestamp } from "firebase/firestore";

export type ComponentType =
  | 'Header'
  | 'Banner'
  | 'Form'
  | 'Footer'
  | 'Paragraph'
  | 'Image'
  | 'Title'
  | 'Subtitle'
  | 'Divider'
  | 'Countdown'
  | 'Video'
  | 'Button'
  | 'Spacer'
  | 'Accordion'
  | 'Tabs'
  | 'Voting'
  | 'Stripe'
  | 'NPS'
  | 'Map'
  | 'SocialIcons'
  | 'Columns'
  | 'WhatsApp'
  | 'Carousel'
  | 'DownloadButton'
  | 'FTPUpload'
  | 'DataExtensionUpload'
  | 'FloatingImage'
  | 'FloatingButton'
  | 'Calendly'
  | 'Div'
  | 'AddToCalendar'
  | 'PopUp'
  | 'CustomHTML';

export type BlockType = 
    | 'product-showcase' 
    | 'simple-gallery' 
    | 'news-section' 
    | 'hero-background-image' 
    | 'hero-split-right' 
    | 'hero-split-left' 
    | 'hero-lead-capture' 
    | 'logo-carousel'
    | 'header-simple'
    | 'header-cta'
    | 'header-centered'
    | 'header-minimal'
    | 'footer-simple'
    | 'footer-columns'
    | 'footer-newsletter'
    | 'faq-section'
    | 'popup-newsletter'
    | 'popup-coupon'
    | 'popup-age-gate'
    | 'features-grid'
    | 'features-list'
    | 'features-cards';


export type UserProfileType = 'owner' | 'employee' | 'freelancer';

export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';

export type EditorMode = 'none' | 'selection' | 'comment';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  profileType?: UserProfileType; 
  plan?: PlanType; // Added plan type
  createdAt: any;
  members?: WorkspaceMember[]; // Optional, hydrated on client
}

export type WorkspaceMemberRole = 'owner' | 'editor' | 'viewer';

export interface WorkspaceMember {
  id: string; 
  userId: string;
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
  createdAt: any;
}

export interface FtpConfig {
  host: string;
  user: string;
  password?: string; // Only used for sending updates, not stored
  encryptedPassword?: string; // Stored in Firestore
}

export interface BitlyConfig {
  accessToken?: string; // Only used for sending updates
  encryptedAccessToken?: string; // Stored in Firestore
}

export interface ColorScheme {
  background: string;
  foreground: string;
  primary: string;
  primaryHover: string;
  primaryForeground: string;
}

export interface Brand {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  // Visual Identity
  logos: {
    horizontalLight: string;
    horizontalDark: string;
    iconLight: string;
    iconDark: string;
    favicon: string;
  };
  typography: {
    fontFamilyHeadings: string;
    fontFamilyBody: string;
    customFontNameHeadings?: string;
    customFontUrlHeadings?: string;
    customFontNameBody?: string;
    customFontUrlBody?: string;
  };
  colors: {
    theme: 'light' | 'dark' | 'both';
    light: ColorScheme;
    dark: ColorScheme;
  };
  components: {
    button: {
      borderRadius: string;
    };
    input: {
      borderRadius: string;
      backgroundColor: string;
      borderColor: string;
      textColor: string;
    };
  };
  // Integrations
  integrations: {
    ftp?: FtpConfig;
    bitly?: BitlyConfig;
  };
  createdAt: any;
}


export interface FormFieldConditional {
    field: string;
    value: string;
}
  
export interface FormFieldConfig {
    enabled: boolean;
    conditional: FormFieldConditional | null;
    prefillFromUrl?: boolean;
}

export type CustomFormFieldType = 'text' | 'number' | 'date' | 'checkbox';

export interface CustomFormField {
    id: string;
    name: string; 
    label: string;
    type: CustomFormFieldType;
    required: boolean;
    placeholder?: string;
}

export interface HeaderLink {
    id: string;
    text: string;
    url: string;
    style?: 'link' | 'button';
    variant?: ButtonVariant;
    backgroundColor?: string;
    textColor?: string;
}

export type HeaderLayout = 
  | 'logo-left-menu-right'
  | 'logo-left-menu-button-right'
  | 'logo-center-menu-below'
  | 'logo-left-button-right'
  | 'logo-only-center'
  | 'logo-only-left'
  | 'logo-left-menu-center-button-right';

export type MobileMenuBehavior = 'push' | 'drawer' | 'overlay';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

export type ActionType = 'URL' | 'PAGE' | 'CLOSE_POPUP';

export interface Action {
  type: ActionType;
  url?: string;
  pageId?: string;
}

export type AnimationType = 'none' | 'fadeIn' | 'fadeInUp' | 'fadeInLeft' | 'fadeInRight';
export type LoopAnimationType = 'none' | 'pulse' | 'bounce' | 'rotate' | 'floating' | 'shake' | 'wave' | 'swing';

export interface ResponsiveProps {
  hiddenOnDesktop?: boolean;
  hiddenOnMobile?: boolean;
  mobileStyles?: { [key: string]: any };
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  layerName?: string;
  props: any & {
    responsive?: ResponsiveProps;
  };
  parentId?: string | null; 
  column?: number;        
  order: number;          
  abTestEnabled?: boolean;
  abTestVariants?: any[];
  children?: PageComponent[]; 
}

export type SecurityType = 'none' | 'sso' | 'password';
export type LoaderType = 'none' | 'image' | 'animation';
export type LoaderAnimation = 'pulse' | 'spin';

export type CalendlyEmbedType = 'inline' | 'popup_button' | 'popup_text';

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  scripts: string;
  required: boolean;
}

export interface CloudPage {
  id: string;
  name: string;
  slug: string;
  projectId: string;
  workspaceId: string;
  brandId: string;
  brandName: string;
  platform?: string;
  tags?: string[];
  status?: 'published' | 'draft';
  brand?: Brand; // Added to hold the synced brand object
  styles: {
    backgroundColor: string;
    backgroundImage: string;
    themeColor: string;
    themeColorHover: string;
    fontFamily: string;
    customCss: string;
    animationType?: AnimationType;
    animationDuration?: number;
    animationDelay?: number;
    loopAnimation?: LoopAnimationType;
    scrollbar?: {
      enabled: boolean;
      width: string;
      trackColor: string;
      thumbColor: string;
      thumbHoverColor: string;
      thumbBorderRadius: string;
    }
  };
  components: PageComponent[];
  meta: {
    title: string;
    faviconUrl: string;
    loaderType?: LoaderType;
    loaderImageUrl?: string;
    loaderAnimation?: LoaderAnimation;
    redirectUrl: string;
    dataExtensionKey: string;
    dataExtensionTargetMethod?: 'key' | 'name';
    metaDescription: string;
    metaKeywords: string;
    customAmpscript?: string;
    tracking?: {
      gtm?: { enabled: boolean; id?: string };
      ga4: { enabled: boolean; id?: string };
      meta: { enabled: boolean; id?: string };
      linkedin: { enabled: boolean; id?: string };
    };
    security?: {
        type: SecurityType;
        passwordConfig?: {
            dataExtensionKey: string;
            identifierColumn: string;
            passwordColumn: string;
            urlParameter: string;
        }
    }
  };
  cookieBanner?: {
    enabled: boolean;
    position: 'bottom' | 'bottom-left' | 'bottom-right';
    layout: 'bar' | 'card';
    title: string;
    description: string;
    acceptButtonText: string;
    declineButtonText: string;
    preferencesButtonText: string;
    privacyPolicyLink?: string;
    categories: CookieCategory[];
    styles: {
      backgroundColor: string;
      textColor: string;
      buttonBackgroundColor: string;
      buttonTextColor: string;
    };
  };
  publishDate?: any;
  expiryDate?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface Project {
    id: string;
    name: string;
    workspaceId: string;
    userId: string;
    icon?: string;
    color?: string;
    createdAt: Timestamp;
}

export interface MediaAsset {
  id: string;
  workspaceId: string;
  userId: string;
  fileName: string;
  url: string;
  storagePath: string;
  contentType: string;
  size: number;
  tags?: string[];
  createdAt: any;
}


export interface Template {
  id: string;
  name: string;
  brand: 'Natura' | 'Avon'; 
  workspaceId: string;
  description?: string;
  icon?: string;
  styles: CloudPage['styles'];
  components: PageComponent[];
  meta: Omit<CloudPage['meta'], 'dataExtensionKey' | 'tracking' | 'security'>;
  cookieBanner?: CloudPage['cookieBanner'];
  createdBy: string; 
  createdAt: any;
  updatedAt: any;
  isDefault?: boolean; 
}

export interface CommunityAsset {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'block';
  category: string;
  tags: string[];
  
  // Author information
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;

  // The actual content
  components: PageComponent[];
  styles: CloudPage['styles'];
  meta: Template['meta'];

  // Stats
  likes: number;
  duplicates: number;

  // Preview
  previewImageUrl: string;

  createdAt: any;
  updatedAt: any;
}

export interface OnboardingObjectives {
  createdFirstProject: boolean;
  createdFirstPage: boolean;
  addedFirstForm: boolean;
  createdFirstTemplate: boolean;
  addedFirstAmpscript: boolean;
}

export interface UserProgress {
  id: string; 
  userId: string;
  objectives: OnboardingObjectives;
}

export interface PageView {
  id?: string;
  pageId: string;
  projectId: string;
  workspaceId: string;
  timestamp: any;
  country?: string;
  city?: string;
  userAgent?: string;
  referrer?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
}

export interface FormSubmission {
    id?: string;
    pageId: string;
    workspaceId: string;
    timestamp: any;
    formData: { [key: string]: any };
}

export type ActivityLogAction = 
    | 'PROJECT_CREATED' | 'PROJECT_DELETED' | 'PROJECT_UPDATED'
    | 'PAGE_CREATED' | 'PAGE_DELETED' | 'PAGE_PUBLISHED'
    | 'MEMBER_INVITED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_CHANGED' | 'MEMBER_JOINED'
    | 'WORKSPACE_RENAMED'
    | 'TEMPLATE_CREATED' | 'TEMPLATE_DELETED'
    | 'BRAND_CREATED' | 'BRAND_DELETED' | 'BRAND_UPDATED'
    | 'MEDIA_UPLOADED' | 'MEDIA_DELETED' | 'MEDIA_UPDATED'
    | 'NOTIFICATION_CREATED'
    | 'COMMENT_ADDED';

export interface ActivityLog {
    id: string;
    workspaceId: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    action: ActivityLogAction;
    details: { [key: string]: any };
    timestamp: any;
}

export interface AppNotification {
    id: string;
    title: string;
    url: string;
    readBy: string[]; // Array of user IDs who have read it
    userId: string; // The user to be notified
    createdAt: any;
}

export interface PlatformSettings {
    id: 'global';
    dashboardBanner?: {
        enabled: boolean;
        title: string;
        description: string;
        imageUrl: string;
        buttonText: string;
        buttonUrl: string;
    };
    // Add other settings like feature flags here in the future
}

export type TicketStatus = 'aberto' | 'em_andamento' | 'fechado';
export type TicketCategory = 'bug' | 'duvida' | 'melhoria' | 'outro';

export interface SupportTicket {
    id: string;
    workspaceId: string;
    userId: string;
    userEmail: string;
    userName: string;
    title: string;
    description: string;
    category: TicketCategory;
    status: TicketStatus;
    createdAt: any;
    updatedAt: any;
    lastCommentBy?: 'user' | 'admin';
}

export interface TicketComment {
    id: string;
    ticketId: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    comment: string;
    createdAt: any;
}

// Comments on Pages
export interface CommentReply {
    id: string;
    userId: string;
    userName: string;
    userAvatarUrl: string;
    text: string;
    createdAt: any;
}

export interface PageComment {
    id: string;
    pageId: string;
    workspaceId: string;
    userId: string;
    userName: string;
    userAvatarUrl: string;
    text?: string;
    position: {
        x: number;
        y: number;
    };
    resolved: boolean;
    resolvedBy?: string;
    createdAt: any;
    replies?: CommentReply[];
}
