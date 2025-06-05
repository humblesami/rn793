import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  ViewStyle,
} from 'react-native';

type PagingProps = {
  offset: number;
  given_limit: number;
  total_records: number;
  onLimitChanged: Function;
  onStartIndexChanged: Function;
};

type PagingState = {
  isLoading: boolean;
  page_str: string;
  limit_str: string;
};

type Props = {
  children: any[];
  style?: ViewStyle;
};

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 2,
  },
  input: {
    borderColor: '#bbb',
    borderWidth: 1,
    padding: 5,
    height: 36,
    borderRadius: 2,
  },
  defaultStyle: {
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

function FlexView({ children, style }: Props) {
  return <View style={[styles.defaultStyle, style]}>{children}</View>;
}

export default class PaginationView extends React.Component<
  PagingProps,
  PagingState
> {
  private page_count = 0;
  private total_records = 0;
  private offset: number = 0;
  private page_number: number = 1;
  private description: string = '';
  constructor(props: PagingProps) {
    super(props);
    this.state = {
      page_str:
        '' + (Math.floor(this.props.offset / this.props.given_limit) + 1),
      isLoading: false,
      limit_str: '' + props.given_limit,
    };
    this.total_records = props.total_records || 0;
    //console.log('Constructor called');
  }

  updateDetails() {
    let on_page = this.props.given_limit;
    this.offset = this.props.offset;
    this.total_records = this.props.total_records;
    this.page_number = Math.floor(this.offset / on_page) + 1;
    this.page_count = Math.ceil(this.props.total_records / on_page);
    this.description =
      this.offset +
      1 +
      ' to ' +
      Math.min(this.page_number * on_page, this.total_records);
    this.description += ' from ' + this.total_records;
  }

  onNextPage() {
    this.changePageNumber('' + (this.page_number + 1));
  }
  onPreviousPage() {
    this.changePageNumber('' + (this.page_number - 1));
  }
  gotoFirstPage() {
    this.changePageNumber('' + 1);
  }
  gotoLastPage() {
    this.changePageNumber('' + this.page_count);
  }

  async changePageNumber(txt: string) {
    if (!txt) {
      this.setState({ page_str: '' });
      return;
    }
    let res = parseInt(txt);
    if (res < 1) {
      res = 1;
    }
    if (res > this.page_count) {
      res = this.page_count;
    }
    let obj_it = this;
    this.setState({ page_str: '' + res });
    clearTimeout(obj_it.timeOutHolder);
    if (this.page_number != res) {
      obj_it.timeOutHolder = setTimeout(async () => {
        obj_it.page_number = res;
        obj_it.offset = (res - 1) * obj_it.props.given_limit;
        obj_it.props.onStartIndexChanged(obj_it.offset);
      }, 300);
    }
  }

  timeOutHolder: NodeJS.Timeout = setTimeout(() => { }, 1);

  async changeLimit(txt: string) {
    if (!txt) {
      this.setState({ limit_str: '' });
      return;
    }
    let res = parseInt(txt);
    if (res > this.total_records) {
      res = this.total_records;
    }
    if (res < 1) {
      res = 1;
    }
    let obj_it = this;
    this.setState({ limit_str: '' + res });
    clearTimeout(obj_it.timeOutHolder);
    if (this.props.given_limit != res) {
      obj_it.timeOutHolder = setTimeout(async () => {
        obj_it.offset = 0;
        obj_it.props.onLimitChanged(obj_it.offset, res);
      }, 300);
    }
  }

  render() {
    let obj_it = this;
    this.updateDetails();
    // if(!this.total_records){
    //     this.description = 'No records found';
    //     return(
    //         <View style={{paddingBottom: 10, paddingTop: 10}}>
    //             <Text style={{textAlign: 'center'}}>{this.description}</Text>
    //         </View>
    //     );
    // }
    return (
      <View style={{ paddingBottom: 10, paddingTop: 10 }}>
        <FlexView style={{ padding: 5, justifyContent: 'center' }}>
          <View style={[styles.item, {}]}>
            <Button onPress={() => this.gotoFirstPage()} title="First" />
          </View>
          <View style={[styles.item, {}]}>
            <Button onPress={() => this.onPreviousPage()} title="Prev" />
          </View>
          <View style={[styles.item, {}]}>
            <FlexView style={{ justifyContent: 'center' }}>
              <View style={{}}>
                <TextInput
                  style={styles.input}
                  value={this.state.page_str}
                  keyboardType="numeric"
                  onChangeText={(txt: string) => {
                    obj_it.changePageNumber(txt);
                  }}
                />
              </View>
              <Text> / {this.page_count}</Text>
            </FlexView>
          </View>
          <View style={[styles.item, {}]}>
            <Button onPress={() => this.onNextPage()} title="Next" />
          </View>
          <View style={[styles.item, {}]}>
            <Button onPress={() => this.gotoLastPage()} title="Last" />
          </View>
          <View style={[styles.item, {}]}>
            <TextInput
              style={styles.input}
              value={this.state.limit_str}
              keyboardType="numeric"
              onChangeText={(txt: string) => {
                obj_it.changeLimit(txt);
              }}
            />
          </View>
        </FlexView>
        <View>
          <Text style={{ textAlign: 'center' }}>{this.description}</Text>
        </View>
      </View>
    );
  }
}
