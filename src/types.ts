import { NavigationProp } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

export interface PropsType {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
  defaultDateFrom?: Date;
}

export interface BaseState {
  data_loading: string;
  objects_list: any[];
  editMode: number;
  load_count: number;
  touch_count: number;
  page_data: {
    record_count: number;
    offset: number;
    per_page: number;
  };
  showChildren: boolean;
}
