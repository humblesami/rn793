import React, { Component, ReactNode } from 'react';
import { View, Text, Button, ScrollView, Dimensions } from 'react-native';
import { PropsType, BaseState } from '../types';
import PopupOverlay from '../components/Overlay';
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export default class AbstractScreen extends Component<PropsType, BaseState> {
  protected id: string;
  protected current_route: string = '';
  protected goto: (route: string) => void = () => { };
  constructor(props: PropsType, child_id = 'none') {
    super(props);
    this.state = {
      data_loading: '',
      editMode: 0,
      load_count: 0,
      touch_count: 0,
      page_data: {
        record_count: 0,
        offset: 0,
        per_page: 3,
      },
      showChildren: false,
      objects_list: [],
    };

    this.temp_state = this.state;
    this.id = child_id;

    if (props.route) {
      this.current_route = props.route.name;
      this.goto = props.navigation.navigate;
    }
  }

  protected issues: Record<string, string> = {};
  protected messages: Record<string, string> = {};
  protected mounted: number = 0;
  protected last_change_point: string = '';
  protected state_changing: number = 0;

  protected temp_state: Record<string, any>;

  protected winHeight = windowHeight;

  private unsubscribeFocusListener: any; // Store the listener for cleanup

  componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribeFocusListener = navigation.addListener('focus', () => {
      if (!this.mounted) {
        this.mounted = 1;
      }
      this.fetchMyData();
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeFocusListener) {
      this.unsubscribeFocusListener();
    }
  }

  async fetchMyData(args = {}): Promise<void> {
    if (this.mounted) {
      this.set_state(args, 'fecth data');
    } else {
      console.log('Wont set state');
    }
  }

  set_state(args: Record<string, any>, from_point = ''): void {
    let obj_it = this;
    if (!this.mounted) {
      return;
    }
    if (!this.state_changing) {
      this.state_changing = 1;
    } else {
      return;
    }

    for (let key in args) {
      this.temp_state[key] = args[key];
    }

    this.last_change_point = from_point;
    this.setState(
      (prevState: BaseState) => ({
        ...prevState,
        ...obj_it.temp_state,
      }),
      function () {
        obj_it.temp_state = {};
        obj_it.state_changing = 0;
      },
    );
  }

  render_errors(from_point = ' from'): ReactNode {
    return this._render_messages(this.issues, 'Errors', 'red');
  }

  render_messages(from_point = ' from'): ReactNode {
    return this._render_messages(this.messages, 'Messages', 'green');
  }

  formatTime(dt = new Date()) {
    let res = dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
    return res;
  }

  formatDateTime(dt = new Date()) {
    let res = dt.getDate() + '-' + dt.getMonth() + ' ' + this.formatTime(dt);
    return res;
  }

  _renderLoader() {
    let obj_it = this;
    if (this.state.data_loading && this.state.data_loading != 'done') {
      return (<PopupOverlay message={this.state.data_loading}
        onHide={() => { obj_it.setState({ data_loading: '' }) }}
        visible={true} />)
    } else {
      <></>
    }

  }

  _render_messages(
    lines: Record<string, string>,
    heading: string,
    font_color: string,
  ): ReactNode {
    let obj_it = this;
    let error_keys = Object.keys(lines);
    if (!error_keys.length) return null;
    return (
      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        style={[
          { marginTop: 3, maxHeight: windowHeight - 100, paddingBottom: 0 },
        ]}>
        <View style={{ backgroundColor: '#ddd', width: '100%' }}>
          <Text style={{ padding: 5, fontSize: 18, borderColor: '#eee' }}>
            {heading} ({error_keys.length})
          </Text>
        </View>
        <View>
          {error_keys.map((item, i) => {
            return (
              <View key={i}
                style={{ marginBottom: 5, backgroundColor: font_color }}>
                <Text
                  style={[
                    {
                      fontSize: 14,
                      padding: 7,
                      borderTopWidth: 1,
                      borderColor: '#eee',
                      color: 'white',
                    },
                  ]}>
                  {lines[item]} : {obj_it.formatTime()}
                </Text>
              </View>
            );
          })}
          <Button
            onPress={() => {
              this.messages = {};
              this.issues = {};
              obj_it.set_state({}, 'message hidden');
            }}
            title="OK"
          />
        </View>
      </ScrollView>
    );
  }
}
