import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../config/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
    const onSignIn = async () => {
        try {
            const redirectUrl = Linking.createURL('/');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (!data?.url) throw new Error('No se pudo obtener la URL de autenticación');

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            if (result.type === 'success' && result.url) {
                // Extraer tokens de la URL (hash) y establecer sesión manualmente
                const hash = result.url.split('#')[1];
                if (hash) {
                    const params = new URLSearchParams(hash);
                    const access_token = params.get('access_token');
                    const refresh_token = params.get('refresh_token');

                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token
                        });
                        if (sessionError) throw sessionError;
                    }
                }
            }
        } catch (error: any) {
            console.error('Error en login de Google:', error);
            Alert.alert("Error de Google", error.message || "No se pudo iniciar sesión con Google.");
        }
    };

    return (
        <TouchableOpacity onPress={onSignIn} style={styles.googleButton}>
            <Text style={styles.googleText}>Iniciar Sesión con Google</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    googleText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
