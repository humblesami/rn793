import { StyleSheet, Appearance } from 'react-native';
const colorTheme = Appearance.getColorScheme() || 'light';
console.log(colorTheme)
const colors = {
  itemBorder: colorTheme == 'dark' ? '#fff': '#aaa',
}

const styles = StyleSheet.create({
  border: {
    borderRadius: 3,
    borderColor: colors.itemBorder,
    borderWidth: 1,
  }, 
  borderBottom:{
    borderRadius: 3,
    borderColor: colors.itemBorder,
    borderBottomWidth: 1,
  },
  circleBorder: {
    borderRadius: 50
  },
  rowContainer: {
    flex: 1,
    padding: 2,
    width: '98%',
    backgroundColor: colorTheme == 'dark' ? '#fff': '#000',
    paddingLeft: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    zIndex: 3,
    left: 50,
    top: 5,
  },
  active: {
    borderWidth: 1,
    borderColor: 'green',
  },
  field_continer: {
    paddingVertical: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  textField: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  dropDownBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    height: 40,
    width: 'auto',
    minWidth: 150,
  },
  button: {
    paddingVertical: 5,
    borderRadius: 4,
    color: 'white',
    backgroundColor: 'rgb(33, 150, 243)',
    alignItems: 'center',
    justifyContent: 'center',
    height: 25,
    marginRight: 5,
  },

  flex: {
    padding: 5,
    flexDirection: 'row',
  },
  flexSpaceBetween: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  row: {
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    justifyContent: 'space-between',
  },
  tagContainer: {

  },
  tagItem: {
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.itemBorder,
  },
  listItem: {
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: '100%',
    marginBottom: 2,
  },
  item: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 6,
  },
  pressableItem: {
    borderColor: colors.itemBorder,
    borderBottomWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
    padding: 5,
  },
  rowItem: {
    padding: 4,
  },

  deleteButton: {
    backgroundColor: '#f16d6b',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 25,
    borderRadius: 100,
    marginRight: 5,
  },
  editButton: {
    backgroundColor: '#f16d6b',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 25,
    borderRadius: 100,
    marginRight: 5,
  },
  h5: {
    fontWeight: 'bold',
    padding: 5,
    fontSize: 16,
  },
  header: {
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formHeading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  list: {},
  time: {
    fontSize: 14,
  },

  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    minHeight: 10,
    borderRadius: 2,
    padding: 8,
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  wrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bottomInput: {
    padding: 5,
    borderColor: '#ccc',
    verticalAlign: 'bottom',
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'row',
  },

  safe: {
    flex: 1,
    padding: 10,
  },
  keyboardAvoid: {
    flex: 1,
  },

  text: {
    color: 'green',
  },
  editRowCell: {
    paddingTop: 5,
    paddingLeft: 5,
  },
  btnText: {
    color: 'white',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  listItemText: {
    fontSize: 16,
    paddingLeft: 5,
  },  
  scrollContent: {
    paddingBottom: 20,
  },
});
export { styles, colors };
