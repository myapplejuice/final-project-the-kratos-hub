import React from 'react';
import { View, Modal, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AppText from './app-text';
import { colors } from '../../common/settings/styling';
import FadeInOut from '../effects/fade-in-out';
import { scaleFont } from '../../common/utils/scale-fonts';
import AppImage from './app-image';
import { router } from 'expo-router';
import { routes } from '../../common/settings/constants';

const { width, height } = Dimensions.get('window');

export default function LikersModal({ visible, likers = [], onClose }) {
    function handleToUserPress(id) {
        router.push({
            pathname: routes.USER_PROFILE,
            params: {
                userId: id
            }
        });
    }

    return ( 
        <FadeInOut visible={visible} style={styles.overlay}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <AppText style={styles.headerText}>Liked by</AppText>
                    <TouchableOpacity onPress={onClose}>
                        <AppText style={styles.closeText}>✕</AppText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={likers}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleToUserPress(item.id)} style={styles.likerRow}>
                            <AppImage
                                source={{ uri: item.imageURL }}
                                style={styles.avatar}
                            />
                            <View style={{ flex: 1 }}>
                                <AppText style={styles.name}>
                                    {item.firstname} {item.lastname}
                                </AppText>
                                <AppText style={styles.subtext}>
                                    {item.gender === 'male' ? 'M' : 'F'}, {item.age}
                                </AppText>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <AppText style={styles.emptyText}>No likes</AppText>
                    }
                />
            </View>
        </FadeInOut>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    card: {
        width: width * 0.8,
        height: height * 0.5,
        backgroundColor: colors.cardBackground || '#1c1c1e',
        borderRadius: 20,
        padding: 15
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerText: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: colors.textPrimary || 'white',
    },
    closeText: {
        fontSize: scaleFont(16),
        color: 'white',
    },
    likerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,

    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.main,
    },
    name: {
        fontSize: scaleFont(15),
        color: 'white',
        fontWeight: '500',
    },
    subtext: {
        fontSize: scaleFont(12),
        color: '#aaa',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#aaa',
        marginTop: 40,
    },
});
