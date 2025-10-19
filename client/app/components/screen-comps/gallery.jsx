import { View } from 'react-native';
import GalleryItem from './gallery-item';

const IMAGE_PER_ROW = 3;
const SPACING = 5;

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
                    style={{
                        flexDirection: 'row',
                        marginBottom: SPACING,
                    }}
                >
                    {rowItems.map((source, idx) => {
                        const globalIndex = rowIndex * IMAGE_PER_ROW + idx;
                        const onPress = sourcesOnPress?.[globalIndex] || (() => { });

                        return (
                            <GalleryItem
                                key={idx}
                                source={source}
                                style={{ marginRight: idx !== rowItems.length - 1 ? SPACING : 0 }}
                                onPress={onPress}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
