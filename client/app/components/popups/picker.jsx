import React, { useRef, useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Platform,
} from "react-native";
import AppText from "../screen-comps/app-text";
import { scaleFont } from "../../common/utils/scale-fonts";
import { colors } from "../../common/settings/styling";
import AnimatedButton from "../screen-comps/animated-button";

const ITEM_HEIGHT = 50;

export default function Picker({
    title = "Select Number",
    min = 0,
    max = 100,
    initialValue = 25,
    onSubmit = (value) => {},
    onCancel = () => {},
}) {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;
    const scrollRef = useRef();
    const [selectedValue, setSelectedValue] = useState(initialValue);
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const lastOffsetY = useRef(0);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            const index = numbers.indexOf(initialValue);
            scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
        });
    }, []);

    const handleScrollEnd = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const value = numbers[index];
        setSelectedValue(value);
        scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    };

    return (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[styles.box, { transform: [{ translateY }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <AppText style={styles.title}>{title}</AppText>
                        <View style={styles.titleLine} />
                    </View>
                </View>

                {/* Number Picker */}
                <View style={styles.pickerArea}>
                    <ScrollView
                        ref={scrollRef}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        onMomentumScrollEnd={handleScrollEnd}
                        contentContainerStyle={{
                            paddingTop: ITEM_HEIGHT,
                            paddingBottom: ITEM_HEIGHT,
                        }}
                        style={{ flex: 1 }}
                    >
                        {numbers.map((num, i) => (
                            <View key={i} style={styles.item}>
                                <AppText
                                    style={
                                        num === selectedValue
                                            ? styles.selectedText
                                            : styles.text
                                    }
                                >
                                    {String(num)}
                                </AppText>
                            </View>
                        ))}
                    </ScrollView>
                    <View pointerEvents="none" style={styles.selectionOverlay} />
                </View>

                {/* Footer Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.buttonContainer, styles.cancelButton]}
                        onPress={onCancel}
                    >
                        <AppText style={[styles.buttonText, styles.cancelButtonText]}>
                            Cancel
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttonContainer, styles.confirmButton]}
                        onPress={() => onSubmit(selectedValue)}
                    >
                        <AppText style={[styles.buttonText, styles.confirmButtonText]}>
                            Select
                        </AppText>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    box: {
        backgroundColor: colors.cardBackground,
        width: "85%",
        maxWidth: 350,
        borderRadius: 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    header: {
        paddingHorizontal: 18,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    titleContainer: {
        marginBottom: 8,
    },
    title: {
        color: "white",
        fontWeight: "700",
        fontSize: scaleFont(20),
        marginBottom: 6,
    },
    titleLine: {
        width: 40,
        height: 3,
        backgroundColor: colors.main,
        borderRadius: 2,
    },
    pickerArea: {
        height: ITEM_HEIGHT * 3,
        overflow: "hidden",
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    text: {
        fontSize: scaleFont(16),
        color: colors.mutedText,
    },
    selectedText: {
        fontSize: scaleFont(20),
        fontWeight: "700",
        color: colors.main,
    },
    selectionOverlay: {
        position: "absolute",
        top: ITEM_HEIGHT,
        height: ITEM_HEIGHT,
        width: "100%",
        borderTopColor: colors.main,
        borderBottomColor: colors.main,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
    },
    buttonContainer: {
        alignItems: "center",
        borderRadius: 15,
        minHeight: 50,
        width: "48%",
        justifyContent: "center",
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        backgroundColor: "rgba(26,26,26,1)",
    },
    confirmButton: {
        backgroundColor: colors.main,
        borderWidth: 1,
        borderColor: colors.main,
    },
    buttonText: {
        fontSize: scaleFont(15),
        textAlign: "center",
    },
    cancelButtonText: {
        color: colors.mutedText,
    },
    confirmButtonText: {
        color: "white",
    },
});
