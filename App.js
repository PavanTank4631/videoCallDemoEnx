
import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import EnxJoinScreen from './src/Screens/EnxJoinScreen'
import EnxConferenceScreen from './src/Screens/EnxConferenceScreen'

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EnxJoinScreen">
        <Stack.Screen name="EnxJoinScreen" component={EnxJoinScreen} />
        <Stack.Screen name="EnxConferenceScreen" component={EnxConferenceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;