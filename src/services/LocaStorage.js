import AsyncStorage from '@react-native-async-storage/async-storage';
import logit from './Logger';
export default LocaStorage = {
  save: async (key, value) => {
    try {
      if (!value) {
        value = '';
      } else {
        value = '' + value;
      }
      await AsyncStorage.setItem(key, value);
      //logit(['Set value', key, res]);
    } catch (eor1) {
      logit(['Error in save item to local staorage', eor2]);
    }
  },
  get: async key => {
    try {
      let res = await AsyncStorage.getItem(key);
      if (!res) {
        res = '';
      } else {
        res = '' + res;
      }
      //logit(['Get value', key, res]);
      return res;
    } catch (eor2) {
      logit(['Error in get item from local staorage', eor2]);
    }
  },
  clear: async function () {
    await AsyncStorage.clear();
  },
  remove: async function (key) {
    await AsyncStorage.removeItem(key);
  },
  getArray: async function (key, code = '') {
    let res = (await this.get(key)) || '[]';
    try {
      res = JSON.parse(res);
      if (!Array.isArray(res)) {
        logit(['Parsing again => ', key, typeof res, res]);
        res = JSON.parse(res);
      }
      if (!Array.isArray(res)) {
        logit(['Could not parse => ' + key, res], 'error');
        res = [];
      }
      if (code == 'st') {
        logit([51434, key, res]);
      }
    } catch (err) {
      res = [];
      logit(['Invalid json for ' + key]);
    }
    return res;
  },
  addInList: async function (key, value) {
    let res = await this.get(key);
    res = res ? JSON.parse(res) : [];
    if (!value.id) {
      value.id = Date.now();
    }
    res.push(value);
    await this.save(key, JSON.stringify(res));
    return res;
  },
  updateList: async function (key, update_values = []) {
    await this.save(key, JSON.stringify(update_values));
    return update_values;
  },
  updateItemInList: async function (key, updated_item, idToFind) {
    let list = await this.getArray(key);
    let updated_list = list.map(item => {
      if (item.id === idToFind) {
        return updated_item;
      }
      return item;
    });
    await this.save(key, JSON.stringify(updated_list));
    return updated_list;
  },
  removeFromList: async function (key, id) {
    let res = await LocaStorage.get(key);
    res = res ? JSON.parse(res) : [];
    let item = res.find(item => item.id == id);
    if (item) {
      res.splice(res.indexOf(item), 1);
    }
    await this.save(key, JSON.stringify(res));
    return res;
  },
};
