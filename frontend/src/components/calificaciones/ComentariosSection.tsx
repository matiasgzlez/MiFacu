import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    Switch,
    Alert,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ComentarioCalificacion } from '../../types/calificaciones';
import { comentariosApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ComentariosSectionProps {
    calificacionId: number;
    comentarios: ComentarioCalificacion[];
    onComentarioAdded: (comentario: ComentarioCalificacion) => void;
    onComentarioDeleted: (id: number) => void;
    theme: any;
    loading?: boolean;
}

// Tiempo relativo simple
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
};

function ComentarioItem({
    comentario,
    theme,
    onDelete,
    isOwner,
}: {
    comentario: ComentarioCalificacion;
    theme: any;
    onDelete: () => void;
    isOwner: boolean;
}) {
    return (
        <View style={[styles.comentarioItem, { borderBottomColor: theme.separator }]}>
            <View style={styles.comentarioHeader}>
                {comentario.esVerificado && comentario.user?.avatarUrl ? (
                    <Image source={{ uri: comentario.user.avatarUrl }} style={styles.miniAvatar} />
                ) : (
                    <View style={[styles.miniAvatarPlaceholder, { backgroundColor: theme.separator }]}>
                        <Ionicons name="person-outline" size={12} color={theme.icon} />
                    </View>
                )}
                <View style={styles.comentarioUserInfo}>
                    <View style={styles.comentarioNameRow}>
                        <Text style={[styles.comentarioUserName, { color: theme.text }]}>
                            {comentario.esVerificado && comentario.user?.nombre
                                ? comentario.user.nombre
                                : 'Anonimo'}
                        </Text>
                        {comentario.esVerificado && (
                            <Ionicons name="checkmark-circle" size={12} color={theme.tint} />
                        )}
                    </View>
                    <Text style={[styles.comentarioTime, { color: theme.icon }]}>
                        {formatRelativeTime(comentario.createdAt)}
                    </Text>
                </View>
                {isOwner && (
                    <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="trash-outline" size={16} color={theme.red || '#FF3B30'} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={[styles.comentarioText, { color: theme.text }]}>{comentario.contenido}</Text>
        </View>
    );
}

export function ComentariosSection({
    calificacionId,
    comentarios,
    onComentarioAdded,
    onComentarioDeleted,
    theme,
    loading = false,
}: ComentariosSectionProps) {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [esAnonimo, setEsAnonimo] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!newComment.trim() || submitting) return;

        try {
            setSubmitting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const comentario = await comentariosApi.create(calificacionId, {
                contenido: newComment.trim(),
                esAnonimo,
            });

            onComentarioAdded(comentario);
            setNewComment('');
            setEsAnonimo(false);
        } catch (error: any) {
            console.error('Error creating comment:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo publicar el comentario'
            );
        } finally {
            setSubmitting(false);
        }
    }, [newComment, esAnonimo, calificacionId, onComentarioAdded, submitting]);

    const handleDelete = useCallback(async (id: number) => {
        Alert.alert(
            'Eliminar comentario',
            'Esta accion no se puede deshacer',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await comentariosApi.delete(id);
                            onComentarioDeleted(id);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        } catch (error) {
                            console.error('Error deleting comment:', error);
                            Alert.alert('Error', 'No se pudo eliminar el comentario');
                        }
                    },
                },
            ]
        );
    }, [onComentarioDeleted]);

    const visibleComentarios = expanded ? comentarios : comentarios.slice(0, 2);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="chatbubble-outline" size={16} color={theme.icon} />
                <Text style={[styles.headerText, { color: theme.text }]}>
                    Comentarios ({comentarios.length})
                </Text>
            </View>

            {/* Lista de comentarios */}
            {loading ? (
                <ActivityIndicator size="small" color={theme.tint} style={styles.loader} />
            ) : comentarios.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.icon }]}>
                    Se el primero en comentar
                </Text>
            ) : (
                <>
                    {visibleComentarios.map((comentario) => (
                        <ComentarioItem
                            key={comentario.id}
                            comentario={comentario}
                            theme={theme}
                            onDelete={() => handleDelete(comentario.id)}
                            isOwner={comentario.userId === user?.id}
                        />
                    ))}
                    {comentarios.length > 2 && !expanded && (
                        <TouchableOpacity
                            style={styles.showMoreButton}
                            onPress={() => setExpanded(true)}
                        >
                            <Text style={[styles.showMoreText, { color: theme.tint }]}>
                                Ver {comentarios.length - 2} comentarios mas
                            </Text>
                        </TouchableOpacity>
                    )}
                    {expanded && comentarios.length > 2 && (
                        <TouchableOpacity
                            style={styles.showMoreButton}
                            onPress={() => setExpanded(false)}
                        >
                            <Text style={[styles.showMoreText, { color: theme.tint }]}>
                                Ver menos
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            )}

            {/* Input para nuevo comentario */}
            <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.separator }]}>
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Escribe un comentario..."
                    placeholderTextColor={theme.icon}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    maxLength={500}
                />
                <View style={styles.inputActions}>
                    <View style={styles.anonimoToggle}>
                        <Text style={[styles.anonimoLabel, { color: theme.icon }]}>Anonimo</Text>
                        <Switch
                            value={esAnonimo}
                            onValueChange={setEsAnonimo}
                            trackColor={{ false: theme.separator, true: theme.tint + '50' }}
                            thumbColor={esAnonimo ? theme.tint : '#f4f4f4'}
                            style={styles.switch}
                        />
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor: newComment.trim() ? theme.tint : theme.separator,
                            },
                        ]}
                        onPress={handleSubmit}
                        disabled={!newComment.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="send" size={16} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loader: {
        marginVertical: 16,
    },
    emptyText: {
        fontSize: 13,
        textAlign: 'center',
        marginVertical: 12,
    },
    comentarioItem: {
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    comentarioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    miniAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    miniAvatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    comentarioUserInfo: {
        flex: 1,
        marginLeft: 8,
    },
    comentarioNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    comentarioUserName: {
        fontSize: 13,
        fontWeight: '600',
    },
    comentarioTime: {
        fontSize: 11,
    },
    comentarioText: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 32,
    },
    showMoreButton: {
        paddingVertical: 8,
    },
    showMoreText: {
        fontSize: 13,
        fontWeight: '500',
    },
    inputContainer: {
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        padding: 10,
    },
    input: {
        fontSize: 14,
        minHeight: 40,
        maxHeight: 80,
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    anonimoToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    anonimoLabel: {
        fontSize: 12,
    },
    switch: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
