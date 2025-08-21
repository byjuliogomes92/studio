
export type ComponentType = 'Header' | 'Banner' | 'Form' | 'Footer' | 'TextBlock' | 'Image';

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
