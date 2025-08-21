export type ComponentType = 'Header' | 'Banner' | 'Form' | 'Footer' | 'TextBlock' | 'Image';

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: any;
}

export interface CloudPage {
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
  };
}
