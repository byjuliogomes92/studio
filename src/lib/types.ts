export type ComponentType = 'Header' | 'Form' | 'TextBlock' | 'Footer' | 'Image';

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: any;
}

export interface CloudPage {
  styles: {
    backgroundColor: string;
    primaryColor: string;
    accentColor: string;
    textColor: string;
    fontFamily: string;
  };
  components: PageComponent[];
  meta: {
    title: string;
  };
}
