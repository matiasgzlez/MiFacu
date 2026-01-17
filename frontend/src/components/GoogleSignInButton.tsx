import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { supabase } from '../config/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
    const onSignIn = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
        <TouchableOpacity onPress={onSignIn} style={styles.googleButton} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
                <FontAwesome name="google" size={20} color="#000" />
            </View>
            <Text style={styles.googleText}>Continuar con Google</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    googleButton: {
        backgroundColor: '#fff',
        height: 58,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 12,
    },
    googleText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 17,
        letterSpacing: -0.3,
    },
});
