/**
 * Suprimir warnings de expo-notifications sobre push remotas.
 * Este archivo DEBE importarse ANTES de expo-notifications.
 */
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported',
  'expo-notifications functionality',
]);

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    if (
      message.includes('expo-notifications: Android Push notifications') ||
      message.includes('expo-notifications` functionality is not fully supported') ||
      message.includes('Use a development build instead of Expo Go')
    ) {
      return;
    }
  }
  originalWarn.apply(console, args);
};
