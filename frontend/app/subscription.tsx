import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePremium } from '../src/context/PremiumContext';
import { useTheme } from '../src/context/ThemeContext';
import { Colors, mifacuNavy, mifacuGold } from '../src/constants/theme';

const BENEFITS = [
    { icon: 'analytics', text: 'Simulador de Correlativas', description: 'Planifica tu carrera' },
    { icon: 'star', text: 'Reseñas de Cátedras', description: 'Opiniones de estudiantes' },
    { icon: 'bulb', text: 'Temas de Finales', description: 'Lo que se pregunta' },
    { icon: 'calendar', text: 'Calendario Académico', description: 'Visualiza tu año' },
    { icon: 'paw', text: 'Milo', description: 'Tu compañero de estudio' },
    { icon: 'heart', text: 'Apoya el desarrollo', description: 'Ayuda a que crezcamos' },
];

export default function SubscriptionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const { currentOffering, isPro, purchasePackage, restorePurchases, loading } = usePremium();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                damping: 20,
                stiffness: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePurchase = async (pkg: any) => {
        const success = await purchasePackage(pkg);
        if (success) {
            Alert.alert(
                '¡Bienvenido a Premium!',
                'Ahora tienes acceso a todas las funciones de miFACU.',
                [{ text: '¡Genial!', onPress: () => router.back() }]
            );
        }
    };

    const handleRestore = async () => {
        const success = await restorePurchases();
        if (success) {
            Alert.alert('¡Compras restauradas!', 'Tu suscripción Premium ha sido restaurada.');
            router.back();
        } else {
            Alert.alert('Sin compras', 'No se encontraron compras activas para restaurar.');
        }
    };

    // Already premium
    if (isPro) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <LinearGradient
                    colors={isDark ? ['#0A1628', '#050D1A'] : [mifacuNavy, '#0F1D45']}
                    style={styles.headerBackground}
                />
                <View style={[styles.alreadyPremiumContainer, { paddingTop: insets.top + 60 }]}>
                    <View style={styles.alreadyPremiumIcon}>
                        <Ionicons name="checkmark-circle" size={80} color={mifacuGold} />
                    </View>
                    <Text style={styles.alreadyPremiumTitle}>¡Ya eres Premium!</Text>
                    <Text style={styles.alreadyPremiumSubtitle}>
                        Tienes acceso a todas las funciones de miFACU
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: mifacuGold }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={mifacuGold} />
                <Text style={[styles.loadingText, { color: theme.icon }]}>
                    Cargando opciones...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0A0F1A' : '#F5F5F7' }]}>
            <LinearGradient
                colors={isDark ? ['#0A1628', '#050D1A'] : [mifacuNavy, '#0F1D45']}
                style={styles.headerBackground}
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.header,
                        {
                            paddingTop: insets.top + 20,
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.closeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close-circle" size={36} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>

                    {/* Premium Icon */}
                    <View style={styles.premiumIconContainer}>
                        <LinearGradient
                            colors={[mifacuGold, '#FFB800']}
                            style={styles.premiumIconGradient}
                        >
                            <Ionicons name="star" size={36} color="#FFFFFF" />
                        </LinearGradient>
                    </View>

                    <Text style={styles.headerTitle}>miFACU Premium</Text>
                    <Text style={styles.headerSubtitle}>
                        Desbloquea todo el potencial de tu carrera
                    </Text>
                </Animated.View>

                {/* Benefits Card */}
                <Animated.View
                    style={[
                        styles.benefitsContainer,
                        {
                            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={[styles.benefitsTitle, { color: isDark ? '#FFFFFF' : mifacuNavy }]}>
                        Qué incluye
                    </Text>
                    {BENEFITS.map((benefit, index) => (
                        <BenefitItem
                            key={index}
                            icon={benefit.icon}
                            text={benefit.text}
                            description={benefit.description}
                            isDark={isDark}
                            delay={index * 50}
                        />
                    ))}
                </Animated.View>

                {/* Packages */}
                {currentOffering?.availablePackages.map((pkg, index) => (
                    <Animated.View
                        key={pkg.identifier}
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.packageCard,
                                {
                                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                    borderColor: index === 0 ? mifacuGold : (isDark ? '#38383A' : '#E5E5E7'),
                                }
                            ]}
                            onPress={() => handlePurchase(pkg)}
                            activeOpacity={0.8}
                        >
                            {index === 0 && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularBadgeText}>POPULAR</Text>
                                </View>
                            )}
                            <View style={styles.packageInfo}>
                                <Text style={[styles.packageTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                                    {pkg.product.title}
                                </Text>
                                <Text style={[styles.packageDescription, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
                                    {pkg.product.description}
                                </Text>
                            </View>
                            <View style={styles.packagePriceContainer}>
                                <Text style={[styles.packagePrice, { color: mifacuGold }]}>
                                    {pkg.product.priceString}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                {/* Restore Button */}
                <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                    <Text style={[styles.restoreText, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
                        ¿Ya compraste? Restaurar compras
                    </Text>
                </TouchableOpacity>

                {/* Disclaimer */}
                <Text style={[styles.disclaimer, { color: isDark ? '#48484A' : '#AEAEB2' }]}>
                    La suscripción se renovará automáticamente a menos que se cancele 24 horas antes del final del periodo actual. El pago se cargará a tu cuenta de {Platform.OS === 'ios' ? 'iTunes' : 'Google Play'}.
                </Text>
            </ScrollView>
        </View>
    );
}

const BenefitItem = ({
    icon,
    text,
    description,
    isDark,
    delay
}: {
    icon: any;
    text: string;
    description: string;
    isDark: boolean;
    delay: number;
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay]);

    return (
        <Animated.View
            style={[
                styles.benefitItem,
                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: mifacuGold + '15' }]}>
                <Ionicons name={icon} size={22} color={mifacuGold} />
            </View>
            <View style={styles.benefitTextContainer}>
                <Text style={[styles.benefitText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {text}
                </Text>
                <Text style={[styles.benefitDescription, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
                    {description}
                </Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={mifacuGold} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
    },
    headerBackground: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 320,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 50,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    premiumIconContainer: {
        marginBottom: 16,
        shadowColor: mifacuGold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    premiumIconGradient: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
        textAlign: 'center',
    },
    benefitsContainer: {
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: -24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    benefitsTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    benefitTextContainer: {
        flex: 1,
    },
    benefitText: {
        fontSize: 16,
        fontWeight: '600',
    },
    benefitDescription: {
        fontSize: 13,
        marginTop: 2,
    },
    packageCard: {
        marginHorizontal: 20,
        marginTop: 16,
        padding: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        left: 16,
        backgroundColor: mifacuGold,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    popularBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    packageInfo: {
        flex: 1,
    },
    packageTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    packageDescription: {
        fontSize: 14,
        marginTop: 4,
    },
    packagePriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    packagePrice: {
        fontSize: 20,
        fontWeight: '800',
    },
    restoreButton: {
        marginTop: 28,
        alignItems: 'center',
        paddingVertical: 12,
    },
    restoreText: {
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    disclaimer: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 20,
        marginHorizontal: 32,
        lineHeight: 16,
    },
    // Already premium styles
    alreadyPremiumContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    alreadyPremiumIcon: {
        marginBottom: 24,
    },
    alreadyPremiumTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    alreadyPremiumSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 32,
    },
    backButton: {
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 14,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
