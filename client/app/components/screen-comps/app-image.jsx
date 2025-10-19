import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../common/settings/styling';
import { Images } from '../../common/settings/assets';

export default function AppImage({ source, style, resizeMode = 'cover', placeholderColor = colors.cardBackground, useFallback = true, }) {
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

     function getValidSource(src) {
        if (useFallback && failed) return Images.missingImage;
        if (useFallback && !src) return Images.missingImage;
        if (typeof src === 'number') return src; // local asset
        if (src?.uri && src.uri.trim() !== '') return src; // valid URI
        if (useFallback) return Images.missingImage;
        return src; // if fallback is disabled, return original (even if invalid)
    }

    return (
        <View style={[styles.container, style]}>
            {loading && (
                <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
                    <ActivityIndicator size="large" color={colors.main} />
                </View>
            )}
            <Image
                source={getValidSource(source)}
                style={[StyleSheet.absoluteFill, style]}
                contentFit={resizeMode}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => setFailed(true)}
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
