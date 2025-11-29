import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import Skeleton from '../components/Skeleton';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../styles/theme';

const { width } = Dimensions.get('window');
const GRID_SPACING = SPACING.md;
const CARD_WIDTH = (width - (GRID_SPACING * 3)) / 2;

const VisitorDashboardScreen = () => {
    const [slots, setSlots] = useState([]);
    const [stats, setStats] = useState(null);
    const [recommended, setRecommended] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [slotsRes, statsRes, recommendedRes] = await Promise.all([
                api.get('/visitor/slots'),
                api.get('/visitor/stats'),
                api.get('/visitor/recommended'),
            ]);
            setSlots(slotsRes.data);
            setStats(statsRes.data);
            setRecommended(recommendedRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleReserveSlot = (slot) => {
        if (slot.state !== 'Free') {
            Alert.alert('Unavailable', 'This slot is not available for reservation.');
            return;
        }

        Alert.alert(
            'Confirm Reservation',
            `Do you want to reserve slot ${slot.label}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reserve',
                    onPress: async () => {
                        try {
                            await api.post(`/visitor/reserve/${slot._id}`);
                            Alert.alert('Success', 'Slot reserved successfully!');
                            fetchData();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.error || 'Failed to reserve slot');
                        }
                    }
                }
            ]
        );
    };

    const getSlotColor = (state) => {
        switch (state) {
            case 'Free': return colors.free;
            case 'Occupied': return colors.occupied;
            case 'Reserved': return colors.reserved;
            default: return colors.textSecondary;
        }
    };

    const getSlotIcon = (type) => {
        return type === 'Two-wheeler' ? 'motorbike' : 'car';
    };

    const renderStatCard = ({ item }) => (
        <View style={[styles.statCard, SHADOWS.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
        </View>
    );

    const renderSlotGridItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={item.state === 'Free' ? 0.7 : 1}
            onPress={() => handleReserveSlot(item)}
            style={[
                styles.gridItem,
                SHADOWS.sm,
                {
                    backgroundColor: item.state === 'Free' ? colors.card : colors.surface,
                    borderColor: getSlotColor(item.state),
                    borderWidth: 2,
                }
            ]}
        >
            <View style={styles.gridHeader}>
                <Text style={[styles.gridLabel, { color: colors.text }]}>{item.label}</Text>
                <MaterialCommunityIcons
                    name={getSlotIcon(item.type)}
                    size={20}
                    color={item.state === 'Free' ? colors.primary : colors.textSecondary}
                />
            </View>
            <View style={[styles.gridStatus, { backgroundColor: getSlotColor(item.state) }]}>
                <Text style={[styles.gridStatusText, { color: '#FFFFFF' }]}>{item.state}</Text>
            </View>
            {item.state === 'Free' && (
                <View style={styles.tapToReserve}>
                    <Text style={[styles.tapToReserveText, { color: colors.primary }]}>Tap to Reserve</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const statsData = stats ? [
        { label: 'Free', value: stats.total.free, key: 'free' },
        { label: 'Occupied', value: stats.total.occupied, key: 'occupied' },
        { label: 'Reserved', value: stats.total.reserved, key: 'reserved' },
    ] : [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.statsContainer}>
                    {loading ? (
                        <View style={{ flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.md }}>
                            <Skeleton width={110} height={80} />
                            <Skeleton width={110} height={80} />
                            <Skeleton width={110} height={80} />
                        </View>
                    ) : (
                        <FlatList
                            data={statsData}
                            renderItem={renderStatCard}
                            keyExtractor={(item) => item.key}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.statsContent}
                        />
                    )}
                </View>
                {loading ? (
                    <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
                        <Skeleton height={120} />
                    </View>
                ) : recommended && (
                    <TouchableOpacity
                        style={[styles.recommendedBanner, SHADOWS.card, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}
                        onPress={() => handleReserveSlot(recommended)}
                    >
                        <View style={styles.recommendedHeader}>
                            <MaterialCommunityIcons name="star" size={24} color={colors.primary} />
                            <Text style={[styles.recommendedTitle, { color: colors.text }]}>Recommended Slot</Text>
                        </View>
                        <View style={styles.recommendedContent}>
                            <Text style={[styles.recommendedSlot, { color: colors.text }]}>{recommended.label}</Text>
                            <View style={styles.recommendedDetails}>
                                <MaterialCommunityIcons
                                    name={getSlotIcon(recommended.type)}
                                    size={18}
                                    color={colors.textSecondary}
                                />
                                <Text style={[styles.recommendedType, { color: colors.textSecondary }]}>{recommended.type}</Text>
                            </View>
                        </View>
                        <View style={[styles.recommendedBadge, { backgroundColor: colors.free }]}>
                            <Text style={[styles.recommendedBadgeText, { color: '#FFFFFF' }]}>Tap to Reserve</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Parking Map</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{slots.length} slots</Text>
                </View>

                <View style={styles.gridContainer}>
                    {loading ? (
                        <>
                            <Skeleton width={CARD_WIDTH} height={110} style={{ marginBottom: SPACING.sm }} />
                            <Skeleton width={CARD_WIDTH} height={110} style={{ marginBottom: SPACING.sm }} />
                            <Skeleton width={CARD_WIDTH} height={110} style={{ marginBottom: SPACING.sm }} />
                            <Skeleton width={CARD_WIDTH} height={110} style={{ marginBottom: SPACING.sm }} />
                        </>
                    ) : (
                        slots.map((slot) => (
                            <View key={slot._id} style={styles.gridWrapper}>
                                {renderSlotGridItem({ item: slot })}
                            </View>
                        ))
                    )}
                </View>
                <View style={[styles.legend, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.legendTitle, { color: colors.text }]}>Map Legend</Text>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.free }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Free</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.occupied }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Occupied</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.reserved }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Reserved</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: TYPOGRAPHY.sizes.md,
    },
    statsContainer: {
        paddingVertical: SPACING.md,
    },
    statsContent: {
        paddingHorizontal: SPACING.md,
        gap: SPACING.md,
    },
    statCard: {
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        minWidth: 110,
        alignItems: 'center',
    },
    statValue: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.xs,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    recommendedBanner: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
        borderLeftWidth: 4,
    },
    recommendedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    recommendedTitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginLeft: SPACING.sm,
    },
    recommendedContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    recommendedSlot: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    recommendedDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    recommendedType: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    recommendedBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    recommendedBadgeText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    sectionHeader: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    sectionSubtitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SPACING.md,
        gap: GRID_SPACING,
    },
    gridWrapper: {
        width: CARD_WIDTH,
        marginBottom: SPACING.sm,
    },
    gridItem: {
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        height: 110,
        justifyContent: 'space-between',
    },
    gridHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    gridLabel: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    gridStatus: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    gridStatusText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    tapToReserve: {
        marginTop: SPACING.xs,
        alignItems: 'center',
    },
    tapToReserveText: {
        fontSize: 10,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    legend: {
        padding: SPACING.lg,
        marginHorizontal: SPACING.md,
        marginTop: SPACING.xl,
        borderRadius: BORDER_RADIUS.md,
    },
    legendTitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginBottom: SPACING.md,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
});

export default VisitorDashboardScreen;
