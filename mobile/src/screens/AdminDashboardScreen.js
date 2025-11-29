import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Modal,
    FlatList,
    Alert,
    RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import SlotListItem from '../components/SlotListItem';
import Skeleton from '../components/Skeleton';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../styles/theme';

const AdminDashboardScreen = () => {
    const [slots, setSlots] = useState([]);
    const [stats, setStats] = useState(null);
    const [utilization, setUtilization] = useState(null);
    const [label, setLabel] = useState('');
    const [type, setType] = useState('Two-wheeler');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showStateModal, setShowStateModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [logs, setLogs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [slotsRes, statsRes, utilizationRes] = await Promise.all([
                api.get('/admin/slots'),
                api.get('/visitor/stats'),
                api.get('/analytics/utilization'),
            ]);
            setSlots(slotsRes.data);
            setStats(statsRes.data);
            setUtilization(utilizationRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleCreateSlot = async () => {
        if (!label.trim()) {
            Alert.alert('Error', 'Please enter a slot label');
            return;
        }

        try {
            await api.post('/admin/slots', { label: label.trim(), type });
            setLabel('');
            setType('Two-wheeler');
            fetchData();
            Alert.alert('Success', 'Slot created successfully');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create slot');
        }
    };

    const handleUpdateState = async (newState) => {
        try {
            await api.put(`/admin/slots/${selectedSlot._id}`, { state: newState });
            setShowStateModal(false);
            setSelectedSlot(null);
            fetchData();
            Alert.alert('Success', 'Slot updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update slot');
        }
    };

    const handleViewLogs = async (slot) => {
        try {
            const response = await api.get(`/admin/slots/${slot._id}/logs`);
            setLogs(response.data);
            setSelectedSlot(slot);
            setShowLogsModal(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to load logs');
        }
    };

    const handleDeleteSlot = (slot) => {
        Alert.alert(
            'Delete Slot',
            `Are you sure you want to delete slot ${slot.label}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/slots/${slot._id}`);
                            fetchData();
                            Alert.alert('Success', 'Slot deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete slot');
                        }
                    },
                },
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

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60);

        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff} min ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
        return date.toLocaleDateString();
    };

    const statsData = stats ? [
        { label: 'Total', value: stats.total.free + stats.total.occupied + stats.total.reserved, key: 'total', color: colors.primary },
        { label: 'Free', value: stats.total.free, key: 'free', color: colors.free },
        { label: 'Occupied', value: stats.total.occupied, key: 'occupied', color: colors.occupied },
        { label: 'Reserved', value: stats.total.reserved, key: 'reserved', color: colors.reserved },
    ] : [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Utilization Card */}
                {loading ? (
                    <View style={{ padding: SPACING.md }}>
                        <Skeleton height={120} />
                    </View>
                ) : utilization && (
                    <View style={[styles.utilizationCard, SHADOWS.card, { backgroundColor: colors.card }]}>
                        <View style={styles.utilizationHeader}>
                            <Ionicons name="analytics" size={24} color={colors.primary} />
                            <Text style={[styles.utilizationTitle, { color: colors.text }]}>Today's Utilization</Text>
                        </View>
                        <Text style={[styles.utilizationValue, { color: colors.primary }]}>
                            {(utilization.utilization || 0).toFixed(1)}%
                        </Text>
                        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${utilization.utilization || 0}%`,
                                        backgroundColor: (utilization.utilization || 0) > 80 ? colors.error :
                                            (utilization.utilization || 0) > 50 ? colors.warning : colors.success
                                    }
                                ]}
                            />
                        </View>
                    </View>
                )}
                <View style={styles.statsContainer}>
                    {loading ? (
                        <View style={{ flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.md }}>
                            <Skeleton width={100} height={80} />
                            <Skeleton width={100} height={80} />
                            <Skeleton width={100} height={80} />
                        </View>
                    ) : (
                        <FlatList
                            data={statsData}
                            renderItem={({ item }) => (
                                <View style={[styles.statCard, SHADOWS.card, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                                </View>
                            )}
                            keyExtractor={(item) => item.key}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.statsContent}
                        />
                    )}
                </View>
                <View style={[styles.formCard, SHADOWS.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.formTitle, { color: colors.text }]}>Add New Slot</Text>

                    <View style={styles.formRow}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Slot Label</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                                placeholder="e.g., A1, B2"
                                placeholderTextColor={colors.textSecondary}
                                value={label}
                                onChangeText={setLabel}
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Type</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        { backgroundColor: colors.surface },
                                        type === 'Two-wheeler' && { backgroundColor: colors.primary },
                                    ]}
                                    onPress={() => setType('Two-wheeler')}
                                >
                                    <MaterialCommunityIcons
                                        name="motorbike"
                                        size={20}
                                        color={type === 'Two-wheeler' ? '#FFFFFF' : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.typeButtonText,
                                        { color: colors.textSecondary },
                                        type === 'Two-wheeler' && { color: '#FFFFFF' },
                                    ]}>2W</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        { backgroundColor: colors.surface },
                                        type === 'Four-wheeler' && { backgroundColor: colors.primary },
                                    ]}
                                    onPress={() => setType('Four-wheeler')}
                                >
                                    <MaterialCommunityIcons
                                        name="car"
                                        size={20}
                                        color={type === 'Four-wheeler' ? '#FFFFFF' : colors.textSecondary}
                                    />
                                    <Text style={[
                                        styles.typeButtonText,
                                        { color: colors.textSecondary },
                                        type === 'Four-wheeler' && { color: '#FFFFFF' },
                                    ]}>4W</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleCreateSlot}>
                        <MaterialCommunityIcons name="plus-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Add Slot</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Slots</Text>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{slots.length} slots</Text>
                </View>

                <View style={styles.slotsContainer}>
                    {loading ? (
                        <>
                            <Skeleton height={100} style={{ marginBottom: SPACING.md }} />
                            <Skeleton height={100} style={{ marginBottom: SPACING.md }} />
                            <Skeleton height={100} style={{ marginBottom: SPACING.md }} />
                        </>
                    ) : (
                        slots.map((slot) => (
                            <View key={slot._id} style={{ marginBottom: SPACING.md }}>
                                <SlotListItem
                                    slot={slot}
                                    onAction={() => {
                                        setSelectedSlot(slot);
                                        setShowStateModal(true);
                                    }}
                                    actionIcon="swap-horizontal"
                                    actionLabel="Change State"
                                />
                                <View style={styles.slotActionsOverlay}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: colors.surface }]}
                                        onPress={() => handleViewLogs(slot)}
                                    >
                                        <MaterialCommunityIcons name="history" size={18} color={colors.info} />
                                        <Text style={[styles.actionButtonText, { color: colors.text }]}>Logs</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: colors.surface }]}
                                        onPress={() => handleDeleteSlot(slot)}
                                    >
                                        <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
                                        <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
            <Modal
                visible={showStateModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Change Slot State</Text>
                            <TouchableOpacity onPress={() => setShowStateModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedSlot && (
                            <>
                                <Text style={[styles.modalSlotLabel, { color: colors.text }]}>Slot {selectedSlot.label}</Text>
                                <Text style={[styles.modalSlotType, { color: colors.textSecondary }]}>{selectedSlot.type}</Text>
                                <Text style={[styles.modalCurrentState, { color: colors.text }]}>
                                    Current: <Text style={{ color: getSlotColor(selectedSlot.state) }}>{selectedSlot.state}</Text>
                                </Text>

                                <View style={styles.stateButtons}>
                                    <TouchableOpacity
                                        style={[styles.stateButton, { backgroundColor: colors.free }]}
                                        onPress={() => handleUpdateState('Free')}
                                    >
                                        <Text style={styles.stateButtonText}>Set Free</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.stateButton, { backgroundColor: colors.occupied }]}
                                        onPress={() => handleUpdateState('Occupied')}
                                    >
                                        <Text style={styles.stateButtonText}>Set Occupied</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.stateButton, { backgroundColor: colors.reserved }]}
                                        onPress={() => handleUpdateState('Reserved')}
                                    >
                                        <Text style={styles.stateButtonText}>Set Reserved</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showLogsModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLogsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Change Logs</Text>
                            <TouchableOpacity onPress={() => setShowLogsModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedSlot && (
                            <Text style={[styles.modalSlotLabel, { color: colors.text }]}>Slot {selectedSlot.label}</Text>
                        )}

                        <ScrollView style={styles.logsScroll}>
                            {logs.length === 0 ? (
                                <Text style={[styles.noLogsText, { color: colors.textSecondary }]}>No logs available</Text>
                            ) : (
                                logs.map((log, index) => (
                                    <View key={index} style={[styles.logItem, { backgroundColor: colors.surface }]}>
                                        <View style={styles.logHeader}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                                            <Text style={[styles.logTime, { color: colors.textSecondary }]}>{formatTime(log.timestamp)}</Text>
                                        </View>
                                        <Text style={[styles.logChange, { color: colors.text }]}>
                                            {log.previousState || 'Created'} → {log.newState}
                                        </Text>
                                        <Text style={[styles.logUser, { color: colors.textSecondary }]}>by {log.changedBy}</Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    utilizationCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        margin: SPACING.md,
    },
    utilizationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    utilizationTitle: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginLeft: SPACING.sm,
    },
    utilizationValue: {
        fontSize: TYPOGRAPHY.sizes.xxl * 1.5,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.md,
    },
    progressBar: {
        height: 8,
        borderRadius: BORDER_RADIUS.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: BORDER_RADIUS.full,
    },
    statsContainer: {
        paddingVertical: SPACING.sm,
    },
    statsContent: {
        paddingHorizontal: SPACING.md,
        gap: SPACING.md,
    },
    statCard: {
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        minWidth: 90,
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
    formCard: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        margin: SPACING.md,
    },
    formTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.md,
    },
    formRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    inputContainer: {
        flex: 1,
    },
    inputLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
        marginBottom: SPACING.xs,
    },
    input: {
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        fontSize: TYPOGRAPHY.sizes.md,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
    },
    typeButtonText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    addButton: {
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    addButtonText: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: '#FFFFFF',
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
    slotsContainer: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    slotActionsOverlay: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.sm,
        marginTop: -SPACING.lg,
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
    },
    actionButtonText: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    modalSlotLabel: {
        fontSize: TYPOGRAPHY.sizes.xxl,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.xs,
    },
    modalSlotType: {
        fontSize: TYPOGRAPHY.sizes.md,
        marginBottom: SPACING.md,
    },
    modalCurrentState: {
        fontSize: TYPOGRAPHY.sizes.md,
        marginBottom: SPACING.lg,
    },
    stateButtons: {
        gap: SPACING.md,
    },
    stateButton: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    stateButtonText: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: '#FFFFFF',
    },
    logsScroll: {
        maxHeight: 400,
    },
    noLogsText: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.sizes.md,
        paddingVertical: SPACING.xl,
    },
    logItem: {
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    logTime: {
        fontSize: TYPOGRAPHY.sizes.xs,
    },
    logChange: {
        fontSize: TYPOGRAPHY.sizes.md,
        fontWeight: TYPOGRAPHY.weights.semibold,
        marginBottom: SPACING.xs,
    },
    logUser: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
});

export default AdminDashboardScreen;
