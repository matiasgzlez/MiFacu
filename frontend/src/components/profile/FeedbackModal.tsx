import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { useSaveNotification } from '../../context/SaveNotificationContext';
import SpinButton from '../ui/spin-button';

interface FeedbackModalProps {
    visible: boolean;
    onClose: () => void;
    theme: any;
    isDarkMode: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    visible,
    onClose,
    theme,
    isDarkMode
}) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    const { showNotification } = useSaveNotification();

    const handleSubmit = async () => {
        if (!feedbackText.trim()) return;

        Keyboard.dismiss();
        setSending(true);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert({
                    user_id: user?.id,
                    message: feedbackText,
                    metadata: {
                        platform: Platform.OS,
                        version: '1.0.0', // TODO: Get from constants/app.json
                        user_email: user?.email
                    }
                });

            if (error) throw error;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFeedbackText('');
            onClose();
            showNotification('Comentario enviado');
        } catch (error) {
            console.error('Error sending feedback:', error);
            showNotification('No se pudo enviar el comentario', 'error');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    {/* Blur Background */}
                    {Platform.OS === 'ios' && (
                        <BlurView
                            intensity={20}
                            tint={isDarkMode ? 'dark' : 'light'}
                            style={StyleSheet.absoluteFill}
                        />
                    )}

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <TouchableWithoutFeedback>
                            <View style={[styles.modalCard, { backgroundColor: theme.backgroundSecondary }]}>

                                {/* Header */}
                                <View style={styles.header}>
                                    <Text style={[styles.title, { color: theme.text }]}>
                                        Enviar Comentarios
                                    </Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color={theme.icon} />
                                    </TouchableOpacity>
                                </View>

                                {/* Content */}
                                <Text style={[styles.subtitle, { color: theme.icon }]}>
                                    ¿Encontraste un error o tienes una sugerencia? Cuéntanos.
                                </Text>

                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: theme.background,
                                            color: theme.text,
                                            borderColor: theme.separator
                                        }
                                    ]}
                                    placeholder="Escribe aquí tus comentarios..."
                                    placeholderTextColor={theme.icon}
                                    multiline
                                    value={feedbackText}
                                    onChangeText={setFeedbackText}
                                    maxLength={500}
                                />

                                {/* Footer */}
                                <View style={styles.footer}>
                                    <Text style={[styles.charCount, { color: theme.icon }]}>
                                        {feedbackText.length}/500
                                    </Text>

                                    <SpinButton
                                        idleText="Enviar"
                                        activeText="Enviando"
                                        controlled
                                        isActive={sending}
                                        disabled={!feedbackText.trim() || sending}
                                        onPress={() => handleSubmit()}
                                        colors={{
                                            idle: { background: theme.tint, text: '#FFFFFF' },
                                            active: { background: theme.tint, text: '#FFFFFF' },
                                        }}
                                        buttonStyle={{
                                            paddingHorizontal: 24,
                                            paddingVertical: 12,
                                            borderRadius: 12,
                                            fontSize: 16,
                                            fontWeight: '600',
                                        }}
                                        spinnerConfig={{
                                            size: 16,
                                            strokeWidth: 1.5,
                                            color: '#FFFFFF',
                                            containerSize: 28,
                                            containerBackground: theme.tint,
                                            position: { right: -10, bottom: 16 },
                                        }}
                                    />
                                </View>

                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end', // Bottom sheet style
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    keyboardView: {
        width: '100%',
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Safe area for home indicator
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.8,
    },
    input: {
        height: 120,
        borderRadius: 16,
        padding: 16,
        paddingTop: 16, // multiline align top
        fontSize: 16,
        borderWidth: 1,
        textAlignVertical: 'top', // Android
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    charCount: {
        fontSize: 12,
        fontWeight: '500',
    },
    submitButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
