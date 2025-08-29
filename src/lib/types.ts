
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
  | 'DownloadButton';
  
export type Brand = 'Natura' | 'Avon';

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
    name: string; // This will be the DE column name
    label: string;
    type: CustomFormFieldType;
    required: boolean;
    placeholder?: string;
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: any;
  parentId?: string | null; // ID of the parent component (e.g., a Columns component)
  column?: number;        // Index of the column if inside a Columns component
  order: number;          // Order within its container (root or a column)
  abTestEnabled?: boolean;
  abTestVariants?: any[];
  children?: PageComponent[]; // For nesting components, e.g., inside columns
}

export type SecurityType = 'none' | 'sso' | 'password';

export interface CloudPage {
  id: string;
  name: string;
  projectId: string;
  userId: string;
  brand: Brand;
  tags?: string[];
  styles: {
    backgroundColor: string;
    backgroundImage: string;
    themeColor: string;
    themeColorHover: string;
    fontFamily: string;
    customCss: string;
  };
  components: PageComponent[];
  meta: {
    title: string;
    faviconUrl: string;
    loaderImageUrl: string;
    dataExtensionKey: string;
    dataExtensionTargetMethod?: 'key' | 'name';
    metaDescription: string;
    metaKeywords: string;
    customAmpscript?: string;
    tracking?: {
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
  createdAt: any;
  updatedAt: any;
}

export interface Project {
    id: string;
    name: string;
    userId: string;
    icon?: string;
    color?: string;
    createdAt: Timestamp;
}

// A Template is essentially a CloudPage, but without project/user specific data.
// It can be used to create new CloudPages.
export interface Template {
  id: string;
  name: string;
  brand: Brand;
  description?: string;
  icon?: string;
  styles: CloudPage['styles'];
  components: PageComponent[];
  meta: Omit<CloudPage['meta'], 'dataExtensionKey' | 'tracking' | 'security'>;
  cookieBanner?: CloudPage['cookieBanner'];
  createdBy: string; // UserID of the creator
  createdAt: any;
  updatedAt: any;
  isDefault?: boolean; // Flag to identify default templates
}

export interface OnboardingObjectives {
  createdFirstProject: boolean;
  createdFirstPage: boolean;
  addedFirstForm: boolean;
  createdFirstTemplate: boolean;
  addedFirstAmpscript: boolean;
}

export interface UserProgress {
  id: string; // Same as user.uid
  userId: string;
  objectives: OnboardingObjectives;
  // Potentially add more progress tracking in the future
}

export interface PageView {
  id?: string;
  pageId: string;
  projectId: string;
  userId: string;
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
