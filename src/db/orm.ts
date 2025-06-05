import { executeQuery } from './sqlite';
import { QueryParams } from './types';

type ItemType = Record<string, any>;
type relation = {
  t: string;
  fields: string[];
  col: string;
};
type ApiResult = { status: number; error: string; data: any };

const orm = {
  initApiResult: function (): ApiResult {
    let result: ApiResult = { status: 0, error: 'Uknown', data: {} };
    return result;
  },

  deleteRecords: async function (table_name: string, ids: any[], field = 'id') {
    if (typeof ids == 'string' || typeof ids == 'number') {
      ids = [ids];
    }
    let q = 'delete from ' + table_name + ' where ' + field + ' in (?)';
    let res = await executeQuery(q, ids);
    return res;
  },

  getMany2Many: function (t1: relation, t2: relation, tb: string) {
    let q = `
        select ${t1.t}.${t1.fields.join(',') || '*'} from ${t1.t}
        left join ${tb} on ${t1.t}.id=${tb}.${t1.col}
        join ${t2.t} on ${t2.t}.id=${tb}.${t2.col}
        `;
  },

  doInsert: function (table_name: string, data_rows: ItemType[] = []) {
    let columns = data_rows.length ? Object.keys(data_rows[0]) : [];
    if (!columns.length) return;

    let values = [];
    let ph_arr = [];
    for (let item of data_rows) {
      let pl_rows = [];
      let vals: any = [];
      for (let key in data_rows) {
        if (['id', 'created_at'].indexOf(key) > -1) continue;
        pl_rows.push('?');
        vals.push(data_rows[key]);
      }
      values.push(vals);
      ph_arr.push('+(' + pl_rows.join('?') + ')');
    }
    let ph_str = ph_arr.join(',');
    let cols_str = columns.join(',');
    let query_str =
      'insert into ' + table_name + ' ' + cols_str + ' values' + ph_str;
    let res = executeQuery(query_str, values);
    return res;
  },

  deleteRecordById: async function (
    table_name: string,
    itemId: string | Number,
  ) {
    let result = this.initApiResult();
    let obj_it = this;
    try {
      obj_it.deleteRecords(table_name, [itemId]);
      result = { status: 1, error: '', data: itemId };
    } catch (err) {
      let message = 'Error in delete ' + table_name + ' => ' + err;
      console.log(18881, message, itemId);
      result.error = message;
      throw err;
    }
    return result;
  },

  updateRecordbyId: async function (
    table_name: string,
    itemData: ItemType,
    id: any,
  ) {
    let result = this.initApiResult();
    let changeData: ItemType = {};
    try {
      let values = [];

      let cols = [];
      for (let key in itemData) {
        cols.push(key + '=?');
        values.push(itemData[key]);
      }
      let q = `update ${table_name} set ${cols.join(',')} where id=?`;
      await executeQuery(q, values);
      result = { status: 1, error: '', data: changeData };
    } catch (err) {
      let message = 'Error in modify => ' + table_name + ' => ' + err;
      console.log(18881, message, itemData);
      result.error = message;
    }
    return result;
  },

  makeQueryParams: function (
    params: QueryParams = {
      grouping: '',
      ordering: '',
      paging: { offset: 0, per_page: 0, record_count: 0 },
    },
  ) {
    let query_suffix = '';
    if (params.grouping) {
      query_suffix += ' group by ' + params.grouping;
    }
    if (params.ordering) {
      query_suffix += ' order by by ' + params.ordering;
    }
    if (params.paging?.offset) {
      query_suffix += ' limit ' + params.paging.offset;
      if (params.paging.per_page) {
        query_suffix += ',' + params.paging.per_page;
      }
    }
    return query_suffix;
  },

  joinFilters: function (query_str = '', filters: any = []) {
    let values: any = [];
    let res_filters = [];
    for (let item of filters) {
      res_filters.push(item[0] + item[1] + '?');
      values.push(item[2]);
    }
    if (values.length) {
      query_str += ' where ' + res_filters.join(' and ');
    }
    return { str: query_str, values: values };
  },

  groupJoinedRows: function (
    rows = [],
    groupKeyPrefix = '',
    nestedKeyPrefix = '',
    nestedKeyName = '',
  ) {
    let main_dict: any = {};
    function get_nested_row(row: any = {}, starter = '') {
      let nestedRow: any = {};
      let any_col = false;
      for (let key in row) {
        if (key.startsWith(starter)) {
          nestedRow[key.substring(2)] = row[key];
          if (!any_col && row[key]) {
            any_col = true;
          }
        }
      }
      if (!any_col) return;
      else return nestedRow;
    }

    for (const row of rows) {
      const groupId = row[`${groupKeyPrefix}id`];
      let nestedKeyVal = row[`${nestedKeyPrefix}id`];
      if (!main_dict[groupId]) {
        main_dict[groupId] = {};
      }
      let primary_row = main_dict[groupId];
      if (nestedKeyVal) {
        if (!primary_row[nestedKeyName]) {
          primary_row[nestedKeyName] = {};
        }
        let nested_row = get_nested_row(row, nestedKeyPrefix);
        if (nested_row) {
          primary_row[nestedKeyName][nestedKeyVal] = nested_row;
        }
      }
      for (let sub_key in row) {
        if (!sub_key.startsWith(nestedKeyPrefix)) {
          if (sub_key.startsWith(groupKeyPrefix)) {
            primary_row[sub_key.substring(groupKeyPrefix.length)] =
              row[sub_key];
          } else {
            primary_row[sub_key] = row[sub_key];
          }
        }
      }
    }
    for (const groupId in main_dict) {
      if (main_dict[groupId][nestedKeyName]) {
        main_dict[groupId][nestedKeyName] = Object.values(
          main_dict[groupId][nestedKeyName],
        );
      } else {
        main_dict[groupId][nestedKeyName] = [];
      }
    }
    let result = Object.values(main_dict);
    return result;
  },
};

export { orm };
