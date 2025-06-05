import React from 'react';
import {
  Alert,
  Text,
  TextInput,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
} from 'react-native';
import { StyleSheet } from 'react-native';
import SamDateTime from '../services/SamDateTime';

import AbstractScreen from './AbstractScreen';
import { CompButton } from '../components/CompButton';
import { styles } from '../components/ComponentStyles';
import { SamSelect2 } from '../components/SamSelect2/SamSelect2';

import FlexView from '../components/FlexView';
import PaginationView from '../components/PaginationView';

import { ExpenseDb } from '../db/expense/expense_db';
import { CategoryModel, TransactionModel } from '../db/expense/models';
import DateTimeSelector from '../components/SamDatePicker';
import { IconButton } from '../components/IconButton';
import { SvgIcons } from '../icons';

class TransactionsListUtils {
  public defaultCategories: CategoryModel[] = [];
  public defaultStartDate: Date = SamDateTime.addInterval(-30, 'day');

  async fetchScreenData(caller_ob: any, edit_mode = 0) {
    try {
      let startTime = this.defaultStartDate.getTime();
      const filters = [['created_at', '>=', startTime]];
      let params = {
        paging: caller_ob.state.page_data,
      };
      let mapped_data =
        (await ExpenseDb.getTransactions(params, filters)) || [];

      if (edit_mode == -1) {
        this.defaultCategories = await ExpenseDb.searchCategories({
          paging: caller_ob.state.page_data,
        });
        edit_mode = 0;
      }
      //console.log(edit_mode, "getting transactions", mapped_data);
      caller_ob.setState({ objects_list: mapped_data, editMode: edit_mode });
    } catch (err) {
      console.log(err);
      let message = 'Error in obtaining transactions => ' + err;
      caller_ob.issues['init'] = message;
      console.log(message);
    }
  }

  async updateRow(row_data: any, params: any) {
    Object.assign(row_data, params);
  }

  async createTransaction(caller_ob: any, row_data: any) {
    caller_ob.setState({ data_loading: 'creating transaction' });
    let trans_data = {
      amount: row_data.amount,
      title: row_data.title,
    };
    let categories_data = row_data.related_categories || [];
    const cat_ids = categories_data.map(function (item: any) {
      return item.id;
    });

    let res = await ExpenseDb.createTransaction(trans_data, cat_ids);
    await this.fetchScreenData(caller_ob, -1);
    return res;
  }

  async deleteRecord(caller_ob: any, row_data: Record<string, any>) {
    let res = await ExpenseDb.deleteRecords('transactions', [
      ['id', '=', row_data.id],
    ]);
    if (res.rowsAffected) {
      res = await this.fetchScreenData(caller_ob, 0);
      return res;
    }
  }

  async updateTransaction(
    caller_ob: any,
    row_data: Record<string, any>,
    avoid_reload = 0,
  ) {
    delete row_data['created_at'];
    delete row_data['related_categories'];
    row_data['updated_at'] = new Date().getTime();
    const res = await ExpenseDb.updateRecords('transactions', row_data, [
      ['id', '=', row_data.id],
    ]);
    if (res.rowsAffected) {
      await this.fetchScreenData(caller_ob, -1);
    }
  }

  async duplicateRecord(caller_ob: any, row_data: Record<string, any>) {
    delete row_data['id'];
    delete row_data['created_at'];
    let res = await this.createTransaction(caller_ob, row_data);
    return res;
  }
}

class ListTransactions extends AbstractScreen {
  private service: TransactionsListUtils;
  protected headers: string[] = ['Rs', 'Categories', 'Title', 'Time', 'Edit'];
  protected col_ratio: any[] = ['12%', '37%', '18.3%', '19.2%', '13.5%'];

  protected edit_row_data: Record<string, any> = {
    id: '',
    related_categories: [],
    amount: '',
    title: '',
  };
  constructor(props: any) {
    super(props);
    this.service = new TransactionsListUtils();
    this.state = {
      ...this.state,
      data_loading: 'Loading Transactions',
      editMode: 0,
      touch_count: 0,
      page_data: {
        record_count: 0,
        per_page: 10,
        offset: 0,
      },
    };
  }

  async fetchMyData() {
    this.service.fetchScreenData(this);
  }

  callEditing(rowToEdit?: TransactionModel) {
    const obj_it = this;

    if (rowToEdit) {
      Object.assign(obj_it.edit_row_data, {
        id: rowToEdit.id,
        amount: rowToEdit.amount,
        title: rowToEdit.title,
        related_categories: rowToEdit.related_categories,
      });
    } else {
      Object.assign(obj_it.edit_row_data, {
        id: '',
        amount: '',
        title: '',
        related_categories: [],
      });
    }
    obj_it.setState({ editMode: 1 });
  }

  renderEditForm() {
    const obj_it = this;
    let editRow = obj_it.edit_row_data;
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.formHeading}>Update Transaction</Text>

        <View style={{}}>
          <Text style={styles.headerText}>Amount</Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={txt =>
              obj_it.service.updateRow(editRow, { amount: parseInt(txt) })
            }
            defaultValue={'' + (editRow.amount || '')}
            style={[styles.input]}
          />
        </View>

