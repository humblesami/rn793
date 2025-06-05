import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);
let db: SQLite.SQLiteDatabase | undefined;
const dbName = 'expense.db';
async function openDatabase() {
	if (!db) {
		db = await SQLite.openDatabase({ name: dbName, location: 'default' });
		await db.executeSql('PRAGMA foreign_keys = ON;');
	}
	return db;
}

async function executeQuery(
	sql: string,
	params: any[] = [],
	from_point = '',
): Promise<any> {
	const database = await openDatabase();
	return new Promise((resolve, reject) => {
		database.transaction(tx => {
			tx.executeSql(
				sql,
				params,
				(_tx, result) => {
					let rows = [];
					for (let i = 0; i < result.rows.length; i++) {
						rows.push(result.rows.item(i));
					}
					let json_res = {
						rows: rows,
						rowsAffected: result.rowsAffected,
						insertId: result.insertId,
					};
					return resolve(json_res);
				},
				(_tx: any, error) => {
					console.log('Error in sql ', _tx.message);
					reject(_tx.message);
					return false; // important to return false here to stop default handler
				},
			);
		});
	});
}

async function deleteDatabaseIfExists(name: string) {
	try {
		await SQLite.deleteDatabase({ name, location: 'default' });
		db = undefined;
		console.log(`${name} deleted successfully.`);
	} catch (error) {
		console.error('Failed to delete database:', error);
	}
}

async function setupSchema() {
	await executeQuery(`
		CREATE TABLE IF NOT EXISTS transactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			amount FLOAT NOT NULL,
			date_time DATETIME NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await executeQuery(`
		CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			trans_count float default 0,
			total_amount float default 0,			
			parent_id INTEGER DEFAULT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await executeQuery(`
		CREATE TABLE IF NOT EXISTS trans_cats (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		category_id INTEGER NOT NULL,
		transaction_id INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
		FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
		);
	`);

	await executeQuery(`
		CREATE TABLE IF NOT EXISTS tasks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			completed INTEGER DEFAULT 0
		);
	`);

	await executeQuery(`
		CREATE TABLE IF NOT EXISTS sync_queue (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			operation TEXT,
			table_name TEXT,
			record_id INTEGER,
			payload TEXT,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await executeQuery(`
		CREATE TRIGGER IF NOT EXISTS after_insert_trans_cats
		AFTER INSERT ON trans_cats
		BEGIN
			UPDATE categories
			SET 
				trans_count = trans_count + 1,
				total_amount = total_amount + (
					SELECT amount FROM transactions WHERE id = NEW.transaction_id
				),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = NEW.category_id;
		END;
	`);

	await executeQuery(`
		CREATE TRIGGER IF NOT EXISTS after_delete_trans_cats
		AFTER DELETE ON trans_cats
		BEGIN
			UPDATE categories
			SET
				trans_count = trans_count - 1,
				total_amount = total_amount - (
					SELECT amount FROM transactions WHERE id = OLD.transaction_id
				),
				updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.category_id;
		END;
	`);
}

export async function seedData() { }
export { deleteDatabaseIfExists, setupSchema, executeQuery };
