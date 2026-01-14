import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, TextInput, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../src/config/supabase';
import { useAuth } from '../src/context/AuthContext';
import { DataRepository } from '../src/services/dataRepository';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { isGuest, user, signInAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user || isGuest) {
      router.replace('/home');
    }
  }, [user, isGuest]);

  const syncAndNavigate = async () => {
    await DataRepository.syncGuestData();
    router.replace('/home');
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error de Login", error.message);
    } else {
      await syncAndNavigate();
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error de Registro", error.message);
    } else {
      Alert.alert("Registro Exitoso", "Por favor verifica tu email para confirmar la cuenta (si está habilitado), o inicia sesión.");
    }
  };

  // Mantengo la opción de Google por si acaso, pero oculta/secundaria si falla
  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'mifacumobile',
        path: 'auth/callback',
      });
      // Removed the alert to clean up UI
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No Oauth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        // Extract params logic here if needed, but normally Supabase handles session via URL listener
        // But in manual flow we might need to parse hash.
        // For now, focusing on Email/Pass as the primary fix.
      }
    } catch (error: any) {
      Alert.alert("Google Login Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MiFacu 🚀</Text>
      <Text style={styles.subtitle}>Gestiona tu vida académica</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />
      ) : (
        <>
          <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.orText}>— O —</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>Google (Experimental)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={signInAsGuest} style={styles.guestButton}>
        <Text style={styles.guestText}>Ingresar como Invitado (Offline)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#aaa', fontSize: 18, marginBottom: 40 },

  inputContainer: { width: '100%', marginBottom: 20 },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333'
  },

  loginButton: {
    backgroundColor: '#0a84ff',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  signUpButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  signUpText: { color: '#fff', fontSize: 16 },

  orText: { color: '#444', marginVertical: 20 },

  googleButton: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 20,
  },
  googleText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  guestButton: { padding: 15 },
  guestText: { color: '#888', textDecorationLine: 'underline', fontSize: 15 },
});