import { useState } from "react";
import ExpandInOut from "./expand-in-out";
import FadeInOut from "./fade-in-out";

export default function FadeExpand({ visible, children, inDuration = 300, outDuration = 300 }) {
    const [measured, setMeasured] = useState(false);

    return (
        <ExpandInOut
            visible={visible}
            inDuration={inDuration}
            outDuration={outDuration}
            onMeasured={() => setMeasured(true)}
        >
            {/* Only fade inner content, but allow ExpandInOut to measure properly */}
            <FadeInOut
                visible={visible && measured}
                inDuration={inDuration}
                outDuration={outDuration}
            >
                {children}
            </FadeInOut>
        </ExpandInOut>
    );
}