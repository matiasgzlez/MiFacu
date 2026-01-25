import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

interface AppleSignInButtonProps {
    onPress: (credential: AppleAuthentication.AppleAuthenticationCredential) => void;
}

export default function AppleSignInButton({ onPress }: AppleSignInButtonProps) {
    const [isAvailable, setIsAvailable] = useState<boolean>(false);

    useEffect(() => {
        AppleAuthentication.isAvailableAsync().then(setIsAvailable);
    }, []);

    if (!isAvailable) return null;

    const handlePress = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            onPress(credential);
        } catch (e: any) {
            if (e.code !== 'ERR_REQUEST_CANCELED') {
                console.error('Error con Apple Sign In:', e);
                Alert.alert("Error", "No se pudo iniciar sesión con Apple.");
            }
        }
    };

    return (
        <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={16}
            style={styles.button}
            onPress={handlePress}
        />
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 58,
        marginBottom: 16,
    },
});
