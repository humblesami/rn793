import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, Button, View, ViewStyle } from 'react-native';

type PagingAttrs = {
  offset: number;
  given_limit: number;
  total_records: number;
  onLimitChanged: Function;
  onStartIndexChanged: Function;
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

function PaginationView(props: PagingAttrs) {
  // Instance variables as refs
  const page_count = useRef(0);
  const total_records = useRef(props.total_records || 0);
  const offset = useRef(props.offset);
  const page_number = useRef(Math.floor(props.offset / props.given_limit) + 1);
  const description = useRef('');
  const timeOutHolder = useRef<NodeJS.Timeout | null>(null);

  // State
  const [page_str, setPageStr] = useState('' + page_number.current);
  const [limit_str, setLimitStr] = useState('' + props.given_limit);

  // Update details on props/state change
  const updateDetails = () => {
    let on_page = props.given_limit;
    offset.current = props.offset;
    total_records.current = props.total_records;
    page_number.current = Math.floor(offset.current / on_page) + 1;
    page_count.current = Math.ceil(props.total_records / on_page);
    const till = Math.min(page_number.current * on_page, total_records.current)
    description.current = offset.current + 1 + ' to ' + till;
    description.current += ' from ' + total_records.current;
  };

  // Sync state with props changes
  useEffect(() => {
    setPageStr('' + (Math.floor(props.offset / props.given_limit) + 1));
    setLimitStr('' + props.given_limit);
    total_records.current = props.total_records || 0;
    offset.current = props.offset;
    // eslint-disable-next-line
  }, [props.offset, props.given_limit, props.total_records]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeOutHolder.current) clearTimeout(timeOutHolder.current);
    };
  }, []);

  // Page navigation handlers
  const onNextPage = () => changePageNumber('' + (page_number.current + 1));
  const onPreviousPage = () => changePageNumber('' + (page_number.current - 1));
  const gotoFirstPage = () => changePageNumber('1');
  const gotoLastPage = () => changePageNumber('' + page_count.current);

  // Change page number
  const changePageNumber = (txt: string) => {
    if (!txt) {
      setPageStr('');
      return;
    }
    let res = parseInt(txt);
    if (isNaN(res)) res = 1;
    if (res < 1) res = 1;
    if (res > page_count.current) res = page_count.current;
    setPageStr('' + res);
    if (timeOutHolder.current) clearTimeout(timeOutHolder.current);
    if (page_number.current !== res) {
      timeOutHolder.current = setTimeout(() => {
        page_number.current = res;
        offset.current = (res - 1) * props.given_limit;
        props.onStartIndexChanged(offset.current);
      }, 300);
    }
  };

  // Change limit
  const changeLimit = (txt: string) => {
    if (!txt) {
      setLimitStr('');
      return;
    }
    let res = parseInt(txt);
    if (isNaN(res)) res = 1;
    else if (res > total_records.current) res = total_records.current;
    else res = 1;
    setLimitStr('' + res);
    if (timeOutHolder.current) clearTimeout(timeOutHolder.current);
    if (props.given_limit !== res) {
      timeOutHolder.current = setTimeout(() => {
        offset.current = 0;
        props.onLimitChanged(offset.current, res);
      }, 300);
    }
  };

  updateDetails();

  return (
    <View style={{ paddingBottom: 10, paddingTop: 10 }}>
      <FlexView style={{ padding: 5, justifyContent: 'center' }}>
        <View style={styles.item}>
          <Button onPress={gotoFirstPage} title="First" />
        </View>
        <View style={styles.item}>
          <Button onPress={onPreviousPage} title="Prev" />
        </View>
        <View style={styles.item}>
          <FlexView style={{ justifyContent: 'center' }}>
            <View>
              <TextInput
                style={styles.input} value={page_str}
                keyboardType="numeric" onChangeText={changePageNumber}
              />
            </View>
            <Text> / {page_count.current}</Text>
          </FlexView>
        </View>
        <View style={styles.item}>
          <Button onPress={onNextPage} title="Next" />
        </View>
        <View style={styles.item}>
          <Button onPress={gotoLastPage} title="Last" />
        </View>
        <View style={styles.item}>
          <TextInput
            style={styles.input} value={limit_str}
            keyboardType="numeric" onChangeText={changeLimit}
          />
        </View>
      </FlexView>
      <View>
        <Text style={{ textAlign: 'center' }}>{description.current}</Text>
      </View>
    </View>
  );
};

export default PaginationView;
