import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  DynamicIsland,
  useDynamicIsland,
} from '../components/ui/dynamic-island';

type NotificationType = 'success' | 'error';

interface SaveNotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const SaveNotificationContext = createContext<SaveNotificationContextType | null>(null);

export function useSaveNotification() {
  const ctx = useContext(SaveNotificationContext);
  if (!ctx) {
    throw new Error('useSaveNotification must be used within SaveNotificationProvider');
  }
  return ctx;
}

function NotificationContent({ message, type }: { message: string; type: NotificationType }) {
  return (
    <View style={styles.content}>
      <Ionicons
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'}
        size={22}
        color={type === 'success' ? '#30D158' : '#FF453A'}
      />
      <Text style={styles.text} numberOfLines={1}>{message}</Text>
    </View>
  );
}

function NotificationTrigger() {
  return (
    <View style={styles.trigger}>
      <View style={styles.triggerDot} />
    </View>
  );
}

function NotificationIsland({
  message,
  type,
  onAutoCollapse,
}: {
  message: string;
  type: NotificationType;
  onAutoCollapse: () => void;
}) {
  const { expand, collapse, isExpanded } = useDynamicIsland();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasExpandedRef = useRef(false);

  React.useEffect(() => {
    if (message && !hasExpandedRef.current) {
      hasExpandedRef.current = true;
      // Small delay to let the provider mount
      const mountTimer = setTimeout(() => {
        expand();
        timerRef.current = setTimeout(() => {
          collapse();
          setTimeout(onAutoCollapse, 400);
        }, 2000);
      }, 100);
      return () => clearTimeout(mountTimer);
    }
  }, [message]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <DynamicIsland.Trigger>
        <NotificationTrigger />
      </DynamicIsland.Trigger>
      <DynamicIsland.Content>
        <NotificationContent message={message} type={type} />
      </DynamicIsland.Content>
    </>
  );
}

export function SaveNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    key: number;
  } | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    setNotification({ message, type, key: Date.now() });
  }, []);

  const handleAutoCollapse = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <SaveNotificationContext.Provider value={{ showNotification }}>
      {notification ? (
        <DynamicIsland.Provider
          key={notification.key}
          config={{
            collapsedWidth: 120,
            collapsedHeight: 36,
            expandedWidth: 340,
            expandedHeight: 56,
            topOffset: 11,
            duration: 320,
          }}
          theme={{ backgroundColor: '#1c1c1e', borderRadius: 26 }}
          haptics
        >
          <NotificationIsland
            message={notification.message}
            type={notification.type}
            onAutoCollapse={handleAutoCollapse}
          />
          {children}
        </DynamicIsland.Provider>
      ) : (
        children
      )}
    </SaveNotificationContext.Provider>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  trigger: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },
});
