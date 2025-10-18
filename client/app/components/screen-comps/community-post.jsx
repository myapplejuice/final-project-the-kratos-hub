import React from 'react';
import { View, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import AppText from './app-text';
import { scaleFont } from '../../common/utils/scale-fonts';
import { Images } from '../../common/settings/assets';
import { colors } from '../../common/settings/styling'; 

export default function CommunityPost({ post }) {
    const router = useRouter();
    const { user, imageURL, caption, likes, shares, type, time } = post;

    return (
        <View style={{ marginBottom: 25 }}>
            {/* HEADER */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginStart: 15, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => router.push(`${routes.USER_PROFILE}/${user.id}`)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={{ uri: user.imageURL }}
                            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBackground }}
                        />
                        <View style={{ justifyContent: 'center', marginStart: 15 }}>
                            {/* Name + Status */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <AppText style={{ color: 'white', fontWeight: 'bold' }}>
                                    {user.firstname} {user.lastname}
                                </AppText>

                                {user.trainerProfile?.trainerStatus === 'active' && !user.trainerProfile?.isVerified && (
                                    <TouchableOpacity
                                        onPress={() => router.push(routes.PERSONAL_TRAINING_EXPLANATION)}
                                        style={{
                                            height: 20,
                                            width: 20,
                                            borderRadius: 10,
                                            backgroundColor: colors.main,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginStart: 5,
                                        }}>
                                        <Image
                                            source={Images.personalTrainer}
                                            style={{ width: 12, height: 12, tintColor: 'white' }}
                                        />
                                    </TouchableOpacity>
                                )}

                                {user.trainerProfile?.isVerified && (
                                    <TouchableOpacity
                                        onPress={() => router.push(routes.SHIELD_OF_TRUST)}
                                        style={{ justifyContent: 'center', alignItems: 'center', marginStart: 5 }}>
                                        <Image source={Images.shieldFour} style={{ width: 15, height: 15 }} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <AppText
                                    style={{
                                        color: colors.mutedText,
                                        fontWeight: 'bold',
                                        fontSize: scaleFont(9),
                                    }}>
                                    {time}  •  {type}
                                </AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => console.log('options')} style={{ padding: 15 }}>
                    <Image source={Images.options} style={{ width: 20, height: 20, tintColor: 'white' }} />
                </TouchableOpacity>
            </View>

            {/* IMAGE SECTION */}
            {imageURL && (
                <ImageBackground
                    source={{ uri: imageURL }}
                    style={{
                        backgroundColor: colors.cardBackground,
                        height: 300,
                        width: '100%',
                        marginTop: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                    resizeMode="contain"
                >
                    <TouchableOpacity
                        style={{
                            height: 50,
                            width: 50,
                            borderRadius: 25,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            marginStart: 15,
                        }}>
                        <Image
                            source={Images.arrow}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: 'white',
                                transform: [{ rotate: '180deg' }],
                            }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            height: 50,
                            width: 50,
                            borderRadius: 25,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            marginEnd: 15,
                        }}>
                        <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} />
                    </TouchableOpacity>
                </ImageBackground>
            )}

            {/* ACTION BAR */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={{ paddingStart: 15, paddingEnd: 5, paddingVertical: 15 }}>
                        <Image source={Images.likeOutline} style={{ width: 23, height: 23, tintColor: 'white' }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{ paddingHorizontal: 5, paddingVertical: 15 }}>
                        <Image source={Images.shareOutline} style={{ width: 23, height: 23, tintColor: 'white' }} />
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center', justifyContent: 'center', marginStart: 15 }}>
                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(9) }}>{likes} Likes</AppText>
                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(9) }}>{shares} Shares</AppText>
                    </View>
                </View>

                <TouchableOpacity style={{ padding: 15 }}>
                    <Image source={Images.bookmarkOutline} style={{ width: 23, height: 23, tintColor: 'white' }} />
                </TouchableOpacity>
            </View>

            {/* CAPTION */}
            {!!caption && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppText style={{ marginHorizontal: 15 }}>
                        <AppText style={{ color: 'white', fontWeight: 'bold' }}>{caption}</AppText>
                    </AppText>
                </View>
            )}
        </View>
    );
};