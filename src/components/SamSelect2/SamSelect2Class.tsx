import React, { Component } from 'react';
import {
  Text,
  View,
  Alert,
  Pressable,
  TextInput,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { s2Styles } from './Select2Syles';

interface SamSelect2Props {
  defaultItems: Record<string, any>[]; // Optional array of default items
  searchedItems: Record<string, any>[]; // Optional array of search items
  selectedItems: Record<string, any>[]; // Required array of selected items
  multiple: boolean; // Optional flag for multiple selection (defaults to true)
  prevent_create: boolean; // Optional flag to prevent creating new items (defaults to false)
  displayField: string; // Required field name to display for items
  imageField: string;
  styling: {
    container?: ViewStyle;
    item?: ViewStyle;
    itemsContainer?: ViewStyle;
    itemText?: TextStyle;
    input?: ViewStyle;
    selectedItem?: ViewStyle;
    deleteButton?: ViewStyle;
  };
  events: {
    onItemAdded?: (item: string, selection: any) => Promise<void>;
    onItemSelected?: (item: string, selection: any) => void;
    onItemUnselected?: (item: string, selection: any, index: number) => void;
    onSearch?: (search_kw: string) => Promise<[]>;
  };
  textInput: {
    placeholder: string;
    underlineColorAndroid: string;
  };
  searchText: string;
}

interface Select2State {
  newTag: string;
  must_do: boolean;
  input_focused: boolean;
  defaultItems: any[];
  searchedItems: any[];
  selectedItems: any[];
  searchString: string;
}

class SamSelect2Class extends Component<SamSelect2Props, Select2State> {
  constructor(props: SamSelect2Props) {
    super(props);
    this.state = {
      newTag: '',
      must_do: false,
      searchedItems: [],
      input_focused: false,
      defaultItems: props.defaultItems,
      selectedItems: props.selectedItems,
      searchString: props.searchText || '',
    };
    this.attributes = props;
  }
  attributes: SamSelect2Props;
  inputElementRef: any;

  componentDidMount() { }

  refineUpdates(args = {}, from_point = '') {
    let args1: Record<string, any> = args;
    let key: keyof Select2State;
    for (key in this.state) {
      if (args1['' + key] == this.state[key]) {
        //console.log(15, 'Delete ' + key + ' in args', from_point);
        delete args1['' + key];
      }
    }
    args = args1;
    let state_updates = args;
    return state_updates;
  }

  setTheState(args = {}, from_point = '', calllback = () => { }) {
    if (from_point) from_point = ' => ' + from_point;
    let state_updates = this.refineUpdates(args, from_point);
    let updated_keys = Object.keys(state_updates);
    if (!updated_keys.length) {
      console.log(16, 'No updates at all', from_point);
      return;
    }
    if (updated_keys.length == 1 && updated_keys[0] == 'must_do') {
      state_updates = {};
    }
    super.setState(state_updates, function () {
      calllback();
    });
  }

  onItemRemoved(removedItem: any, index: number) {
    const temp_items = this.state.selectedItems.filter(
      x => x.id !== removedItem.id,
    );
    if (this.attributes.events.onItemUnselected) {
      this.attributes.events.onItemUnselected(removedItem, temp_items, index);
    }
    let found = this.state.defaultItems.find(x => x.id == removedItem.id);
    if (!found) {
      this.researchItems(
        {
          selectedItems: temp_items,
          defaultItems: [...this.state.defaultItems, removedItem],
        },
        'Item removed',
      );
    } else {
      this.researchItems({ selectedItems: temp_items }, 'Item removed');
    }
  }

  async onNewItem(newTag: string) {
    let created_item: any = { id: Date.now() };
    if (!newTag) {
      Alert.alert('Invalid new tag');
      return;
    }
    created_item[this.attributes.displayField] = newTag;
    if (!created_item.title && created_item.name) {
      console.log(4233, created_item);
      Alert.alert('No name for new tag');
      return;
    }
    let updated_selection = [...this.state.selectedItems, created_item];
    if (this.attributes.events.onItemAdded) {
      created_item = await this.attributes.events.onItemAdded(
        created_item,
        updated_selection,
      );
      if (created_item) {
        updated_selection[updated_selection.length - 1] = created_item;
      }
    }
    let args = {
      selectedItems: updated_selection,
      defaultItems: [...this.state.defaultItems, created_item],
    };
    this.researchItems(args, 'Item Added');
  }

  onItemChosen(chosenItem: any) {
    let updated_selection = [...this.state.selectedItems, chosenItem];
    if (this.attributes.events.onItemSelected) {
      this.attributes.events.onItemSelected(chosenItem, updated_selection);
    }
    let args = { selectedItems: updated_selection };
    this.researchItems(args, 'Item chosen');
  }

  setInputText(txt: string = '') {
    this.inputElementRef.value = txt;
    if (this.inputElementRef.setNativeProps) {
      this.inputElementRef.setNativeProps({ text: txt });
    }
  }

  async researchItems(temp_updates = {}, from_point = '') {
    let obj_it = this;
    let display_field = this.attributes.displayField;
    let filterd_options = this.map_items(
      this.state.defaultItems,
      display_field,
    );
    let updates_now: Record<string, any> = { 
      ...temp_updates, must_do: true, searchString: '', newTag: '',
      input_focused: true, searchedItems: filterd_options
    };
    this.setTheState(updates_now, from_point, function(){
      obj_it.setInputText('');
    });
  }

  async onInputFocused() {
    if (!this.state.input_focused) {
      let res = await this.searchInList(this.state.searchString, {
        input_focused: true,
      });
      this.setTheState(res);
    }
  }

  async onInputBlurred(){
    this.setTheState({input_focused: false});
  }

  hideListItems() {
    this.setTheState({ input_focused: false });
  }

  last_kw = '';
  async onInputTextChange(txt: string='') {
    if (txt == this.last_kw) {
      return;
    }
    if(txt.startsWith(this.last_kw) && this.state.newTag) {
      this.last_kw = txt;
      return;
    }
    this.last_kw = txt;
    let res = await this.searchInList(txt);
    this.setTheState(res, 'Input Text Change');
  }

  async searchInList(input_kw: string, received_updates = {}) {
    let filtered_items: any = [];
    if (!input_kw) {
      if (!this.state.defaultItems.length && this.attributes.events.onSearch) {
        filtered_items = await this.attributes.events.onSearch('');
      } else {
        filtered_items = this.state.defaultItems;
      }
    } else {
      if (this.attributes.events.onSearch) {
        filtered_items = await this.attributes.events.onSearch(input_kw);
      } else {
        let display_field = this.attributes.displayField;
        filtered_items = this.state.defaultItems.filter(
          x =>
            ('' + x[display_field])
              .toLowerCase()
              .indexOf(input_kw.toLowerCase()) > -1,
        );
      }
    }
    let tempNotMatched = '';
    if (!filtered_items.length && input_kw) {
      tempNotMatched = input_kw;
    }
    let display_field = this.attributes.displayField;
    filtered_items = this.map_items(filtered_items, display_field);
    let local_updates = {
      newTag: tempNotMatched,
      input_focused: tempNotMatched ? false: true,
      defaultItems: this.state.defaultItems,
    };
    if (!input_kw && !this.state.defaultItems.length) {
      local_updates.defaultItems = filtered_items;
    }
    return {
      ...received_updates,
      searchedItems: filtered_items,
      ...local_updates,
    };
  }

  signleSelectionPressed(temp_items: any[]) {
    this.onItemRemoved(temp_items[0], 0);
  }

  render_selected_items() {
    let obj_it = this;
    let selected_lis = this.state.selectedItems || [];
    if (!Array.isArray(selected_lis)) {
      Alert.alert('Not valid selectedItems');
      return <></>;
    }
    let selected_istyle = Object.assign({}, s2Styles.selectedItem);
    let del_btn_style = this.attributes.styling.deleteButton;

    if (!this.attributes.multiple) {
      if (!selected_lis.length) {
        return null;
      }
      return (
        <Pressable
          style={[s2Styles.selectedItem, s2Styles.singleSelectedItem]}
          onPress={() => obj_it.signleSelectionPressed(selected_lis)}>
          <Text style={{ color: '#555' }}>
            {selected_lis[0][this.attributes.displayField]}
          </Text>
          <View style={del_btn_style}>
            <Text style={{ color: 'white' }}>X</Text>
          </View>
        </Pressable>
      );
    }
    return (
      <View style={[s2Styles.selection_container]}>
        {selected_lis.map((toRender, index) => {
          return (
            <View key={index} style={selected_istyle}>
              <Text style={{ color: '#fff' }}>
                {toRender[this.attributes.displayField]}
              </Text>
              <Pressable
                style={del_btn_style}
                onPress={() => obj_it.onItemRemoved(toRender, index)}>
                <Text style={{ color: 'white' }}>X</Text>
              </Pressable>
            </View>
          );
        })}
        {!this.attributes.prevent_create && this.state.newTag ? (
          <Pressable
            style={s2Styles.addBtn}
            onPress={() => {
              obj_it.onNewItem(obj_it.state.newTag);
            }}>
            <Text style={{ color: 'white' }}>Create</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  render_list() {
    let obj_it = this;
    if (!this.state.input_focused) return;
    try {
      let filteredOptions = this.state.searchedItems.filter(item => {
        return !this.state.selectedItems.find(x => x.id == item.id);
      });

      if (!this.state.input_focused) {
        return <></>;
      }
      return (
        <View style={{ position: 'relative' }}>
          <Pressable
            style={s2Styles.cancelBtn}
            onPress={() => obj_it.hideListItems()}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Hide</Text>
          </Pressable>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={s2Styles.listContainer}>
            {filteredOptions.map((listItem, index) => (
              <Pressable
                key={index} style={[s2Styles.stlistItem]}
                onPress={() => {
                  obj_it.onItemChosen(listItem);
              }}>
                <Text style={s2Styles.itemText}>
                  {listItem[this.attributes.displayField]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      );
    } catch (err) {
      return (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={s2Styles.listContainer}
          contentContainerStyle={{ paddingVertical: 10 }}>
          <Text>Error in gettin list = {'' + err} </Text>
        </ScrollView>
      );
    }
  }

  map_items(itemsToRender: any[], label_field: string) {
    let items = [];
    if (!itemsToRender.length) {
      return [];
    }
    if (!itemsToRender[0][label_field]) {
      for (let item of itemsToRender) {
        let list_item: any = { id: item.id };
        list_item[label_field] = item[label_field] || item.name || item.title;
        items.push(list_item);
      }
      itemsToRender = items;
    }
    return itemsToRender;
  }

  renderTextInput() {
    let obj_it = this;
    if (this.state.selectedItems.length && !this.attributes.multiple) {
      return <></>;
    }
    let receivedTextProps = this.attributes.textInput;
    const oldSupport = [
      { key: 'ref', val: (e: any) => (obj_it.inputElementRef = e) },
      { key: 'style', val: obj_it.attributes.styling.input },
      {
        key: 'onChangeText',
        val: (txt: string) => obj_it.onInputTextChange(txt),
      },
      { key: 'onPressIn', val: async (txt: string) => obj_it.onInputFocused() },
      { key: 'onFocus', val: async (txt: string) => obj_it.onInputFocused() },
      { key: 'onBlur', val: async (txt: string) => obj_it.onInputBlurred() },
      { key: 'placeholder', val: receivedTextProps.placeholder },
    ];
    let textProps: Record<string, any> = {};
    oldSupport.forEach(kv => {
      textProps[kv.key] = kv.val;
    });
    textProps['style'] = this.attributes.styling.input;
    return <TextInput {...textProps} />;
  }

  render() {
    console.log(89000233, 'rend', (new Date().getTime()));
    return (
      <View style={this.attributes.styling.container}>
        {this.render_selected_items()}
        {this.renderTextInput()}
        {this.attributes.multiple || !this.state.selectedItems.length ? ( this.render_list())
        : ( <></> )}
      </View>
    );
  }
}

export { SamSelect2Class };
