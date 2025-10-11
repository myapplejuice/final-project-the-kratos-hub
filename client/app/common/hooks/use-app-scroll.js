import { useRef } from "react";

export default function useAppScroll() {
    const scrollRef = useRef(null);

    const scrollToBottom = () => {
        if (scrollRef.current?.getScrollResponder) {
            scrollRef.current.getScrollResponder().scrollToEnd({ animated: true });
        }
    };

    return { scrollRef, scrollToBottom };
}
