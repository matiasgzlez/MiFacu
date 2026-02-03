import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TemaFinal, TipoVoto } from '../../types/temas-finales';

const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} dias`;
    if (diffWeeks === 1) return 'hace 1 semana';
    if (diffWeeks < 4) return `hace ${diffWeeks} semanas`;
    if (diffMonths === 1) return 'hace 1 mes';
    if (diffMonths < 12) return `hace ${diffMonths} meses`;
    return `hace mas de 1 ano`;
};

const formatFechaMesa = (fechaMesa: string | null): string | null => {
    if (!fechaMesa) return null;
    const date = new Date(fechaMesa);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

interface TemaFinalCardProps {
    tema: TemaFinal;
    theme: any;
    index?: number;
    onVotar: (id: number, tipo: TipoVoto) => void;
    onReportar: (id: number) => void;
    isOwner?: boolean;
}

const getStripColor = (tema: TemaFinal, theme: any): string => {
    const totalVotos = tema.votosUtiles + tema.votosNoUtiles;
    if (totalVotos === 0) return theme.icon || '#9CA3AF';
    const ratio = tema.votosUtiles / totalVotos;
    if (ratio >= 0.7) return theme.green || '#34C759';
    if (ratio >= 0.4) return theme.orange || '#FF9500';
    return theme.icon || '#9CA3AF';
};

export function TemaFinalCard({
    tema,
    theme,
    index = 0,
    onVotar,
    onReportar,
    isOwner = false,
}: TemaFinalCardProps) {
    const stripColor = getStripColor(tema, theme);
    const fechaRelativa = formatRelativeTime(tema.createdAt);
    const fechaMesaFormateada = formatFechaMesa(tema.fechaMesa);

    const handleVotar = (tipo: TipoVoto) => {
        if (isOwner) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onVotar(tema.id, tipo);
    };

    const handleReportar = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onReportar(tema.id);
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Left strip */}
            <View style={[styles.leftStrip, { backgroundColor: stripColor }]} />

            <View style={styles.content}>
                {/* User row */}
                <View style={styles.userRow}>
                    {tema.esVerificado && tema.user?.avatarUrl ? (
                        <Image
                            source={{ uri: tema.user.avatarUrl }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <View style={[styles.avatarContainer, { backgroundColor: tema.esVerificado ? theme.tint + '20' : theme.separator }]}>
                            <Ionicons
                                name={tema.esVerificado ? "person" : "person-outline"}
                                size={16}
                                color={tema.esVerificado ? theme.tint : theme.icon}
                            />
                        </View>
                    )}
                    <View style={styles.userInfo}>
                        <View style={styles.userNameRow}>
                            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                                {tema.esVerificado && tema.user?.nombre
                                    ? tema.user.nombre
                                    : 'Anonimo'}
                            </Text>
                            {tema.esVerificado && (
                                <Ionicons name="checkmark-circle" size={14} color={theme.tint} />
                            )}
                        </View>
                        <Text style={[styles.fecha, { color: theme.icon }]}>{fechaRelativa}</Text>
                    </View>
                </View>

                {/* Tema principal */}
                <Text style={[styles.temaNombre, { color: theme.text }]} numberOfLines={3}>
                    {tema.tema}
                </Text>

                {/* Badges row */}
                <View style={styles.badgesRow}>
                    {fechaMesaFormateada && (
                        <View style={[styles.badge, { backgroundColor: (theme.orange || '#FF9500') + '15' }]}>
                            <Ionicons name="calendar-outline" size={12} color={theme.orange || '#FF9500'} />
                            <Text style={[styles.badgeText, { color: theme.orange || '#FF9500' }]}>
                                Mesa: {fechaMesaFormateada}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.badge, { backgroundColor: theme.tint + '15' }]}>
                        <Ionicons name="book-outline" size={12} color={theme.tint} />
                        <Text style={[styles.badgeText, { color: theme.tint }]} numberOfLines={1}>
                            {tema.materia.nombre}
                        </Text>
                    </View>
                </View>

                {/* Actions row */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            tema.miVoto === TipoVoto.Util && { backgroundColor: (theme.green || '#34C759') + '15' },
                        ]}
                        onPress={() => handleVotar(TipoVoto.Util)}
                        disabled={isOwner}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={tema.miVoto === TipoVoto.Util ? 'thumbs-up' : 'thumbs-up-outline'}
                            size={16}
                            color={tema.miVoto === TipoVoto.Util ? (theme.green || '#34C759') : theme.icon}
                        />
                        <Text
                            style={[
                                styles.actionText,
                                { color: tema.miVoto === TipoVoto.Util ? (theme.green || '#34C759') : theme.icon },
                            ]}
                        >
                            {tema.votosUtiles}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            tema.miVoto === TipoVoto.NoUtil && { backgroundColor: (theme.red || '#FF3B30') + '15' },
                        ]}
                        onPress={() => handleVotar(TipoVoto.NoUtil)}
                        disabled={isOwner}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={tema.miVoto === TipoVoto.NoUtil ? 'thumbs-down' : 'thumbs-down-outline'}
                            size={16}
                            color={tema.miVoto === TipoVoto.NoUtil ? (theme.red || '#FF3B30') : theme.icon}
                        />
                        <Text
                            style={[
                                styles.actionText,
                                { color: tema.miVoto === TipoVoto.NoUtil ? (theme.red || '#FF3B30') : theme.icon },
                            ]}
                        >
                            {tema.votosNoUtiles}
                        </Text>
                    </TouchableOpacity>

                    {!isOwner && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleReportar}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="flag-outline" size={16} color={theme.icon} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        flexDirection: 'row',
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    leftStrip: {
        width: 6,
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 14,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
    },
    fecha: {
        fontSize: 12,
    },
    temaNombre: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        lineHeight: 22,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
        maxWidth: '70%',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
