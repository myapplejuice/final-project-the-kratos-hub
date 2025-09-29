import { useContext } from "react";
import { View } from "react-native";
import { UserContext } from "../../common/contexts/user-context";
import { formatDate } from "../../common/utils/date-time";
import { scaleFont } from "../../common/utils/scale-fonts";
import { colors } from "../../common/settings/styling";
import AppText from "./app-text";

export default function DateDisplay({
    styles,
    date = new Date(), // allow passing a date, default today
    showDay = true, // whether to show the day name
    centered = false,
    dayStyle = {},
    dateStyle = {},
    uppercaseDay = true,
    uppercaseDate = true,
}) {
    const { user } = useContext(UserContext);
    if (!user) return null;

    const lang = user?.preferences?.language?.format || "en-US";

    const dayName = showDay
        ? (uppercaseDay
            ? date.toLocaleDateString(lang, { weekday: "long" }).toUpperCase()
            : date.toLocaleDateString(lang, { weekday: "long" }))
        : null;

    const dayTextStyle = {
        color: colors.mutedText,
        fontSize: scaleFont(14),
        fontWeight: "600",
        textAlign: centered ? "center" : "left",
        ...dayStyle,
    };

    const dateTextStyle = {
        color: colors.mutedText,
        fontSize: scaleFont(24),
        fontWeight: "700",
        textAlign: centered ? "center" : "left",
        ...dateStyle,
    };

    const formattedDate = formatDate(date, {
        includeDayName: false,
        includeMonthName: true,
        includeYear: true,
        language: lang,
    });

    return (
        <View style={[styles]}>
            {showDay && <AppText style={dayTextStyle}>{dayName}</AppText>}
            <AppText style={dateTextStyle}>
                {uppercaseDate ? formattedDate.toUpperCase() : formattedDate}
            </AppText>
        </View>
    );
}
