import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    Switch,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMateriasSelector } from '../../hooks/useCalificaciones';
import { CreateTemaFinalDTO } from '../../types/temas-finales';

interface AgregarTemaSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTemaFinalDTO) => Promise<void>;
    theme: any;
    materiaIdInicial?: number;
    materiaNombreInicial?: string;
}

export function AgregarTemaSheet({
    visible,
    onClose,
    onSubmit,
    theme,
    materiaIdInicial,
    materiaNombreInicial,
}: AgregarTemaSheetProps) {
    const { materias, loading: loadingMaterias } = useMateriasSelector();

    const [materiaId, setMateriaId] = useState<number | null>(materiaIdInicial || null);
    const [tema, setTema] = useState('');
    const [fechaMesa, setFechaMesa] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [esAnonimo, setEsAnonimo] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showMateriasList, setShowMateriasList] = useState(false);

    const slideAnim = useRef(new Animated.Value(500)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    const materiaSeleccionada = materias.find(m => m.id === materiaId);

    useEffect(() => {
        if (visible && materiaIdInicial) {
            setMateriaId(materiaIdInicial);
        }
    }, [visible, materiaIdInicial]);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 500,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const resetForm = () => {
        setMateriaId(materiaIdInicial || null);
        setTema('');
        setFechaMesa(null);
        setEsAnonimo(false);
        setShowMateriasList(false);
        setShowDatePicker(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isValid = materiaId && tema.trim().length >= 3;

    const handleSubmit = async () => {
        if (!isValid || submitting) return;

        setSubmitting(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            await onSubmit({
                materiaId: materiaId!,
                tema: tema.trim(),
                fechaMesa: fechaMesa ? fechaMesa.toISOString().split('T')[0] : undefined,
                esAnonimo,
            });
            resetForm();
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Error al publicar el tema';
            Alert.alert('Error', message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setFechaMesa(selectedDate);
        }
    };

    const formatDate = (date: Date): string => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={StyleSheet.absoluteFill}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View style={[styles.overlay, { opacity: backdropAnim }]}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={styles.keyboardView}
                        >
                            <TouchableWithoutFeedback>
                                <Animated.View
                                    style={[
                                        styles.container,
                                        { backgroundColor: theme.backgroundSecondary },
                                        { transform: [{ translateY: slideAnim }] }
                                    ]}
                                >
                                    {/* Handle bar */}
                                    <View style={styles.handleBar}>
                                        <View style={[styles.handle, { backgroundColor: theme.icon + '40' }]} />
                                    </View>

                                    {/* Header */}
                                    <View style={styles.header}>
                                        <TouchableOpacity onPress={handleClose}>
                                            <Text style={[styles.cancelButton, { color: theme.tint }]}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <Text style={[styles.title, { color: theme.text }]}>Nuevo Tema</Text>
                                        <TouchableOpacity
                                            onPress={handleSubmit}
                                            disabled={!isValid || submitting}
                                        >
                                            {submitting ? (
                                                <ActivityIndicator size="small" color={theme.tint} />
                                            ) : (
                                                <Text
                                                    style={[
                                                        styles.submitButton,
                                                        { color: isValid ? theme.tint : theme.icon },
                                                    ]}
                                                >
                                                    Publicar
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                        {/* Selector de materia */}
                                        <View style={styles.field}>
                                            <Text style={[styles.label, { color: theme.text }]}>Materia</Text>
                                            <TouchableOpacity
                                                style={[styles.selector, { backgroundColor: theme.background, borderColor: theme.separator }]}
                                                onPress={() => setShowMateriasList(!showMateriasList)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.selectorText,
                                                        { color: materiaSeleccionada ? theme.text : theme.icon },
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {materiaSeleccionada?.nombre || 'Seleccionar materia'}
                                                </Text>
                                                <Ionicons
                                                    name={showMateriasList ? 'chevron-up' : 'chevron-down'}
                                                    size={20}
                                                    color={theme.icon}
                                                />
                                            </TouchableOpacity>

                                            {showMateriasList && (
                                                <View style={[styles.list, { backgroundColor: theme.background, borderColor: theme.separator }]}>
                                                    {loadingMaterias ? (
                                                        <ActivityIndicator style={styles.listLoading} />
                                                    ) : (
                                                        <ScrollView style={styles.listScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                                                            {materias.map(materia => (
                                                                <TouchableOpacity
                                                                    key={materia.id}
                                                                    style={[
                                                                        styles.listItem,
                                                                        materia.id === materiaId && { backgroundColor: theme.tint + '15' },
                                                                    ]}
                                                                    onPress={() => {
                                                                        setMateriaId(materia.id);
                                                                        setShowMateriasList(false);
                                                                        Haptics.selectionAsync();
                                                                    }}
                                                                >
                                                                    <Text style={[styles.listItemText, { color: theme.text }]} numberOfLines={1}>
                                                                        {materia.nombre}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    )}
                                                </View>
                                            )}
                                        </View>

                                        {/* Tema */}
                                        <View style={styles.field}>
                                            <Text style={[styles.label, { color: theme.text }]}>Tema</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.separator }]}
                                                value={tema}
                                                onChangeText={setTema}
                                                placeholder="Ej: Bolzano, Integrales dobles..."
                                                placeholderTextColor={theme.icon}
                                                maxLength={300}
                                            />
                                            <Text style={[styles.charCount, { color: theme.icon }]}>
                                                {tema.length}/300
                                            </Text>
                                        </View>

                                        {/* Fecha de mesa */}
                                        <View style={styles.field}>
                                            <Text style={[styles.label, { color: theme.text }]}>Fecha de mesa (opcional)</Text>
                                            <TouchableOpacity
                                                style={[styles.selector, { backgroundColor: theme.background, borderColor: theme.separator }]}
                                                onPress={() => setShowDatePicker(!showDatePicker)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.selectorText,
                                                        { color: fechaMesa ? theme.text : theme.icon },
                                                    ]}
                                                >
                                                    {fechaMesa ? formatDate(fechaMesa) : 'Seleccionar fecha'}
                                                </Text>
                                                <View style={styles.dateActions}>
                                                    {fechaMesa && (
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setFechaMesa(null);
                                                                setShowDatePicker(false);
                                                            }}
                                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                        >
                                                            <Ionicons name="close-circle" size={18} color={theme.icon} />
                                                        </TouchableOpacity>
                                                    )}
                                                    <Ionicons name="calendar-outline" size={20} color={theme.icon} />
                                                </View>
                                            </TouchableOpacity>

                                            {showDatePicker && (
                                                <View style={styles.datePickerContainer}>
                                                    <DateTimePicker
                                                        value={fechaMesa || new Date()}
                                                        mode="date"
                                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                        onChange={handleDateChange}
                                                        maximumDate={new Date()}
                                                    />
                                                    {Platform.OS === 'ios' && (
                                                        <TouchableOpacity
                                                            style={[styles.dateConfirmBtn, { backgroundColor: theme.tint }]}
                                                            onPress={() => setShowDatePicker(false)}
                                                        >
                                                            <Text style={styles.dateConfirmText}>Confirmar</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            )}
                                        </View>

                                        {/* Anonimo switch */}
                                        <View style={[styles.switchRow, { borderColor: theme.separator }]}>
                                            <View style={styles.switchInfo}>
                                                <Text style={[styles.switchLabel, { color: theme.text }]}>Publicar como anonimo</Text>
                                                <Text style={[styles.switchHint, { color: theme.icon }]}>
                                                    Tu nombre no sera visible en el tema
                                                </Text>
                                            </View>
                                            <Switch
                                                value={esAnonimo}
                                                onValueChange={setEsAnonimo}
                                                trackColor={{ false: theme.separator, true: theme.tint + '80' }}
                                                thumbColor={esAnonimo ? theme.tint : '#f4f3f4'}
                                            />
                                        </View>

                                        <View style={{ height: 40 }} />
                                    </ScrollView>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    handleBar: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 5,
    },
    handle: {
        width: 36,
        height: 5,
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    cancelButton: {
        fontSize: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    submitButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    selectorText: {
        fontSize: 16,
        flex: 1,
    },
    list: {
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    listScroll: {
        maxHeight: 200,
    },
    listLoading: {
        padding: 20,
    },
    listItem: {
        padding: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    listItemText: {
        fontSize: 15,
    },
    input: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
    dateActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    datePickerContainer: {
        marginTop: 8,
    },
    dateConfirmBtn: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginTop: 8,
    },
    dateConfirmText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    switchInfo: {
        flex: 1,
        marginRight: 16,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    switchHint: {
        fontSize: 13,
        marginTop: 2,
    },
});
