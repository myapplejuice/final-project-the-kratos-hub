import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ImageBackground } from 'expo-image';
import { colors } from '../../common/settings/styling';

export default function AppImageBackground({ source, style, resizeMode = 'cover', children, placeholderColor = colors.cardBackground }) {
    const [loading, setLoading] = useState(true);

    return (
        <View style={[styles.container, style]}>
            <ImageBackground
                source={source}
                style={[StyleSheet.absoluteFill, style]}
                contentFit={resizeMode}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => setLoading(false)}
            >
                {children}
            </ImageBackground>

            {loading && (
                <View style={[StyleSheet.absoluteFill, styles.placeholder, { backgroundColor: placeholderColor }]}>
                    <ActivityIndicator size="large" color={colors.main} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
