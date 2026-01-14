import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View, Alert, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../src/config/supabase';
import { useAuth } from '../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { isGuest, user, signInAsGuest } = useAuth();

  useEffect(() => {
    if (user || isGuest) {
      router.replace('/home');
    }
  }, [user, isGuest]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'mifacu://login'
      }
    });

    if (error) Alert.alert("Error", error.message);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.background}
      />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="rocket-sharp" size={48} color="white" />
        </View>
        <Text style={styles.title}>MiFacu</Text>
        <Text style={styles.subtitle}>Tu vida académica, organizada.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGoogleLogin}
          style={styles.googleButton}
        >
          <Ionicons name="logo-google" size={20} color="#000" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={signInAsGuest}
          style={styles.guestButton}
        >
          <Text style={styles.guestButtonText}>Probar como Invitado</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Al ingresar como invitado, tus datos se guardarán localmente y se sincronizarán al iniciar sesión.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ADVANCED EDITION</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    backgroundColor: '#2563eb',
    width: 90,
    height: 90,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  title: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 18,
    marginTop: 10,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 350,
  },
  googleButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 5,
  },
  googleButtonText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 18,
  },
  guestButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  guestButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    fontSize: 16,
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.1)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 4,
  },
});
