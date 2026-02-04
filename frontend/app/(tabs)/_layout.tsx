import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { Colors, mifacuNavy, mifacuGold } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function TabsLayout() {
  const { colorScheme, isDark } = useTheme();

  const TabBarIcon = ({ focused, name, outlineName, color, size }: { focused: boolean, name: keyof typeof Ionicons.glyphMap, outlineName: keyof typeof Ionicons.glyphMap, color: string, size: number }) => {
    return (
      <View style={[
        styles.iconContainer,
        focused && { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)' }
      ]}>
        <Ionicons
          name={focused ? name : outlineName}
          size={22}
          color={focused ? '#FFFFFF' : (isDark ? '#9CA3AF' : 'rgba(255,255,255,0.7)')}
        />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, // Show labels
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: isDark ? '#1F2937' : mifacuNavy,
          borderRadius: 30,
          height: 75,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          paddingBottom: 0,
          borderTopColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 0, // Removed margin to allow true centering
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        tabBarItemStyle: {
          height: 75,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0, // Ensure no padding interferes (center is center)
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} name="home" outlineName="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="materias"
        options={{
          title: 'Materias',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} name="book" outlineName="book-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="herramientas"
        options={{
          title: 'Herramientas',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} name="construct" outlineName="construct-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="milo"
        options={{
          title: 'Milo',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} name="paw" outlineName="paw-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon focused={focused} name="person" outlineName="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4, // Spacing between Icon and Text
  }
});
