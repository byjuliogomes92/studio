

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
  | 'Voting';
  
export type Brand = 'Natura' | 'Avon';

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: any;
}

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
  };
  components: PageComponent[];
  meta: {
    title: string;
    faviconUrl: string;
    loaderImageUrl: string;
    redirectUrl: string;
    dataExtensionKey: string;
    metaDescription: string;
    metaKeywords: string;
    tracking?: {
      ga4: { enabled: boolean; id?: string };
      meta: { enabled: boolean; id?: string };
      linkedin: { enabled: boolean; id?: string };
    }
  };
  cookieBanner?: {
    enabled: boolean;
    text: string;
    buttonText: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Project {
    id: string;
    name: string;
    userId: string;
    createdAt: any;
}
