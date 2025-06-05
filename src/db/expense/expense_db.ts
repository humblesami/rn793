import { executeQuery } from '../sqlite';
import { orm } from '../orm';
import { QueryParams } from '../types';

const ExpenseDb = {
  createTransaction: async function (data_row: any, cat_ids = []) {
    data_row['date_time'] = new Date().getTime();
    let cols_arr = Object.keys(data_row);
    let values = Object.values(data_row);

    let placeholders = Array(cols_arr.length).fill('?');
    let query_str = `insert into transactions (${cols_arr.join(',')}) values (${placeholders})`;
    let result = await executeQuery(query_str, values);
    console.log(values, query_str, result);
    if (cat_ids.length) {
      const transactionId = result.insertId;
      await this.createTransCats(transactionId, cat_ids);
    }
    return { ...data_row, id: result.insertId };
  },

  createCategory: async function (data_row: any, transactionId?: any) {
    try {
      let cols = Object.keys(data_row);
      let values = Object.values(data_row);

      let placeholders = Array(cols.length).fill('?');
      let query_str = `insert into categories (${cols.join(',')}) values (${placeholders})`;
      let result = await executeQuery(query_str, values);
      if (transactionId) {
        const transactionId = result.insertId;
        await this.createTransCats(transactionId, [result.insertId]);
      }
      return { ...data_row, id: result.insertId };
    } catch (err) {
      console.log('error in creating category ', err);
    }
  },

  createTransCats: async function (transactionId: any, categoryIds: any[]) {
    const placeholders = categoryIds.map(() => '(?, ?)').join(',');
    let query_str = `insert into trans_cats (transaction_id, category_id) values ${placeholders}`;
    const values = categoryIds.flatMap(categoryId => [
      transactionId,
      categoryId,
    ]);
    //console.log(query_str, transactionId, categoryIds, values);
    let res = await executeQuery(query_str, values);
    res = res.rowsAffected;
    return res;
  },

  searchCategories: async function (
    params: QueryParams = {
      grouping: '',
      ordering: '',
      paging: { offset: 0, per_page: 0, record_count: 0 },
    },
    kw: string = '',
  ) {
    let values = [];
    let query_str = `
        select title, id from categories c		
        `;
    if (kw) {
      query_str += ' where title like ?';
      values.push('%' + kw + '%');
    }
    query_str += ' order by trans_count';

    query_str += orm.makeQueryParams(params);
    let from_point = kw ? 'filtered cats' : 'default cats';
    let full_cat_list = await executeQuery(query_str, values, from_point);
    full_cat_list = full_cat_list.rows;
    //console.log(8900432, from_point, full_cat_list);
    return full_cat_list;
  },

  applyPagination: function (paging_param?: any) {
    let extra = '';
    const per_page = paging_param?.per_page;
    if (per_page) {
      extra += ` LIMIT ${per_page}`;
      const offset = paging_param?.offset;
      if (offset) {
        extra += ` OFFSET ${offset}`;
      }
    }
    return extra;
  },

  readCategoriesSummary: async function (params: QueryParams) {
    try {
      let countResult = await executeQuery(
        `SELECT COUNT(*) AS cnt FROM categories`,
      );
      let totalCategories = countResult.rows[0]?.cnt || 0;
      if (params.paging) {
        params.paging.record_count = totalCategories;
      }
      let query_str = `
                SELECT 
                    c.id, c.title, COUNT(t.id) AS trans_count,
                    SUM(t.amount) AS total_amount
                FROM categories c
                LEFT JOIN trans_cats tc ON tc.category_id = c.id
                LEFT JOIN transactions t ON t.id = tc.transaction_id
                GROUP BY c.id, c.title
                order by total_amount desc
            `;
      query_str += this.applyPagination(params.paging);
      const result = await executeQuery(query_str);
      return result.rows;
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      return [];
    }
  },

  getTransactions: async function (
    params: QueryParams = {
      grouping: '',
      ordering: '',
      paging: { offset: 0, per_page: 0, record_count: 0 },
    },
    filters: any = [],
  ) {
    try {
      let query_str = `select count(*) as cnt from transactions`;
      let result = await executeQuery(query_str);
      result = result.rows;
      let page_data = params.paging;
      if (!result.length) {
        return [];
      }
      if (page_data) {
        page_data.record_count = result[0].cnt;
      }

      query_str = `
                SELECT t.amount, t.id, t.title, t.created_at
                FROM transactions t                
            `;

      let values: any = [];
      const res_filters = orm.joinFilters(query_str, filters);
      query_str = res_filters.values.length ? res_filters.str : query_str;
      values = values.concat(res_filters.values);

      query_str += ' ORDER BY t.id DESC ';
      query_str += this.applyPagination(params.paging);
      result = await executeQuery(query_str, values);
      let transactions = result.rows;

      const trans_ids = transactions.map(function (row: any) {
        return row.id;
      });
      if (trans_ids.length === 0) return []; // early return if no transactions

      // 3. Fetch related categories for these transactions
      query_str = `
                SELECT tc.transaction_id, c.id AS category_id, c.title AS category_title
                FROM trans_cats tc
                JOIN categories c ON tc.category_id = c.id
                WHERE tc.transaction_id IN (${trans_ids.map(() => '?').join(',')})                
            `;
      result = await executeQuery(query_str, trans_ids);
      const categories = result.rows;
      const catMap: any = {};
      for (const row of categories) {
        if (!catMap[row.transaction_id]) {
          catMap[row.transaction_id] = [];
        }
        catMap[row.transaction_id].push({
          id: row.category_id,
          title: row.category_title,
        });
      }

      // 5. Attach related categories to each transaction
      for (const tx of transactions) {
        tx.related_categories = catMap[tx.id] || [];
      }

      return transactions;
    } catch (error) {
      console.error('Error in getting transactions:', error);
      return [];
    }
  },

  getCategoryTransactions: async function (categoryId: any) {
    let query_str = `
        select tc.transaction_id, t.* from transactions t
        join trans_cats tc on t.id=tc.transaction_id
        where category_id=? 
        order by t.id desc
        `;
    let result = await executeQuery(query_str, [categoryId]);
    return result.rows;
  },

  deleteRecords: async function (table_name: string, filters: any = []) {
    // console.log("Deleting from "+table_name)
    let query_str = 'delete from ' + table_name;

    let values: any = [];
    const res_filters = orm.joinFilters(query_str, filters);
    query_str = res_filters.values.length ? res_filters.str : query_str;
    values = values.concat(res_filters.values);

    const result = await executeQuery(query_str, values);
    return result;
  },

  updateRecords: async function (
    table_name: string,
    changeData: Record<string, any>,
    filters: any = [],
  ) {
    delete changeData['id'];
    delete changeData['created_at'];
    try {
      let cols = [];
      let values: any = [];
      for (let key in changeData) {
        cols.push(key + '=?');
        values.push(changeData[key]);
      }
      let query_str = `update ${table_name} set ${cols.join(',')}`;
      const res_filters = orm.joinFilters(query_str, filters);
      query_str = res_filters.values.length ? res_filters.str : query_str;
      values = values.concat(res_filters.values);

      const result = await executeQuery(query_str, values);
      return result;
    } catch (err) {
      let message = 'Error in modify => ' + table_name + ' => ' + err;
      console.log(18881, message, changeData);
      return 0;
    }
  },

  truncateTable: async function (table_name: string) {
    try {
      let res = await executeQuery(`DELETE FROM ${table_name}`);
      await executeQuery(
        `DELETE FROM sqlite_sequence WHERE name='${table_name}'`,
      );
      console.log('truncated ' + table_name, res);
      return 'done';
    } catch (err) {
      return 'Error in truncate ' + err;
    }
  },
};

export { ExpenseDb };
