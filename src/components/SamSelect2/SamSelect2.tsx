import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { SamSelect2Class } from './SamSelect2Class';

interface Styling {
  container?: ViewStyle;
  item?: ViewStyle;
  itemsContainer?: ViewStyle;
  itemText?: TextStyle;
  input?: ViewStyle;
  selectedItem?: ViewStyle;
  deleteButton?: ViewStyle;
  [key: string]: any; // Allow additional styling properties
}

interface SamSelect2Props {
  defaultItems?: Record<string, any>[]; // Optional array of default items
  searchedItems?: Record<string, any>[]; // Optional array of search items
  selectedItems?: Record<string, any>[]; // Required array of selected items
  multiple?: boolean; // Optional flag for multiple selection (defaults to true)
  prevent_create?: boolean; // Optional flag to prevent creating new items (defaults to false)
  displayField?: string; // Required field name to display for items
  imageField?: string; // Required field name to display for items
  styling?: Styling; // Use the flexible Styling type
  events?: {
    onItemAdded?: (item: string, selection: any) => Promise<void>;
    onItemSelected?: (item: string, selection: any) => void;
    onItemUnselected?: (item: string, selection: any, index: number) => void;
    onSearch?: (search_kw: string) => Promise<[]>;
  };
  textInput?: {
    placeholder: string;
    underlineColorAndroid: string;
  };
  search_kw?: string; // Optional search keyword
}

let default_styling: Styling = {
  container: {},
  item: {
    padding: 10,
    marginTop: 2,
    borderColor: '#888',
    borderRadius: 2,
  },
  itemsContainer: { maxHeight: 140 },
  itemText: { color: '#222' },
  input: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 2,
  },
  selectedItem: {
    margin: 3,
    padding: 5,
    minWidth: 40,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'blue',
    alignItems: 'center',
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: '#f16d6b',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 25,
    borderRadius: 100,
    marginLeft: 5,
  },
};

function SamSelect2({
  defaultItems = [],
  searchedItems = [],
  selectedItems = [],
  multiple = true,
  prevent_create = false,
  displayField = 'name',
  imageField = '',
  search_kw = '',
  styling,
  events = {},
  textInput = {
    placeholder: 'placeholder',
    underlineColorAndroid: 'transparent',
  },
}: SamSelect2Props) {
  if (!textInput.placeholder) {
    textInput.placeholder = 'placeholder';
    textInput.underlineColorAndroid = 'transparent';
  }

  const now_styling = {
    ...default_styling,
    ...styling,
  };

  return (
    <SamSelect2Class
      selectedItems={selectedItems}
      multiple={multiple}
      imageField={imageField}
      displayField={displayField}
      defaultItems={defaultItems}
      searchText={search_kw}
      searchedItems={searchedItems}
      styling={now_styling}
      events={events}
      prevent_create={prevent_create}
      textInput={textInput}
    />
  );
}

export { SamSelect2 };
