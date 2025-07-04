import React from 'react';
import {
  Text, View, ScrollView, Pressable,
  KeyboardAvoidingView, SafeAreaView, Button,
} from 'react-native';
import AbstractScreen from './AbstractScreen';
import SamDateTime from '../services/SamDateTime';
import PaginationView from '../components/PaginationView';
import FlexView from '../components/FlexView';

import { PropsType } from '../types';
import { ExpenseDb } from '../db/expense/expense_db';
import { Pagination } from '../db/types';
import SamDatePicker from '../components/SamDatePicker';
import { colors, styles } from '../components/ComponentStyles';
import { IconSvg } from '../components/IconSvg';
import { SvgIcons } from '../icons';
import { CategoryModel } from '../db/expense/models';

class ListCategories extends AbstractScreen {
  private page_data: Pagination;
  constructor(props: PropsType) {
    //console.log(89003, 'const')
    super(props, 'list_categories');
    this.page_data = {
      record_count: 0, offset: 0, per_page: 10,
    };
    this.state = {
      ...this.state,
      load_count: 0,
      data_loading: '',
    };
  }

  async fetchMyData() {
    if (!this.state.data_loading) {
      this.setState({ data_loading: 'Loading Categories' });
    }
    let res = [];
    try {
      let startTime = Date.now() - 1000 * 60 * 60 * 24 * 5;
      if (this.props.defaultDateFrom) {
        startTime = this.props.defaultDateFrom.getTime();
      }
      res = await ExpenseDb.readCategoriesSummary({
        paging: this.page_data,
      });
    } catch (err) {
      let message = 'Error in getting categories ' + err;
      this.issues['screen_data'] = message;
    }
    this.setState({ data_loading: '', objects_list: res });
  }

  async deleleCategory(itemData: Record<string, any>) {
    this.setState({ data_loading: 'Deleting Category' });
    let obj_it = this;
    try {
      let res = await ExpenseDb.deleteRecords('categories', [
        ['id', '=', itemData.id],
      ]);
      if (!res.rowsAffected) {
        obj_it.issues['delete_categroy'] = 'Error in delete';
      }
    } catch (err) {
      obj_it.issues['delete_categroy'] = 'Error in force del cat ' + err;
    }
    this.fetchMyData();
  }

  async showChildren(cat_item: CategoryModel, col_ratio: any = []) {
    if (cat_item.trans_count && !cat_item.transaction_list) {
      this.setState({ data_loading: 'Loading Child Transactions' });
      cat_item.transaction_list = await ExpenseDb.getCategoryTransactions(
        cat_item.id,
      );
    }
    if (cat_item.show_children) {
      cat_item.show_children = false;
    } else {
      cat_item.show_children = true;
    }
    this.setState({ data_loading: '', load_count: this.state.load_count + 1 });
  }

  displayTransactions(cat_item: CategoryModel, col_ratio: any = []) {
    return cat_item.transaction_list.map((tr_item: any, index: number) => {
      return (
        <View
          style={[styles.borderBottom, styles.row, { padding: 5, borderColor: 'green' }]}
          key={index}>
          <Text style={[{ width: col_ratio[0] }]}>{tr_item.title}</Text>
          <Text style={[{ width: col_ratio[1] }]}>{tr_item.amount || '0'}</Text>
          <Text style={[{ width: col_ratio[2] }]}>
            {SamDateTime.formatViaLib(tr_item.created_at, 'DD MMM, h:mm A')}
          </Text>
          <Text style={[{ width: col_ratio[3] }]}></Text>
        </View>
      );
    });
  }

  render() {
    let obj_it = this;
    let allCategories = obj_it.state.objects_list;
    let a_month_earlier = SamDateTime.addInterval(-30, 'day') || new Date();
    let column_ratio: any[] = ['40%', '25%', '35%'];
    const headers = ['Name', 'Amount', 'Count'];
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.keyboardAvoid}>
          {obj_it.render_errors()}
          {obj_it.render_messages()}
          {this._renderLoader()}
          <PaginationView
            given_limit={obj_it.page_data.per_page}
            offset={obj_it.page_data.offset}
            total_records={obj_it.page_data.record_count}
            onStartIndexChanged={async (off_set: number) => {
              obj_it.page_data.offset = off_set;
              obj_it.fetchMyData();
            }}
            onLimitChanged={async (off_set: number, records_on_page: number) => {
              obj_it.page_data.per_page = records_on_page;
              obj_it.page_data.offset = off_set;
              obj_it.fetchMyData();
            }}
          />

          <View style={[styles.flexContainer, { paddingTop: 10 }]}>
            {headers.map((cell_data, i) => (
              <View key={i}
                style={[styles.border, { width: column_ratio[i], padding: 4 }]}>
                <Text style={[styles.headerText]}>{cell_data}</Text>
              </View>
            ))}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {allCategories.map((cat_item: CategoryModel, index: number) => {
              return (
                <View key={index} style={{ marginTop: 2 }}>
                  <View style={[styles.pressableItem, styles.flexSpaceBetween]}>
                    <Text
                      style={[styles.listItemText, { width: column_ratio[0] }]}>
                      {cat_item.title.toUpperCase()}
                    </Text>
                    <Text
                      style={[styles.listItemText, { width: column_ratio[1] }]}>
                      {cat_item.total_amount || '0'}
                    </Text>
                    <View style={[{ flex: 1, paddingRight: 5 }]}>
                      {cat_item.trans_count ? (
                        <Pressable
                          style={[styles.border, { paddingHorizontal: 5, alignSelf: 'flex-end' }]}
                          onPress={() => { obj_it.showChildren(cat_item) }}>
                          <Text style={{}}>{cat_item.trans_count}</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={[styles.border, { alignSelf: 'flex-end' }]}
                          onPress={() => obj_it.deleleCategory(cat_item)}>
                          <IconSvg
                            icon={SvgIcons.trash_icon}
                            color="red" size={24}
                          />
                        </Pressable>
                      )}
                    </View>
                  </View>
                  {cat_item.show_children &&
                    cat_item.transaction_list.length ? (
                    obj_it.displayTransactions(cat_item, column_ratio)
                  ) : (
                    <></>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

export { ListCategories };
