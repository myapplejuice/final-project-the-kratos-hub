import { useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function SideBar({ visible, onClose, children }) {
    const translateX = useRef(new Animated.Value(-width)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            Animated.timing(translateX, {
                toValue: 0,
                duration: 8000,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateX, {
                toValue: -width,
                duration: 8000,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity style={styles.overlay} onPress={onClose} />
            <Animated.View
                style={[
                    styles.sidebar,
                    {
                        transform: [{ translateX }],
                        paddingBottom: insets.bottom, 
                    },
                ]}
            >
                <View style={styles.content}>{children}</View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        zIndex: 8000,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sidebar: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: width * 0.7,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    content: {
        flex: 1,
    },
});