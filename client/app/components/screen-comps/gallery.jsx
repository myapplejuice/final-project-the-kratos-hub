import { View, TouchableOpacity, Dimensions } from 'react-native';
import AppImage from '../screen-comps/app-image';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_PER_ROW = 3;
const SPACING = 5;
const IMAGE_WIDTH = (screenWidth - SPACING * (IMAGE_PER_ROW + 1)) / IMAGE_PER_ROW;

export default function Gallery({ sources, sourcesOnPress }) {
    const rows = [];
    for (let i = 0; i < sources.length; i += IMAGE_PER_ROW) {
        rows.push(sources.slice(i, i + IMAGE_PER_ROW));
    }

    return (
        <View style={{ padding: SPACING }}>
            {rows.map((rowItems, rowIndex) => (
                <View
                    key={rowIndex}
                    style={{ flexDirection: 'row', marginBottom: SPACING }}
                >
                    {rowItems.map((source, idx) => {
                        const globalIndex = rowIndex * IMAGE_PER_ROW + idx;
                        const onPress = sourcesOnPress?.[globalIndex] || (() => {});

                        return (
                            <TouchableOpacity
                                key={idx}
                                onPress={onPress}
                                activeOpacity={0.7}
                                style={{ marginRight: idx !== rowItems.length - 1 ? SPACING : 0 }}
                            >
                                <AppImage
                                    source={source}
                                    style={{
                                        width: IMAGE_WIDTH,
                                        height: IMAGE_WIDTH,
                                        borderRadius: 8,
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
