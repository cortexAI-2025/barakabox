import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { I18nManager } from 'react-native';
import { store } from './src/store';
import AppNavigator from './src/navigation';
import './src/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    // Token would be sent to backend via authAPI.updateMe({ pushToken: token })
  };

  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <AppNavigator />
    </Provider>
  );
}
