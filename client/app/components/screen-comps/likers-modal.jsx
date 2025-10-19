import { View, FlatList, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import AppText from './app-text';
import { colors } from '../../common/settings/styling';
import FadeInOut from '../effects/fade-in-out';
import { scaleFont } from '../../common/utils/scale-fonts';
import AppImage from './app-image';
import { router } from 'expo-router';
import { routes } from '../../common/settings/constants';
import Divider from './divider';
import { useContext } from 'react';
import { UserContext } from '../../common/contexts/user-context';

const { width, height } = Dimensions.get('window');

export default function LikersModal({ visible, likers = [], onClose }) {
    const {user} = useContext(UserContext);
    function handleToUserPress(id) {
        if (id === user.id) return;
        
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

                <Divider orientation='horizontal' style={{ marginVertical: 15 }} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                >
                    {likers.length === 0 ? (
                        <AppText style={styles.emptyText}>No likes</AppText>
                    ) : (
                        likers.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handleToUserPress(item.id)}
                                style={styles.likerRow}
                            >
                                <AppImage source={{ uri: item.imageURL }} style={styles.avatar} />
                                <View style={{ flex: 1 }}>
                                    <AppText style={styles.name}>
                                        {item.id === user.id ? 'You' : item.firstname + ' ' + item.lastname}
                                    </AppText>
                                   {user.id !== item.id &&
                                     <AppText style={styles.subtext}>
                                        {item.gender === 'male' ? 'M' : 'F'}, {item.age}
                                    </AppText>
                                    }
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
        </FadeInOut>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    },
    headerText: {
        fontSize: scaleFont(16),
        fontWeight: '600',
        color: 'white',
    },
    closeText: {
        fontSize: scaleFont(16),
        color: 'white',
    },
    likerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        marginBottom: 15
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
