import React from 'react';
import { Box, NativeBaseProvider, theme } from 'native-base';
import { Slot, Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
const _layout = () => {
  return (
    <NativeBaseProvider theme={theme}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTintColor: '#fff',
          tabBarActiveTintColor: '#F19A1A',
          headerStyle: { backgroundColor: '#F19A1A' },
          tabBarStyle: { height:60 }, // Add margin top to all tabs
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            href: '(professor)/(tabs)/Home',
            headerShown: false,
            title: '',
            tabBarIcon: ({ color }) => (
              <Entypo name="home" size={35} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Chat"
          options={{
            href: {
              pathname: '(professor)/(tabs)/Chat',
            },
            title: '',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Entypo name="chat" size={35} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            href: {
              pathname: '(professor)/(tabs)/Profile',
            },
            title: '',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <AntDesign name="user" size={35} color={color} />
            ),
          }}
        />
      </Tabs>
    </NativeBaseProvider>
  );
};

export default _layout;