        <View style={[{ paddingTop: 10 }]}>
          <Text style={styles.headerText}>Categories</Text>
          {!Array.isArray(obj_it.service.defaultCategories) ? (
            <Text>Loading Categories Yet</Text>
          ) : (
            <SamSelect2
              defaultItems={obj_it.service.defaultCategories}
              selectedItems={editRow.related_categories}
              displayField="title"
              styling={{ container: { paddingBottom: 5 } }}
              events={{
                onSearch: async (search_kw: string) => {
                  let params = {
                    paging: { offset: 0, record_count: 0, per_page: 20 },
                  };
                  let res = await ExpenseDb.searchCategories(params, search_kw);
                  return res;
                },
                onItemSelected: (item: any, selection: any) => {
                  if (editRow.id) {
                    ExpenseDb.createTransCats(editRow.id, [item.id]);
                  }
                  console.log('selected');
                  editRow.related_categories.push(item);
                },
                onItemAdded: async (item: any, selection: any) => {
                  let itemToCreate = { title: item.name || item.title };
                  if (!itemToCreate.title) {
                    Alert.alert('No title/name given for category');
                    return;
                  }
                  let createdItem =
                    await ExpenseDb.createCategory(itemToCreate);
                  if (editRow.id) {
                    ExpenseDb.createTransCats(editRow.id, [createdItem.id]);
                  } else {
                    editRow.related_categories.push(createdItem);
                  }

                  return createdItem;
                },
                onItemUnselected: (item: any, selection: any, index: any) => {
                  ExpenseDb.deleteRecords('trans_cats', [
                    ['transaction_id', '=', editRow.id],
                    ['category_id', '=', item.id],
                  ]);
                },
              }}
            />
          )}
        </View>

        <View style={{}}>
          <Text style={styles.headerText}>Title</Text>
          <TextInput
            onChangeText={txt =>
              obj_it.service.updateRow(editRow, { title: txt })
            }
            defaultValue={'' + editRow.title}
            style={[styles.input]}
          />
        </View>

        <View style={{ paddingTop: 10 }}>
          {editRow.id ? (
            <FlexView>
              <CompButton onPress={() => obj_it.fetchMyData()} title="List" />
              <CompButton
                onPress={() => obj_it.service.deleteRecord(obj_it, editRow)}
                title="Delete"
              />
              <CompButton
                onPress={() => obj_it.service.duplicateRecord(obj_it, editRow)}
                title="Duplicate"
              />
              <CompButton
                onPress={() =>
                  obj_it.service.updateTransaction(obj_it, editRow)
                }
                title="Update"
              />
            </FlexView>
          ) : (
            <FlexView>
              <CompButton
                onPress={() => obj_it.fetchMyData()}
                title="Show List"
              />
              <CompButton
                onPress={() =>
                  obj_it.service.createTransaction(obj_it, editRow)
                }
                title="Save"
              />
            </FlexView>
          )}
        </View>
      </ScrollView>
    );
  }

  listRenderer() {
    const obj_it = this;
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {obj_it.state.objects_list.map((item: any, key: any) => (
          <View
            key={key}
            style={[styles.flexContainer, local_styles.trans_row]}>
            <View style={[{ width: obj_it.col_ratio[0] }, local_styles.cell]}>
              <Text style={[styles.bold]}>{item.amount}</Text>
            </View>

            <View
              style={[
                { padding: 2, width: obj_it.col_ratio[1] },
                styles.wrap,
                local_styles.cell,
              ]}>
              {item.related_categories.map(function (item: any, key: any) {
                return (
                  <View
                    key={key}
                    style={[
                      styles.border,
                      { padding: 5, marginRight: 1, marginBottom: 1 },
                    ]}>
                    <Text>{item.title}</Text>
                  </View>
                );
              })}
            </View>

            <View
              style={[
                { padding: 4, width: obj_it.col_ratio[2] },
                local_styles.cell,
              ]}>
              <Text>{'' + item.title}</Text>
            </View>
            <View
              style={[
                { padding: 4, width: obj_it.col_ratio[3] },
                local_styles.cell,
              ]}>
              <Text style={styles.time}>
                {item.created_at
                  ? SamDateTime.formatViaLib(item.created_at, 'DD/M h:mmA')
                  : 'TBA'}
              </Text>
            </View>

            <View style={{ width: obj_it.col_ratio[4] }}>
              <IconButton
                icon={SvgIcons.edit_icon}
                style={{ marginTop: 4 }}
                onPress={() => obj_it.callEditing(item)}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  listView() {
    let obj_it = this;
    return (
      <>
        <PaginationView
          given_limit={obj_it.state.page_data.per_page}
          offset={this.state.page_data.offset}
          total_records={obj_it.state.page_data.record_count}
          onStartIndexChanged={async (off_set: number) => {
            obj_it.state.page_data.offset = off_set;
            obj_it.fetchMyData();
          }}
          onLimitChanged={async (off_set: number, records_on_page: number) => {
            obj_it.state.page_data.per_page = records_on_page;
            obj_it.state.page_data.offset = off_set;
            obj_it.fetchMyData();
          }}
        />
        {/* <DateTimeSelector onChangeDateTime={() => { }} /> */}
        <CompButton onPress={() => obj_it.callEditing()} title="Add New" />
        <View style={[styles.flexContainer, { paddingTop: 10 }]}>
          {obj_it.headers.map((cell_data, i) => (
            <View
              key={i}
              style={[styles.border, { width: obj_it.col_ratio[i], padding: 4 }]}>
              <Text style={[styles.headerText]}>{cell_data}</Text>
            </View>
          ))}
        </View>
        {this.listRenderer()}
      </>
    );
  }

  conditional_view_type() {
    if (Object.keys(this.issues).length) {
      return this.render_errors();
    }

    if (this.state.editMode) {
      return this.renderEditForm();
    }
    return this.listView();
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, padding: 10 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'android' ? 90 : 0}>
          {this.conditional_view_type()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const local_styles = StyleSheet.create({
  trans_row: {
    borderColor: '#bbb',
    borderRadius: 5,
    borderWidth: 1,
  },
  cell: {
    verticalAlign: 'middle',
    borderColor: '#ddd',
    paddingTop: 5,
    paddingLeft: 2,
    borderRightWidth: 1,
  },
});

export { ListTransactions };
