import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DataRepository } from '../../services/dataRepository';
import { mifacuNavy, mifacuGold } from '../../constants/theme';
import type { ThemeColors, Universidad, Carrera } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CarreraModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (carreraId: string, carreraNombre: string) => void;
    theme: ThemeColors;
    isDarkMode: boolean;
}

export const CarreraModal = ({
    visible,
    onClose,
    onSelect,
    theme,
    isDarkMode,
}: CarreraModalProps) => {
    const [step, setStep] = useState<'universidad' | 'carrera'>('universidad');
    const [selectedUni, setSelectedUni] = useState<string | null>(null);
    const [universidades, setUniversidades] = useState<Universidad[]>([]);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [loading, setLoading] = useState(false);

    // Load universities when joining university step
    useEffect(() => {
        if (visible && step === 'universidad') {
            loadUniversidades();
        }
    }, [visible, step]);

    // Load careers when selecting university
    useEffect(() => {
        if (selectedUni) {
            loadCarreras(selectedUni);
        }
    }, [selectedUni]);

    // Reset state when closing
    useEffect(() => {
        if (!visible) {
            setStep('universidad');
            setSelectedUni(null);
        }
    }, [visible]);

    const loadUniversidades = async () => {
        try {
            setLoading(true);
            const data = await DataRepository.getUniversidades();
            setUniversidades(data);
        } catch (error) {
            console.error('Error loading universities:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCarreras = async (uniId: string) => {
        try {
            setLoading(true);
            const data = await DataRepository.getCarreras(uniId);
            setCarreras(data);
        } catch (error) {
            console.error('Error loading careers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUni = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedUni(id);
        setStep('carrera');
    };

    const handleSelectCarrera = (id: string, nombre: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSelect(id, nombre);
    };

    const getUniversityIcon = (name: string): keyof typeof Ionicons.glyphMap => {
        const lower = name.toLowerCase();
        if (lower.includes('tecnológica') || lower.includes('utn')) return 'hardware-chip-outline';
        if (lower.includes('nordeste') || lower.includes('unne')) return 'business-outline'; // Building icon for generic/institutional
        return 'school-outline';
    };

    const getCareerIcon = (name: string): keyof typeof Ionicons.glyphMap => {
        const lower = name.toLowerCase();
        if (lower.includes('sistemas') || lower.includes('computación')) return 'terminal-outline';
        if (lower.includes('arquitectura') || lower.includes('diseño')) return 'construct-outline'; // Drafting compass/tools
        if (lower.includes('civil')) return 'business-outline';
        if (lower.includes('industrial')) return 'cog-outline';
        return 'book-outline';
    };

    const renderUniversidad = () => (
        <View style={styles.stepContainer}>
            <View style={styles.headerContainer}>
                <View style={[styles.iconCycle, { backgroundColor: theme.tint + '10' }]}>
                    <Ionicons name="school" size={28} color={theme.tint} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Seleccioná tu Universidad</Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>
                    Para personalizar tu experiencia académica
                </Text>
            </View>

            {universidades.map((uni) => (
                <TouchableOpacity
                    key={uni.id}
                    style={[
                        styles.card,
                        {
                            backgroundColor: theme.backgroundSecondary,
                            borderColor: theme.separator,
                            shadowColor: theme.text
                        }
                    ]}
                    onPress={() => handleSelectUni(uni.id)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconBox, { backgroundColor: mifacuNavy }]}>
                        {/* Always white icon on Navy background for standard contrast */}
                        <Ionicons name={getUniversityIcon(uni.nombre)} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{uni.nombre}</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.icon }]}>{uni.abreviatura || 'Universidad'}</Text>
                    </View>
                    <View style={[styles.chevronBox, { backgroundColor: theme.background }]}>
                        <Ionicons name="chevron-forward" size={16} color={theme.tint} />
                    </View>
                </TouchableOpacity>
            ))}

            <View style={styles.futureNotice}>
                <Ionicons name="information-circle-outline" size={16} color={theme.icon} />
                <Text style={[styles.futureNoticeText, { color: theme.icon }]}>
                    Próximamente más universidades
                </Text>
            </View>
        </View>
    );

    const renderCarrera = () => {
        const uni = universidades.find((u) => u.id === selectedUni);
        return (
            <View style={styles.stepContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep('universidad')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={[styles.backIconBox, { backgroundColor: theme.backgroundSecondary }]}>
                        <Ionicons name="arrow-back" size={20} color={theme.text} />
                    </View>
                    <Text style={[styles.backText, { color: theme.text }]}>Volver a Universidades</Text>
                </TouchableOpacity>

                <View style={styles.headerContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Elegí tu Carrera</Text>
                    <Text style={[styles.subtitle, { color: theme.tint, fontWeight: '600' }]}>
                        {uni?.abreviatura || uni?.nombre}
                    </Text>
                </View>

                {carreras.map((carrera) => (
                    <TouchableOpacity
                        key={carrera.id}
                        style={[
                            styles.card,
                            {
                                backgroundColor: theme.backgroundSecondary,
                                borderColor: theme.separator,
                                shadowColor: theme.text
                            }
                        ]}
                        onPress={() => handleSelectCarrera(carrera.id, carrera.nombre)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconBox, { backgroundColor: mifacuNavy }]}>
                            {/* Consistent branding: Navy bg, White icon */}
                            <Ionicons name={getCareerIcon(carrera.nombre)} size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{carrera.nombre}</Text>
                        </View>
                        <Ionicons name="add-circle-outline" size={24} color={theme.separator} />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Darker blur for better focus */}
                <BlurView intensity={40} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                <View style={[styles.sheet, { backgroundColor: theme.background }]}>
                    <View style={[styles.handle, { backgroundColor: theme.separator }]} />

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={20} color={theme.text} />
                    </TouchableOpacity>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {step === 'universidad' ? renderUniversidad() : renderCarrera()}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.icon }]}>
                            miFACU • Identidad Académica
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sheet: {
        height: SCREEN_HEIGHT * 0.82, // Taller sheet for better presence
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 30,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 24,
        zIndex: 100,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
        opacity: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    stepContainer: {
        flex: 1,
    },
    // Header Styles
    headerContainer: {
        marginBottom: 32,
        marginTop: 10,
    },
    iconCycle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 22,
        opacity: 0.8,
    },
    // Navigation
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backIconBox: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    backText: {
        fontSize: 15,
        fontWeight: '600',
    },
    // Card Styles
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        marginBottom: 14,
        borderWidth: 1,
        // Premium subtle shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: mifacuNavy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    cardContent: {
        flex: 1,
        marginLeft: 18,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    cardSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    chevronBox: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Footer & Notices
    futureNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        opacity: 0.6,
        gap: 6,
    },
    futureNoticeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    footerText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.4,
    },
});
