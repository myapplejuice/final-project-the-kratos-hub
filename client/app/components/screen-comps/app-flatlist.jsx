import React, { forwardRef } from "react";
import { FlatList, Keyboard, Platform } from "react-native";

const AppFlatList = forwardRef(({
    data,
    renderItem,
    keyExtractor,
    onScrollToTop,
    extraBottom = 0,
    ...props
}, ref) => {
    const handleScroll = (event) => {
        const yOffset = event.nativeEvent.contentOffset.y;

        if (yOffset <= 0 && typeof onScrollToTop === "function") {
            onScrollToTop();
        }

        if (props.onScroll) props.onScroll(event);
    };

    return (
        <FlatList
            ref={ref}
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onScroll={handleScroll}
            contentContainerStyle={{
                paddingBottom: extraBottom,
            }}
            keyboardShouldPersistTaps="handled"
            {...props}
        />
    );
});

export default AppFlatList;
