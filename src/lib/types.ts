
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
  | 'FTPUpload';

export type UserProfileType = 'owner' | 'employee' | 'freelancer';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  profileType?: UserProfileType; 
  createdAt: any;
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
}

export type HeaderLayout = 
  | 'logo-left-menu-right'
  | 'logo-left-menu-button-right'
  | 'logo-center-menu-below'
  | 'logo-left-button-right'
  | 'logo-only-center'
  | 'logo-only-left';

export type MobileMenuBehavior = 'push' | 'drawer' | 'overlay';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

export type AnimationType = 'none' | 'fadeIn' | 'fadeInUp' | 'fadeInLeft' | 'fadeInRight';

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: any;
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


export interface CloudPage {
  id: string;
  name: string;
  projectId: string;
  workspaceId: string;
  brandId: string;
  brandName: string;
  platform?: string;
  tags?: string[];
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
  };
  components: PageComponent[];
  meta: {
    title: string;
    faviconUrl: string;
    loaderType?: LoaderType;
    loaderImageUrl?: string;
    loaderAnimation?: LoaderAnimation;
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
    text: string;
    buttonText: string;
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
}

export interface FormSubmission {
    id?: string;
    pageId: string;
    timestamp: any;
    formData: { [key: string]: any };
}

export type ActivityLogAction = 
    | 'PROJECT_CREATED' | 'PROJECT_DELETED'
    | 'PAGE_CREATED' | 'PAGE_DELETED' | 'PAGE_PUBLISHED'
    | 'MEMBER_INVITED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_CHANGED' | 'MEMBER_JOINED'
    | 'WORKSPACE_RENAMED';

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
