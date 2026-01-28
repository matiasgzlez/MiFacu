import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { useMateriasResenas, MateriaConResenas, NivelFiltro, OrdenTipo } from '../src/hooks/useMateriasResenas';

// Colores por nivel - vibrantes
const NIVEL_COLORS: Record<number, { primary: string; gradient: string[] }> = {
    1: { primary: '#10B981', gradient: ['#10B981', '#059669'] },
    2: { primary: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
    3: { primary: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    4: { primary: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    5: { primary: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
};

const NIVEL_LABELS: Record<number, string> = {
    1: '1° Año',
    2: '2° Año',
    3: '3° Año',
    4: '4° Año',
    5: '5° Año',
};

const ORDEN_OPTIONS: { value: OrdenTipo; label: string; icon: string }[] = [
    { value: 'resenas_desc', label: 'Más reseñas', icon: 'chatbubbles' },
    { value: 'resenas_asc', label: 'Menos reseñas', icon: 'chatbubble-outline' },
    { value: 'alfabetico', label: 'A-Z', icon: 'text' },
    { value: 'numero', label: 'N° Materia', icon: 'list' },
];

export default function SelectMateriaScreen() {
    const router = useRouter();
    const { colorScheme, isDark } = useTheme();
    const { user } = useAuth();
    const theme = Colors[colorScheme];

    const {
        materiasFiltradas,
        loading,
        refreshing,
        isLoggedIn,
        nivelFiltro,
        setNivelFiltro,
        ordenTipo,
        setOrdenTipo,
        searchQuery,
        setSearchQuery,
        refetch,
    } = useMateriasResenas();

    const [showOrdenMenu, setShowOrdenMenu] = useState(false);

    // Navegación a reseñas de materia
    const handleSelectMateria = useCallback((materia: MateriaConResenas) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
            pathname: '/calificaciones',
            params: { materiaId: materia.id, materiaNombre: materia.nombre }
        } as any);
    }, [router]);

    // Cambiar filtro de nivel - FIX: Actualiza correctamente el estado
    const handleNivelPress = useCallback((nivel: NivelFiltro) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Filtro seleccionado:', nivel);
        setNivelFiltro(nivel);
    }, [setNivelFiltro]);

    // Cambiar orden
    const handleOrdenPress = useCallback((orden: OrdenTipo) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOrdenTipo(orden);
        setShowOrdenMenu(false);
    }, [setOrdenTipo]);

    // Renderizar estrellas compactas
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 0; i < 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i < fullStars ? "star" : "star-outline"}
                    size={11}
                    color={i < fullStars ? "#FBBF24" : (isDark ? '#4B5563' : '#D1D5DB')}
                />
            );
        }
        return stars;
    };

    // Tarjeta compacta de materia
    const renderMateriaCard = useCallback(({ item }: { item: MateriaConResenas }) => {
        const nivelInfo = NIVEL_COLORS[item.nivelNumero] || NIVEL_COLORS[1];

        return (
            <TouchableOpacity
                style={[
                    styles.materiaCard,
                    { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
                ]}
                onPress={() => handleSelectMateria(item)}
                activeOpacity={0.7}
            >
                {/* Indicador de nivel lateral */}
                <View style={[styles.nivelIndicator, { backgroundColor: nivelInfo.primary }]} />

                {/* Contenido principal */}
                <View style={styles.cardContent}>
                    {/* Fila superior: número + nombre */}
                    <View style={styles.cardTopRow}>
                        <LinearGradient
                            colors={nivelInfo.gradient as [string, string]}
                            style={styles.numeroBox}
                        >
                            <Text style={styles.numeroText}>{item.numero}</Text>
                        </LinearGradient>

                        <Text style={[styles.materiaNombre, { color: theme.text }]} numberOfLines={2}>
                            {item.nombre}
                        </Text>
                    </View>

                    {/* Fila inferior: nivel + stats */}
                    <View style={styles.cardBottomRow}>
                        <Text style={[styles.nivelText, { color: nivelInfo.primary }]}>
                            {NIVEL_LABELS[item.nivelNumero]}
                        </Text>

                        <View style={styles.statsRow}>
                            {/* Reseñas */}
                            <View style={styles.statItem}>
                                <Ionicons name="chatbubble" size={12} color={theme.tint} />
                                <Text style={[styles.statText, { color: theme.text }]}>
                                    {item.totalResenas}
                                </Text>
                            </View>

                            {/* Rating */}
                            {item.ratingPromedio > 0 && (
                                <View style={styles.statItem}>
                                    <View style={styles.starsRow}>
                                        {renderStars(item.ratingPromedio)}
                                    </View>
                                    <Text style={[styles.ratingText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                                        {item.ratingPromedio.toFixed(1)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={isDark ? '#4B5563' : '#D1D5DB'} />
            </TouchableOpacity>
        );
    }, [theme, isDark, handleSelectMateria]);

    // Pantalla de login requerido
    if (!isLoggedIn) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <SafeAreaView style={styles.authContainer}>
                    <View style={styles.authContent}>
                        <View style={[styles.authIconContainer, { backgroundColor: theme.tint + '15' }]}>
                            <Ionicons name="school" size={48} color={theme.tint} />
                        </View>
                        <Text style={[styles.authTitle, { color: theme.text }]}>
                            Reseñas de Cátedras
                        </Text>
                        <Text style={[styles.authSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            Inicia sesión para ver opiniones de profesores y materias
                        </Text>
                        <TouchableOpacity
                            style={[styles.authButton, { backgroundColor: theme.tint }]}
                            onPress={() => router.push('/(auth)/login' as any)}
                        >
                            <Text style={styles.authButtonText}>Iniciar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }
    // Header height calculation for content padding - needs to match actual header size
    const HEADER_HEIGHT = Platform.OS === 'ios' ? 260 : 240;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header fijo con blur */}
            <View style={[styles.headerWrapper, { backgroundColor: theme.background }]}>
                <BlurView
                    intensity={isDark ? 80 : 95}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                    {/* Barra superior */}
                    <View style={[styles.header, { borderBottomColor: isDark ? '#374151' : '#E5E7EB' }]}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={26} color={theme.tint} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Reseñas de Cátedras</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Buscador */}
                    <View style={styles.searchWrapper}>
                        <View style={[
                            styles.searchContainer,
                            { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                        ]}>
                            <Ionicons name="search" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder="Buscar materia..."
                                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={isDark ? '#6B7280' : '#9CA3AF'} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Filtros de nivel */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersRow}
                    >
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                nivelFiltro === 'todos'
                                    ? { backgroundColor: theme.tint }
                                    : { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
                            ]}
                            onPress={() => handleNivelPress('todos')}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: nivelFiltro === 'todos' ? '#FFF' : theme.text }
                            ]}>Todos</Text>
                        </TouchableOpacity>

                        {[1, 2, 3, 4, 5].map((nivel) => {
                            const isActive = nivelFiltro === nivel;
                            const nivelInfo = NIVEL_COLORS[nivel];
                            return (
                                <TouchableOpacity
                                    key={nivel}
                                    style={[
                                        styles.filterChip,
                                        isActive
                                            ? { backgroundColor: nivelInfo.primary }
                                            : {
                                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                                borderWidth: 1.5,
                                                borderColor: nivelInfo.primary + '50',
                                            }
                                    ]}
                                    onPress={() => handleNivelPress(nivel as NivelFiltro)}
                                >
                                    <View style={[
                                        styles.filterDot,
                                        { backgroundColor: isActive ? '#FFF' : nivelInfo.primary }
                                    ]} />
                                    <Text style={[
                                        styles.filterText,
                                        { color: isActive ? '#FFF' : nivelInfo.primary }
                                    ]}>{nivel}°</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Ordenamiento */}
                    <View style={[styles.ordenRow, { borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
                        <Text style={[styles.countText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            {materiasFiltradas.length} materias
                        </Text>
                        <TouchableOpacity
                            style={[styles.ordenBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                            onPress={() => setShowOrdenMenu(!showOrdenMenu)}
                        >
                            <Text style={[styles.ordenBtnText, { color: theme.text }]}>
                                {ORDEN_OPTIONS.find(o => o.value === ordenTipo)?.label}
                            </Text>
                            <Ionicons name="chevron-down" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {/* Dropdown de orden - FUERA del header para que se vea por encima */}
            {showOrdenMenu && (
                <View style={[
                    styles.ordenDropdown,
                    {
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        top: HEADER_HEIGHT - 10,
                    }
                ]}>
                    {ORDEN_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.ordenOption,
                                ordenTipo === opt.value && { backgroundColor: theme.tint + '15' }
                            ]}
                            onPress={() => handleOrdenPress(opt.value)}
                        >
                            <Text style={[
                                styles.ordenOptionText,
                                { color: ordenTipo === opt.value ? theme.tint : theme.text }
                            ]}>{opt.label}</Text>
                            {ordenTipo === opt.value && (
                                <Ionicons name="checkmark" size={16} color={theme.tint} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Lista de materias */}
            <FlatList
                data={materiasFiltradas}
                renderItem={renderMateriaCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingTop: HEADER_HEIGHT },
                    materiasFiltradas.length === 0 && styles.listEmpty,
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    loading && !refreshing ? (
                        <View style={styles.inlineLoadingContainer}>
                            <ActivityIndicator size="large" color={theme.tint} />
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={40} color={isDark ? '#4B5563' : '#9CA3AF'} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin resultados</Text>
                            <Text style={[styles.emptySubtitle, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                                Prueba con otro filtro o búsqueda
                            </Text>
                            <TouchableOpacity
                                style={[styles.resetBtn, { borderColor: theme.tint }]}
                                onPress={() => {
                                    setSearchQuery('');
                                    setNivelFiltro('todos');
                                }}
                            >
                                <Text style={[styles.resetBtnText, { color: theme.tint }]}>Limpiar filtros</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refetch}
                        tintColor={theme.tint}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Auth
    authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    authContent: { alignItems: 'center' },
    authIconContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    authTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
    authSubtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
    authButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    authButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

    // Loading
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 15 },
    inlineLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },

    // Header - FIXED: Full coverage with no gaps
    headerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        overflow: 'hidden',
    },
    headerSafeArea: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '600' },

    // Search
    searchWrapper: { paddingHorizontal: 16, paddingVertical: 8 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    searchInput: { flex: 1, fontSize: 15, padding: 0 },

    // Filters
    filtersRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 5,
    },
    filterDot: { width: 6, height: 6, borderRadius: 3 },
    filterText: { fontSize: 13, fontWeight: '600' },

    // Order
    ordenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    countText: { fontSize: 13 },
    ordenBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    ordenBtnText: { fontSize: 13, fontWeight: '500' },
    ordenDropdown: {
        position: 'absolute',
        right: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        minWidth: 150,
        paddingVertical: 4,
        zIndex: 200,
    },
    ordenOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    ordenOptionText: { fontSize: 14 },

    // List
    listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
    listEmpty: { flex: 1, justifyContent: 'center' },

    // Card - Compact design
    materiaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    nivelIndicator: {
        width: 4,
        alignSelf: 'stretch',
    },
    cardContent: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
    },
    numeroBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numeroText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    materiaNombre: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
    cardBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nivelText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 1,
    },
    ratingText: {
        fontSize: 11,
    },

    // Empty
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 12 },
    emptySubtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },
    resetBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
    resetBtnText: { fontSize: 14, fontWeight: '500' },
});
