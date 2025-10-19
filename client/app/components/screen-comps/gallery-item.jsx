import { View, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Images } from '../../common/settings/assets';

const { width: screenWidth } = Dimensions.get('window');

const IMAGE_PER_ROW = 3;
const SPACING = 5;
const IMAGE_WIDTH = (screenWidth - SPACING * (IMAGE_PER_ROW + 1)) / IMAGE_PER_ROW;

export default function GalleryItem({ source, onPress, style }) {
    const [failed, setFailed] = useState(false);

    const getValidSource = (src) => {
        if (failed) return Images.missingImage;
        if (!src) return Images.missingImage;
        if (typeof src === 'number') return src;
        if (src.uri && src.uri.trim() !== '') return src;
        return Images.missingImage;
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Image
                source={getValidSource(source)}
                onError={() => setFailed(true)}
                style={[{
                    width: IMAGE_WIDTH,
                    height: IMAGE_WIDTH,
                    borderRadius: 8,
                    backgroundColor: '#1c1c1c',
                }, style]}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );
}
