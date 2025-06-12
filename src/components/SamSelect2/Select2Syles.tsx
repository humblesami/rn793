import { StyleSheet } from 'react-native';

const s2Styles = StyleSheet.create({
  addBtn: {
    backgroundColor: 'green',
    borderRadius: 2,
    padding: 8,
    marginTop: 3,
    marginLeft: 5,
  },
  cancelBtn: {
    padding: 5,
    borderRadius: 2,
    width:'80%',
    backgroundColor: 'red',
  },
  selectedItem: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginHorizontal: 3,
    marginBottom: 2,

    borderRadius: 5,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',

    maxWidth: '50%',
    flexDirection: 'row',
    flexBasis: 'auto',
  },
  singleSelectedItem: {
    flex: 0,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  selection_container: {
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  stlistItem: {
    padding: 8,
    marginBottom: 4,
    backgroundColor: '#bbb',
  },
  itemText: {
    color: '#111',
  },
  pressed: {
    backgroundColor: 'blue',
  },
  listContainer: {
    maxHeight: 200,
    width: '80%'
  },
});

export { s2Styles };
