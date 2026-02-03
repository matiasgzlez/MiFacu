/**
 * Configuración centralizada de notificaciones locales para MiFacu
 *
 * Este módulo configura expo-notifications para usar SOLO notificaciones locales.
 * Las notificaciones remotas (push) no están soportadas en Expo Go SDK 53+,
 * pero las locales funcionan perfectamente.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Canal de notificaciones para Android 8+ (requerido)
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('examenes', {
        name: 'Exámenes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
    });
}

// Configuración del handler de notificaciones
// Esto define cómo se muestran las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Solicita permisos para notificaciones locales
 * @returns true si se otorgaron los permisos, false en caso contrario
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    } catch (error) {
        console.warn('Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Programa una notificación local para una fecha específica
 * @param id Identificador único para la notificación
 * @param title Título de la notificación
 * @param body Cuerpo del mensaje
 * @param scheduledDate Fecha y hora para mostrar la notificación
 * @param data Datos adicionales (opcional)
 * @returns El ID de la notificación programada o null si falló
 */
export async function scheduleLocalNotification(
    id: string,
    title: string,
    body: string,
    scheduledDate: Date,
    data?: Record<string, any>
): Promise<string | null> {
    try {
        // No programar si la fecha ya pasó
        if (scheduledDate <= new Date()) {
            console.log('Notification date is in the past, skipping:', id);
            return null;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            identifier: id,
            content: {
                title,
                body,
                data: data || {},
                sound: true,
                ...(Platform.OS === 'android' && { channelId: 'examenes' }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: scheduledDate,
                ...(Platform.OS === 'android' && { channelId: 'examenes' }),
            } as Notifications.DateTriggerInput,
        });

        console.log('Notification scheduled:', notificationId, 'for', scheduledDate);
        return notificationId;
    } catch (error) {
        console.warn('Error scheduling notification:', error);
        return null;
    }
}

/**
 * Cancela una notificación programada
 * @param id Identificador de la notificación a cancelar
 */
export async function cancelNotification(id: string): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(id);
        console.log('Notification cancelled:', id);
    } catch (error) {
        // No es un error crítico si no existe la notificación
        console.log('Could not cancel notification:', id);
    }
}

/**
 * Cancela todas las notificaciones programadas
 */
export async function cancelAllNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All notifications cancelled');
    } catch (error) {
        console.warn('Error cancelling all notifications:', error);
    }
}

/**
 * Obtiene todas las notificaciones programadas
 */
export async function getScheduledNotifications() {
    try {
        return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
        console.warn('Error getting scheduled notifications:', error);
        return [];
    }
}
