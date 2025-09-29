export function formatDate(dateInput, options = {}) {
    // formatDate('2025-09-01') 
    // => "01/09/2025"

    // formatDate('2025-09-01', { format: 'MM/DD/YYYY' })
    // => "09/01/2025"

    // formatDate('2025-09-01', { includeDayName: true })
    // => "Monday, 01/09/2025"

    // formatDate('2025-09-01', { includeMonthName: true })
    // => "01 September 2025"

    // formatDate('2025-09-01', { includeDayName: true, includeMonthName: true })
    // => "Monday, 1 September 2025"

    // formatDate('2025-09-01', { includeYear: false })
    // => "01/09"  (year excluded)

    try {
        const date = new Date(dateInput);
        const pad = (num) => String(num).padStart(2, '0');

        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();

        const {
            format = 'DD/MM/YYYY',
            includeDayName = false,
            includeMonthName = false,
            includeYear = true,
        } = options;

        if (includeDayName || includeMonthName) {
            const localeOptions = {
                weekday: includeDayName ? 'long' : undefined,
                day: 'numeric',
                month: includeMonthName ? 'long' : '2-digit',
                year: includeYear ? 'numeric' : undefined,
            };
            return date.toLocaleDateString(options.language, localeOptions);
        }

        let result = '';
        switch (format) {
            case 'DD/MM/YYYY':
                result = `${day}/${month}`;
                if (includeYear) result += `/${year}`;
                return result;
            case 'MM/DD/YYYY':
                result = `${month}/${day}`;
                if (includeYear) result += `/${year}`;
                return result;
            case 'YYYY-MM-DD':
                result = `${year}-${month}-${day}`;
                if (!includeYear) result = `${month}-${day}`; // exclude year
                return result;
            default:
                return date.toLocaleDateString();
        }
    } catch (err) {
        console.error('Error formatting date:', err);
        return new Date(dateInput).toLocaleDateString();
    }
}

export function formatTime(dateInput, options = {}) {
    try {
        const date = new Date(dateInput);
        if (isNaN(date)) return '';

        const { format = '24h', includeSeconds = false } = options;

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        if (String(format).trim() === '12h') {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // convert 0 -> 12
            return includeSeconds
                ? `${hours}:${minutes}:${seconds} ${ampm}`
                : `${hours}:${minutes} ${ampm}`;
        } else {
            // 24h format
            const paddedHours = String(hours).padStart(2, '0');
            return includeSeconds
                ? `${paddedHours}:${minutes}:${seconds}`
                : `${paddedHours}:${minutes}`;
        }
    } catch (err) {
        console.error('Error formatting time:', err);
        return '';
    }
}

// When making sql time
export function getSQLTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0"); // optional
    return `${hours}:${minutes}:${seconds}`;
}

// When getting sql time to create Date() then use FormatTime
export function toDateFromSQLTime(timeStr) {
    // timeStr = "14:35:42"
    const today = new Date().toISOString().split("T")[0]; // "2025-09-29"
    return new Date(`${today}T${timeStr}`);
}

export function getDayComparisons(compareDate, now = new Date()) {
    const pageDay = new Date(compareDate);
    pageDay.setHours(0, 0, 0, 0);

    const currentDay = new Date(now);
    currentDay.setHours(0, 0, 0, 0);

    return {
        isToday:
            compareDate.getFullYear() === now.getFullYear() &&
            compareDate.getMonth() === now.getMonth() &&
            compareDate.getDate() === now.getDate(),
        isPast: pageDay.getTime() < currentDay.getTime(),
        isTomorrow: pageDay.getTime() === currentDay.getTime() + 86400000,
        isYesterday: pageDay.getTime() === currentDay.getTime() - 86400000,
    };
}
