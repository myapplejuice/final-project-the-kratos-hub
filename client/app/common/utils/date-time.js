export function formatDate(dateInput, options = {}) {
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
            return date.toLocaleDateString(options.language || 'en-US', localeOptions);
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
                if (!includeYear) result = `${month}-${day}`;
                return result;
            case 'MMM d': {
                const monthName = date.toLocaleString('en-US', { month: 'short' }); // Oct
                return `${monthName} ${date.getDate()}`;
            }
            case 'MMMM d': {
                const monthName = date.toLocaleString('en-US', { month: 'long' }); // October
                return `${monthName} ${date.getDate()}`;
            }
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

export function fromSqlToLocalTime(utcTimeStr) {
    const localDate = new Date(utcTimeStr);
    return localDate.toString();
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

export function getDayComparisonsSafe(compareDate, now = new Date()) {
    if (!compareDate) return { isToday: false, isPast: false, isTomorrow: false, isYesterday: false };

    const compare = new Date(compareDate); // safely handle string or Date

    if (isNaN(compare.getTime())) {
        console.warn("Invalid date passed to getDayComparisons:", compareDate);
        return { isToday: false, isPast: false, isTomorrow: false, isYesterday: false };
    }

    const pageDay = new Date(compare);
    pageDay.setHours(0, 0, 0, 0);

    const currentDay = new Date(now);
    currentDay.setHours(0, 0, 0, 0);

    return {
        isToday:
            compare.getFullYear() === now.getFullYear() &&
            compare.getMonth() === now.getMonth() &&
            compare.getDate() === now.getDate(),
        isPast: pageDay.getTime() < currentDay.getTime(),
        isTomorrow: pageDay.getTime() === currentDay.getTime() + 86400000,
        isYesterday: pageDay.getTime() === currentDay.getTime() - 86400000,
    };
}


export function getHoursComparisons(compareDate, now = new Date()) {
    const diffMs = now.getTime() - compareDate.getTime(); // difference in milliseconds
    const diffMinutes = diffMs / (1000 * 60);
    const diffHours = diffMs / (1000 * 60 * 60);

    const compareDay = new Date(compareDate);
    compareDay.setHours(0, 0, 0, 0);

    const currentDay = new Date(now);
    currentDay.setHours(0, 0, 0, 0);

    return {
        isToday:
            compareDate.getFullYear() === now.getFullYear() &&
            compareDate.getMonth() === now.getMonth() &&
            compareDate.getDate() === now.getDate(),
        isLastHour: diffHours >= 0 && diffHours < 1,
        isLastMinute: diffMinutes >= 0 && diffMinutes < 1,
        diffMinutes,
        diffHours,
    };
}


export function isValidTime(timeStr) {
    // Check pattern HH:mm (both parts must be 2 digits)
    const match = /^(\d{1,2}):(\d{1,2})$/.exec(timeStr);
    if (!match) return false;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    // Validate ranges
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;

    return true;
}

export function formatSqlTime(timeStr, options = {}) {
    if (!timeStr) return '';
    
    const [hour, minute, second] = timeStr.split(':');
    const paddedHours = hour.padStart(2, '0');
    const paddedMinutes = minute.padStart(2, '0');
    const paddedSeconds = second.padStart(2, '0');

    const { format = '24h', includeSeconds = false } = options;

    if (format === '12h') {
        let h = Number(hour) % 12 || 12;
        const ampm = Number(hour) >= 12 ? 'PM' : 'AM';
        return includeSeconds
            ? `${h}:${paddedMinutes}:${paddedSeconds} ${ampm}`
            : `${h}:${paddedMinutes} ${ampm}`;
    } else {
        return includeSeconds
            ? `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
            : `${paddedHours}:${paddedMinutes}`;
    }
}
