import React, { use, useContext, useState } from 'react';
import { View, TouchableOpacity, Image, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AppText from './app-text';
import { scaleFont } from '../../common/utils/scale-fonts';
import { Images } from '../../common/settings/assets';
import { colors } from '../../common/settings/styling';
import { formatDate, formatTime, getDayComparisons, getDayComparisonsSafe } from '../../common/utils/date-time';
import { UserContext } from '../../common/contexts/user-context';
import { routes } from '../../common/settings/constants';
import ProgressDots from './progress-dots';
import AppImageBackground from './app-image-background';
import LikersModal from './likers-modal';
import usePopups from '../../common/hooks/use-popups';
import APIService from '../../common/services/api-service';

export default function CommunityPost({
    post, isLikedByUser = false, isSavedByUser = false, isUserPost = false,
    onDeletePress = () => { }, onEditPress = () => { }, onLikePress = () => { },
    onSharePress = () => { }, onImagePress = () => { }, onSavePress = () => { }
}) {
    const { hideSpinner, showSpinner, createToast } = usePopups();
    const { width, height } = Dimensions.get('window');
    const { user } = useContext(UserContext);
    const router = useRouter();
    const { postUser, imagesURLS, caption, likeCount, shareCount, topic, dateOfCreation } = post;
    const [currentImage, setCurrentImage] = useState(0);
    const [likers, setLikers] = useState([]);
    const [likersVisible, setLikersVisible] = useState(false);

    const dateTimeComparisons = getDayComparisonsSafe(dateOfCreation);
    const isToday = dateTimeComparisons.isToday;
    const isYesterday = dateTimeComparisons.isYesterday;
    const isPast = dateTimeComparisons.isPast;

    const day = isPast ? isYesterday ? 'Yesterday' : formatDate(dateOfCreation, { format: 'DD MMM' }) : '';
    const time = (isToday || isYesterday) ? formatTime(dateOfCreation, { format: user.preferences.timeFormat.key }) : '';
    const timeDisplay = `${day} ${time}`.trim();

    function handleUserPress() {
        if (postUser.id === user.id) {
            router.push(routes.PROFILE);
            return;
        }
        router.push({
            pathname: routes.USER_PROFILE,
            params: {
                userId: postUser.id
            }
        });
    }

    async function handleFetchLikers() {
        try {
            showSpinner();
            const result = await APIService.community.likers({ postId: post.id });

            if (result.success) {
                const likers = result.data.likers;
                setLikers(likers);
                setLikersVisible(true);
            }else {
                createToast({ message: result.message });
            }
        } catch (err) {
            console.error("Failed to fetch likers:", err);
        } finally {
            hideSpinner();
        }
    }

    return (
        <>
            <LikersModal visible={likersVisible} likers={likers} onClose={() => setLikersVisible(false)} />

            <View style={{
                marginBottom: 25,
                backgroundColor: 'rgba(30, 30, 30, 0.7)',
                borderRadius: 15,
                overflow: 'hidden',
                marginHorizontal: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
            }}>
                {/* HEADER */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 16,
                    alignItems: 'center',
                    borderBottomWidth: 0.5,
                    borderBottomColor: 'rgba(255,255,255,0.1)'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1, alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={handleUserPress}>
                                <Image
                                    source={{ uri: postUser.imageURL }}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        backgroundColor: colors.cardBackground,
                                        borderWidth: 2,
                                        borderColor: 'rgba(255,255,255,0.1)'
                                    }}
                                />
                            </TouchableOpacity>
                            <View style={{ justifyContent: 'center', marginStart: 12, flex: 1 }}>
                                {/* Name + Status */}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={handleUserPress}>
                                        <AppText style={{
                                            color: 'white',
                                            fontWeight: '700',
                                            fontSize: scaleFont(14),
                                        }}>
                                            {postUser.firstname} {postUser.lastname}
                                        </AppText>
                                    </TouchableOpacity>

                                    {postUser.trainerProfile?.trainerStatus === 'active' && (
                                        <TouchableOpacity
                                            onPress={() => router.push(routes.PERSONAL_TRAINING_EXPLANATION)}
                                            style={{
                                                height: 14,
                                                width: 14,
                                                borderRadius: 10,
                                                backgroundColor: colors.main,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginStart: 6,
                                            }}>
                                            <Image
                                                source={Images.personalTrainer}
                                                style={{ width: 10, height: 10, tintColor: 'white' }}
                                            />
                                        </TouchableOpacity>
                                    )}

                                    {postUser.trainerProfile?.isVerified && (
                                        <TouchableOpacity
                                            onPress={() => router.push(routes.SHIELD_OF_TRUST)}
                                            style={{ justifyContent: 'center', alignItems: 'center', marginStart: 6 }}>
                                            <Image
                                                source={Images.shieldFour}
                                                style={{
                                                    width: 17,
                                                    height: 17,
                                                }}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <AppText
                                        style={{
                                            color: colors.mutedText,
                                            fontWeight: '500',
                                            fontSize: scaleFont(11),
                                        }}>
                                        {timeDisplay}  {topic !== 'None' ? `•  ${topic}` : ''}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {isUserPost && (
                        <>
                            <TouchableOpacity
                                onPress={onDeletePress}
                                style={{
                                    padding: 8,
                                    borderRadius: 10,
                                    backgroundColor: colors.backgroundTop,
                                    marginEnd: 10
                                }}
                            >
                                <Image
                                    source={Images.trash}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        tintColor: colors.negativeRed
                                    }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onEditPress}
                                style={{
                                    padding: 8,
                                    borderRadius: 10,
                                    backgroundColor: colors.backgroundTop
                                }}
                            >
                                <Image
                                    source={Images.edit}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        tintColor: 'white'
                                    }}
                                />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {!!caption && (
                    <View style={{
                        paddingHorizontal: 16,
                        marginVertical: 12,
                        paddingBottom: imagesURLS?.length > 0 ? 8 : 0
                    }}>
                        <AppText style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: scaleFont(14),
                            lineHeight: 20
                        }}>
                            {caption}
                        </AppText>
                    </View>
                )}

                {/* IMAGE SECTION */}
                {imagesURLS && imagesURLS.length > 0 && (
                    <View style={{ position: 'relative' }}>
                        <AppImageBackground
                            source={{ uri: imagesURLS[currentImage] }}
                            style={{
                                height: 320,
                                width: '100%',
                            }}
                            resizeMode="contain"
                        >
                            {imagesURLS.length > 1 && (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setCurrentImage((prev) => (prev === 0 ? imagesURLS.length - 1 : prev - 1))}
                                        style={{
                                            position: 'absolute',
                                            left: 12,
                                            top: '50%',
                                            transform: [{ translateY: -25 }],
                                            height: 44,
                                            width: 44,
                                            borderRadius: 22,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                        }}>
                                        <Image
                                            source={Images.arrow}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                marginEnd: 2,
                                                tintColor: 'white',
                                                transform: [{ rotate: '180deg' }],
                                            }}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setCurrentImage((prev) => (prev === imagesURLS.length - 1 ? 0 : prev + 1))}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: [{ translateY: -25 }],
                                            height: 44,
                                            width: 44,
                                            borderRadius: 22,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                        }}>
                                        <Image
                                            source={Images.arrow}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                marginStart: 2,
                                                tintColor: 'white'
                                            }}
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                        </AppImageBackground>

                        {imagesURLS.length > 1 && (
                            <View style={{
                                position: 'absolute',
                                bottom: 12,
                                left: 0,
                                right: 0,
                                alignItems: 'center'
                            }}>
                                <ProgressDots
                                    steps={Array.from(imagesURLS, (_, i) => i === currentImage)}
                                    activeColor={colors.main}
                                    inactiveColor="rgba(255,255,255,0.4)"
                                    containerStyle={{ marginVertical: 0 }}
                                    dotSize={6}
                                />
                            </View>
                        )}
                    </View>
                )}

                {/* ACTION BAR */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderTopWidth: 0.5,
                    borderTopColor: 'rgba(255,255,255,0.1)'
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {!isUserPost && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                <TouchableOpacity
                                    onPress={onLikePress}
                                    style={{
                                        padding: 8,
                                    }}
                                >
                                    <Image
                                        source={isLikedByUser ? Images.like : Images.likeOutline}
                                        style={{
                                            width: 22,
                                            height: 22,
                                            tintColor: colors.mutedText
                                        }}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onSharePress}
                                    style={{
                                        padding: 8,
                                        marginEnd: 5
                                    }}
                                >
                                    <Image
                                        source={Images.shareOutline}
                                        style={{
                                            width: 22,
                                            height: 22,
                                            tintColor: colors.mutedText
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ alignItems: 'flex-start', flexDirection: isUserPost ? 'row' : 'column' }}>
                            <TouchableOpacity onPress={handleFetchLikers}>
                                <AppText style={{
                                    color: colors.mutedText,
                                    fontSize: scaleFont(11),
                                    fontWeight: '500'
                                }}>{likeCount} Likes</AppText>
                            </TouchableOpacity>
                            {
                                isUserPost && (
                                    <AppText style={{
                                        color: colors.mutedText,
                                        fontSize: scaleFont(11),
                                        fontWeight: '500',
                                        marginHorizontal: 5
                                    }}>
                                        •
                                    </AppText>
                                )
                            }
                            <AppText style={{
                                color: colors.mutedText,
                                fontSize: scaleFont(11),
                                fontWeight: '500'
                            }}>
                                {shareCount} Shares
                            </AppText>
                        </View>
                    </View>

                    {!isUserPost && (
                        <TouchableOpacity
                            onPress={onSavePress}
                            style={{
                                padding: 8,
                            }}
                        >
                            <Image
                                source={isSavedByUser ? Images.bookmark : Images.bookmarkOutline}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: colors.mutedText
                                }}
                            />
                        </TouchableOpacity>
                    )}

                </View>
            </View>
        </>
    );
};