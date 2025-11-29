import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../styles/theme';

const SlotListItem = ({ slot, onPress, onAction, actionIcon, actionLabel, actionColor }) => {
    const { colors } = useTheme();

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

    return (
        <View style={[
            styles.container,
            SHADOWS.sm,
            {
                backgroundColor: colors.card,
                borderLeftColor: getSlotColor(slot.state)
            }
        ]}>
            <View style={styles.header}>
                <View style={styles.labelRow}>
                    <MaterialCommunityIcons
                        name={getSlotIcon(slot.type)}
                        size={20}
                        color={colors.textSecondary}
                    />
                    <Text style={[styles.label, { color: colors.text }]}>{slot.label}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getSlotColor(slot.state) }]}>
                    <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{slot.state}</Text>
                </View>
            </View>

            <Text style={[styles.type, { color: colors.textSecondary }]}>{slot.type}</Text>

            {onAction && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.surface }]}
                        onPress={() => onAction(slot)}
                    >
                        <MaterialCommunityIcons name={actionIcon} size={18} color={actionColor || colors.primary} />
                        <Text style={[styles.actionText, { color: colors.text }]}>{actionLabel}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    label: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    statusBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    type: {
        fontSize: TYPOGRAPHY.sizes.sm,
        marginBottom: SPACING.md,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
    },
    actionText: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
});

export default SlotListItem;
