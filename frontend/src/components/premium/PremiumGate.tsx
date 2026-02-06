import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { usePremium } from '../../context/PremiumContext';
import { PaywallOverlay } from './PaywallOverlay';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/theme';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: string;
}

export function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { isPro, loading } = usePremium();
  const { isDark, colorScheme } = useTheme();
  const theme = Colors[colorScheme];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Render children with blur effect applied via overlay */}
      <View style={styles.contentContainer} pointerEvents="none">
        {children}
      </View>

      {/* Paywall overlay */}
      <PaywallOverlay featureName={featureName} isDark={isDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    opacity: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
