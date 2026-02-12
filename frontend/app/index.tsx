import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../src/config/supabase';
import { useAuth } from '../src/context/AuthContext';
import { DataRepository } from '../src/services/dataRepository';
import GoogleSignInButton from '../src/components/GoogleSignInButton';
import AppleSignInButton from '../src/components/AppleSignInButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Animaciones usando el core de React Native (máximo de estabilidad)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña.');
      return;
    }
    try {
      setEmailLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error de login:', error);
      Alert.alert('Error de autenticación', error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleAppleCredential = async (credential: any) => {
    if (credential.identityToken) {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;

        // Si es el primer login, Apple nos manda el nombre.
        // Podríamos actualizar el perfil si fuera necesario, 
        // pero Supabase ya gestiona el registro básico.
        router.replace('/(tabs)');
      } catch (error: any) {
        console.error('Error en Supabase Apple Auth:', error);
        Alert.alert("Error de Apple", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#000', '#1c1c1e', '#000']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>miFACU</Text>
          <Text style={styles.tagline}>Tu vida académica, simplificada.</Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Apple Sign In (Carga segura solo en iOS vía extensión de archivo .ios.tsx) */}
          <AppleSignInButton onPress={handleAppleCredential} />

          <View style={{ marginBottom: 16 }}>
            <GoogleSignInButton />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email & Password inline */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8e8e93"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#8e8e93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, emailLoading && styles.loginButtonDisabled]}
            onPress={handleEmailLogin}
            disabled={emailLoading}
          >
            {emailLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.loginButtonText}>INGRESAR</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Iniciando sesión aceptas nuestros términos y condiciones.</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Hecho con ❤️ para estudiantes</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
  },
  tagline: {
    color: '#8e8e93',
    fontSize: 18,
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center'
  },
  buttonContainer: {
    width: '100%',
  },
  infoBox: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    color: '#48484a',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: '#48484a',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2c2c2e',
  },
  dividerText: {
    color: '#8e8e93',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  loginButton: {
    backgroundColor: '#fff',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
