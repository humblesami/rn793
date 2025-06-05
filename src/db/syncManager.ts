// src/sync/syncManager.ts
import NetInfo from '@react-native-community/netinfo';
import { executeQuery } from './sqlite';
import axios from 'axios';

export function subscribeToNetworkChanges(
  callback: (isOnline: boolean) => void,
) {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected ?? false);
  });
}

export async function queueChange(
  operation: string,
  table: string,
  recordId: number,
  payload: object,
) {
  await executeQuery(
    'INSERT INTO sync_queue (operation, table_name, record_id, payload) VALUES (?, ?, ?, ?)',
    [operation, table, recordId, JSON.stringify(payload)],
  );
}

export async function syncWithServer() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const db = await executeQuery(
    'SELECT * FROM sync_queue ORDER BY timestamp ASC',
  );
  const rows = db[0]?.rows;

  for (let i = 0; i < rows.length; i++) {
    const item = rows.item(i);
    try {
      const payload = JSON.parse(item.payload);
      await axios.post(`https://your-api.com/${item.table_name}`, payload);
      await executeQuery('DELETE FROM sync_queue WHERE id = ?', [item.id]);
    } catch (err) {
      console.warn('Sync error:', err);
      break; // Stop on first error to retry later
    }
  }
}
