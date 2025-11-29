import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../styles/theme';

const Header = ({
    title,
    subtitle,
    showLogout,
    onLogout,
    showBack,
    onBack,
    showThemeToggle
}) => {
    const { colors, isDarkMode, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.header,
            {
                backgroundColor: colors.background,
                paddingTop: insets.top + SPACING.sm, 
            }
        ]}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
                <View>
                    {title && (
                        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    )}
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                    )}
                </View>
            </View>

            <View style={styles.rightContainer}>
                {showThemeToggle && (
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: colors.surface }]}
                        onPress={toggleTheme}
                    >
                        <MaterialCommunityIcons
                            name={isDarkMode ? "weather-sunny" : "weather-night"}
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}

                {showLogout && (
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: colors.surface }]}
                        onPress={onLogout}
                    >
                        <MaterialCommunityIcons name="logout" size={24} color={colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    backButton: {
        padding: SPACING.xs,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
    },
    rightContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    iconButton: {
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
    },
});

export default Header;
