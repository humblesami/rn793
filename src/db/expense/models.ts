class DbModel {
  id = 0;
  created_at = new Date();
}

class CategoryModel extends DbModel {
  static table = 'categories';
  title = '';
  description = '';
  parent_id = 0;
  trans_count = 0;
  total_amount = 0;
  show_children = false;
  transaction_list: TransCatModel[] = [];
}

class TransactionModel extends DbModel {
  static table = 'transactions';
  title = '';
  description = '';
  amount = 0;
  date_time = new Date();
  related_categories: CategoryModel[] = [];
}

class TransCatModel extends DbModel {
  static table = 'trans_cats';
  transaction_id = 0;
  category_id = 0;
}

export { DbModel, CategoryModel, TransactionModel, TransCatModel };
