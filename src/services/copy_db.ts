import { Alert } from 'react-native';
import RNFS from 'react-native-fs';

export async function exportDatabaseToDownloads(
  package_name: string,
  db_name: string,
) {
  const dbPath = `/data/data/${package_name}/databases/${db_name}`;
  const destPath = `${RNFS.ExternalDirectoryPath}/${db_name}`;
  try {
    await RNFS.copyFile(dbPath, destPath);
    Alert.alert('Database copied to:', destPath);
  } catch (e) {
    console.error('Error exporting DB:', e);
  }
}
