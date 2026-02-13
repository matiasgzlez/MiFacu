import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Detect Expo Go to skip native-only modules
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Intentar importar RevenueCat, pero puede fallar en Expo Go
let Purchases: any = null;
let revenueCatAvailable = false;

if (isExpoGo) {
  console.log('Expo Go detected. Skipping RevenueCat native initialization.');
  revenueCatAvailable = false;
} else {
  try {
    Purchases = require('react-native-purchases').default;
    revenueCatAvailable = true;
  } catch (e) {
    console.log('RevenueCat not available');
    revenueCatAvailable = false;
  }
}

const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
};

// Key para guardar el override de desarrollo
const DEV_PREMIUM_OVERRIDE_KEY = '@mifacu_dev_premium_override';

// Tipo genérico para cuando RevenueCat no está disponible
type PurchasesOffering = any;
type PurchasesPackage = any;
type CustomerInfo = any;

interface PremiumContextType {
  isPro: boolean;
  loading: boolean;
  currentOffering: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  purchasePackage: (pack: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refresh: () => Promise<void>;
  // Dev/Testing functions
  __devSetPremium: (value: boolean) => Promise<void>;
  __devOverrideActive: boolean;
  __mockMode: boolean; // Indica si está en modo mock (Expo Go)
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

interface PremiumProviderProps {
  children: ReactNode;
}

export function PremiumProvider({ children }: PremiumProviderProps) {
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Dev override state
  const [devOverrideActive, setDevOverrideActive] = useState(false);
  const [devOverrideValue, setDevOverrideValue] = useState<boolean | null>(null);

  // Load dev override on mount
  useEffect(() => {
    const loadDevOverride = async () => {
      try {
        const stored = await AsyncStorage.getItem(DEV_PREMIUM_OVERRIDE_KEY);
        if (stored !== null) {
          setDevOverrideActive(true);
          setDevOverrideValue(stored === 'true');
        }
      } catch (e) {
        console.error('Error loading dev override', e);
      }
    };
    loadDevOverride();
  }, []);

  const initializeRevenueCat = async () => {
    if (initialized) return;

    // Si RevenueCat no está disponible, usar modo mock
    if (!revenueCatAvailable || !Purchases) {
      console.log('Running in mock mode (RevenueCat not available)');
      setInitialized(true);
      setLoading(false);
      return;
    }

    try {
      const key = Platform.OS === 'android' ? APIKeys.google : APIKeys.apple;
      console.log('[RC] Configuring with key:', key ? `${key.substring(0, 8)}...` : 'EMPTY');
      await Purchases.configure({ apiKey: key });
      console.log('[RC] Configure OK');
      setInitialized(true);
      await fetchData();
    } catch (e: any) {
      console.error('[RC] Init error:', e?.code, e?.message, e?.underlyingErrorMessage);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    // Si RevenueCat no está disponible, no hacer nada
    if (!revenueCatAvailable || !Purchases) {
      setLoading(false);
      return;
    }

    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      if (info.entitlements.active['premium']) {
        setIsPro(true);
      } else {
        setIsPro(false);
      }

      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        setCurrentOffering(offerings.current);
      }
    } catch (e) {
      console.error('Error fetching RevenueCat data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Dev function to set premium status for testing
  const __devSetPremium = async (value: boolean): Promise<void> => {
    try {
      if (value === null) {
        // Clear override
        await AsyncStorage.removeItem(DEV_PREMIUM_OVERRIDE_KEY);
        setDevOverrideActive(false);
        setDevOverrideValue(null);
        // Refresh real status
        await fetchData();
      } else {
        await AsyncStorage.setItem(DEV_PREMIUM_OVERRIDE_KEY, String(value));
        setDevOverrideActive(true);
        setDevOverrideValue(value);
      }
    } catch (e) {
      console.error('Error setting dev premium override', e);
    }
  };

  // Calculate effective isPro value
  const effectiveIsPro = devOverrideActive && devOverrideValue !== null ? devOverrideValue : isPro;

  const purchasePackage = async (pack: PurchasesPackage): Promise<boolean> => {
    // Mock mode: simular compra exitosa
    if (!revenueCatAvailable || !Purchases) {
      Alert.alert(
        'Modo Demo',
        'RevenueCat no está disponible en Expo Go. Usa el toggle en Perfil > Soporte para activar Premium manualmente.',
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      if (customerInfo.entitlements.active['premium']) {
        setIsPro(true);
        setCustomerInfo(customerInfo);
        return true;
      }
      return false;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Error purchasing package', e);
      }
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    // Mock mode
    if (!revenueCatAvailable || !Purchases) {
      Alert.alert(
        'Modo Demo',
        'RevenueCat no está disponible en Expo Go. Usa el toggle en Perfil > Soporte para activar Premium manualmente.',
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      if (info.entitlements.active['premium']) {
        setIsPro(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error restoring purchases', e);
      return false;
    }
  };

  const refresh = async () => {
    setLoading(true);
    await fetchData();
  };

  return (
    <PremiumContext.Provider
      value={{
        isPro: effectiveIsPro,
        loading,
        currentOffering,
        customerInfo,
        purchasePackage,
        restorePurchases,
        refresh,
        __devSetPremium,
        __devOverrideActive: devOverrideActive,
        __mockMode: isExpoGo || !revenueCatAvailable,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextType {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
