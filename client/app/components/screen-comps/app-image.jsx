import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../common/settings/styling';

export default function AppImage({ source, style, resizeMode = 'cover', placeholderColor = colors.cardBackground }) {
    const [loading, setLoading] = useState(true);

    return (
        <View style={[styles.container, style]}>
            {loading && (
                <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
                    <ActivityIndicator size="large" color={colors.main} />
                </View>
            )}
            <Image
                source={source}
                style={[StyleSheet.absoluteFill, style]}
                contentFit={resizeMode}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
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
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
