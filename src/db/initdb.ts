import { setupSchema, seedData } from './sqlite';
import { syncWithServer, subscribeToNetworkChanges } from './syncManager';

export async function initDB() {
  await setupSchema();
  // await seedData();
  // await syncWithServer();
  // subscribeToNetworkChanges(isOnline => {
  // 	if (isOnline) syncWithServer();
  // });
}
