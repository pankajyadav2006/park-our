import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setIsDarkMode(savedTheme === 'dark');
            } else {
                setIsDarkMode(systemScheme === 'dark');
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        try {
            await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const theme = {
        colors: isDarkMode ? COLORS.dark : COLORS.light,
        isDarkMode,
        toggleTheme,
    };

    if (isLoading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
