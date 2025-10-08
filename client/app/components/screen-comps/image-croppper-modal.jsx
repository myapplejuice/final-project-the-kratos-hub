import React, { useEffect, useState } from "react";
import { View, Modal, Image, StyleSheet, Button, Dimensions, SafeAreaView } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

export default function ImageCropperModal({ visible, imageUri, onConfirm, onCancel }) {
    const [image, setImage] = useState(imageUri);

    useEffect(() => {
        setImage(imageUri);
    }, [imageUri]);

    async function cropImage() {
        if (!image) return;

        const { width, height } = Dimensions.get("window");
        const size = Math.min(width, height) - 40; // 20px padding top/bottom
        const cropRegion = {
            originX: 0,
            originY: 0,
            width: size,
            height: size,
        };

        const manipResult = await ImageManipulator.manipulateAsync(
            image,
            [{ crop: cropRegion }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );

        onConfirm(manipResult.uri);
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.cropBox}>
                    {image && <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />}
                </View>
                <View style={styles.buttons}>
                    <Button title="Cancel" onPress={onCancel} />
                    <Button title="Confirm Crop" onPress={cropImage} />
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cropBox: {
        width: 300,
        height: 300,
        borderWidth: 2,
        borderColor: 'white',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 20,
        width: 300,
        justifyContent: 'space-between',
    },
});
