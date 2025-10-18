import { View, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Images } from '../../common/settings/assets';

const { width: screenWidth } = Dimensions.get('window');

const IMAGE_PER_ROW = 3;
const SPACING = 5;
const IMAGE_WIDTH = (screenWidth - SPACING * (IMAGE_PER_ROW + 1)) / IMAGE_PER_ROW;

export default function Gallery({ sources, sourcesOnPress }) {
    const rows = [];
    for (let i = 0; i < sources.length; i += IMAGE_PER_ROW) {
        rows.push(sources.slice(i, i + IMAGE_PER_ROW));
    }

    // helper: returns valid source or missing image
    const getValidSource = (src, failed) => {
        if (failed) return Images.missingImage;
        if (!src) return Images.missingImage;
        if (typeof src === 'number') return src; // local require()
        if (src.uri && typeof src.uri === 'string' && src.uri.trim() !== '') return src;
        return Images.missingImage;
    };

    return (
        <View style={{ padding: SPACING }}>
            {rows.map((rowItems, rowIndex) => (
                <View
                    key={rowIndex}
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        marginBottom: SPACING,
                    }}
                >
                    {rowItems.map((source, idx) => {
                        const globalIndex = rowIndex * IMAGE_PER_ROW + idx;
                        const onPress = sourcesOnPress?.[globalIndex] || (() => { });

                        // Local state for this image’s load error
                        const [failed, setFailed] = useState(false);

                        return (
                            <TouchableOpacity
                                key={idx}
                                onPress={onPress}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={getValidSource(source, failed)}
                                    onError={() => setFailed(true)}
                                    style={{
                                        width: IMAGE_WIDTH,
                                        height: IMAGE_WIDTH,
                                        borderRadius: 8,
                                        marginRight: idx !== rowItems.length - 1 ? SPACING : 0,
                                        backgroundColor: '#1c1c1c', // small neutral backdrop while loading
                                    }}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
