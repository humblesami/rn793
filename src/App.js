import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import OverlayScreen from './screens/OverlayScreen';
import { ListCategories } from './screens/view_cats';
import { ListTransactions } from './screens/view_trans';
import { IconSvg } from './components/IconSvg';
import { initDB } from './db/initdb';
import SimpleView from './screens/view_setup';
import { SvgIcons } from './icons';
import SampleScreen from './screens/test';
import { useColorScheme } from 'react-native';

const Tab = createBottomTabNavigator();
function get_tab_options(
  label = '',
  icon_name,
  tabBarLabel,
  tabBarShowLabel,
  tabBarIconStyle = {},
) {
  if (!tabBarIconStyle.border) {
    tabBarIconStyle = { ...tabBarIconStyle, border: 1 };
  }
  let res_options = {
    title: label,
    tabBarShowLabel: tabBarShowLabel != false ? true : false,
    tabBarLabel: tabBarLabel || label,
    tabBarIcon: () => <IconSvg icon={icon_name} />,
    tabBarIconStyle: { ...tabBarIconStyle },
  };
  return res_options;
}

function MainApp() {
  initDB();
  const colorScheme = useColorScheme(); 
  return (
    <NavigationContainer theme={colorScheme == 'dark' ? DarkTheme: DefaultTheme}>
      <Tab.Navigator initialRouteName="Transactions">
        <Tab.Screen
          name="Transactions"
          component={ListTransactions}
          options={{
            tabBarIcon: () => <IconSvg icon={SvgIcons.bank2_icon} />,
            tabBarLabel: 'Transactions',
            title: 'Transactions List',
          }}
        />
        {__DEV__ && (
          <Tab.Screen
            name="Simple"
            component={SimpleView}
            options={{
              tabBarIcon: () => <IconSvg icon={SvgIcons.tools_icon} />,
              tabBarLabel: 'Operations',
              title: 'Operations',
            }}
          />
        )}
        {__DEV__ && (
          <Tab.Screen
            name="Sample"
            component={SampleScreen}
            options={{
              tabBarIcon: () => <IconSvg icon={SvgIcons.tools_icon} />,
              tabBarLabel: 'Sample',
              title: 'Sample',
            }}
          />
        )}
        <Tab.Screen
          name="Categories"
          component={ListCategories}
          options={{
            tabBarIcon: () => <IconSvg icon={SvgIcons.category_icon} />,
            tabBarLabel: 'Categories',
            title: 'Categories List',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default MainApp;
