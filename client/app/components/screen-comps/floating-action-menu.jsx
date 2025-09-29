import React, { useState, useRef, useEffect, useContext } from "react";
import { Animated, TouchableOpacity, StyleSheet, View } from "react-native";
import { Images } from "../../common/settings/assets";
import { Image } from "expo-image";
import { scaleFont } from "../../common/utils/scale-fonts";
import { NavBarContext } from "../../common/contexts/nav-bar-context";

export default function FloatingActionMenu({
    actions = [], // array of { title, onPress, icon }
    mainButtonIcon = Images.plus,
    mainButtonSize = 60,
    buttonStyle = {},
    mainButtonStyle = {},
    overlayColor = "rgba(0,0,0,0.5)",
    position = { bottom: 150, right: 20 },
    visible = true,
    syncWithNavBar = false,
}) {
    const { navBarVisibility } = useContext(NavBarContext);
    const [open, setOpen] = useState(false);

    // animations
    const rotation = useRef(new Animated.Value(0)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const buttonsTranslate = useRef(new Animated.Value(60)).current;
    const visibility = useRef(new Animated.Value(syncWithNavBar ? navBarVisibility ? 1 : 0 : 1)).current;
    const targetVisibility = visible && (!syncWithNavBar || navBarVisibility);
const pointerEventsValue = targetVisibility ? "box-none" : "none";

    // open/close animation
    useEffect(() => {
        Animated.timing(rotation, {
            toValue: open ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        Animated.timing(overlayOpacity, {
            toValue: open ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        Animated.timing(buttonsTranslate, {
            toValue: open ? 1 : 0, // 1 = spread open, 0 = collapsed
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [open]);

    useEffect(() => {
        Animated.timing(visibility, {
            toValue: targetVisibility ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible, navBarVisibility]);


    const rotateInterpolate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "45deg"],
    });

    return (
        <>
            {/* Overlay */}
            {open && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {
                            backgroundColor: overlayColor,
                            opacity: overlayOpacity,
                            zIndex: 9998,
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => setOpen(false)}
                    />
                </Animated.View>
            )}

            {/* Buttons */}
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        zIndex: 9999,
                        opacity: visibility,
                        alignItems: 'flex-end',
                    },
                    position,
                ]}
                pointerEvents={pointerEventsValue}
            >
                {actions.map((action, index) => {
                    const reverseIndex = actions.length - 1 - index; // reverse order
                    return (
                        <Animated.View
                            key={index}
                            style={[{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                transform: [
                                    {
                                        translateY: buttonsTranslate.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [(reverseIndex * 60) + 60, 0], // 60 first, 120 next, and next 180
                                            // -60, -120 ... when open
                                            // 0 when closed → collapse down
                                        }),
                                    },
                                ],
                                opacity: overlayOpacity.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                }),
                                marginBottom: 10,
                            }, !open && { pointerEvents: 'none' }]}
                        >
                            <TouchableOpacity
                                style={[styles.actionButton, buttonStyle]}
                                onPress={() => {
                                    if (action.closeOnAction)
                                        setTimeout(() => { setOpen(false); }, action.delayClosure ? 300 : 0);
                                    action.onPress && action.onPress();
                                }}
                            >
                                {action.title && (
                                    <Animated.View style={[styles.titleContainer]}>
                                        <Animated.Text style={styles.titleText}>{action.title}</Animated.Text>
                                    </Animated.View>
                                )}
                                <Image
                                    source={action.icon}
                                    style={{ width: 20, height: 20, tintColor: "white" }}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    )
                })}
                <TouchableOpacity
                    onPress={() => setOpen((prev) => !prev)}
                    style={[
                        styles.mainButton,
                        {
                            width: mainButtonSize,
                            height: mainButtonSize,
                            borderRadius: mainButtonSize / 2,
                        },
                        mainButtonStyle,
                    ]}
                >
                    <Animated.Image
                        source={mainButtonIcon}
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: "white",
                            transform: [{ rotate: rotateInterpolate }],
                        }}
                    />
                </TouchableOpacity>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    mainButton: {
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
    },
    actionButton: {
        backgroundColor: "#007AFF",
        padding: 14,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: 'row'
    },
    titleContainer: {
        marginRight: 8,
    },
    titleText: {
        color: "white",
        fontSize: scaleFont(16),
        fontWeight: "500",
    },
});
