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

export function convertWeight(value, unitFrom, unitTo) {
    if (unitFrom === unitTo) return value;

    let result;
    if (unitFrom === 'kg' && unitTo === 'lb') result = value * 2.20462;
    else if (unitFrom === 'lb' && unitTo === 'kg') result = value / 2.20462;
    else throw new Error(`Unsupported weight conversion: ${unitFrom} → ${unitTo}`);

    return Math.round(result * 10) / 10;
}

export function convertHeight(value, unitFrom, unitTo) {
    if (unitFrom === unitTo) {
        if (unitTo === 'ft/in') {
            // Ensure inches never >= 12
            let feet = value.feet + Math.floor(value.inches / 12);
            let inches = value.inches % 12;
            return { feet, inches };
        }
        return Math.round(value);
    }

    // Convert everything to inches first
    let inches;
    if (unitFrom === 'cm') {
        inches = value / 2.54;
    } else if (unitFrom === 'in') {
        inches = value;
    } else if (unitFrom === 'ft') {
        inches = value * 12;
    } else if (unitFrom === 'ft/in') {
        inches = value.feet * 12 + value.inches;
    } else {
        throw new Error(`Unsupported unitFrom: ${unitFrom}`);
    }

    // Convert from inches to target unit
    if (unitTo === 'in') return Math.round(inches);
    if (unitTo === 'cm') return Math.round(inches * 2.54);
    if (unitTo === 'ft') return Math.round(inches / 12);
    if (unitTo === 'ft/in') {
        let feet = Math.floor(inches / 12);
        let remInches = Math.round(inches % 12);

        // Handle rounding overflow: if inches == 12, add 1 to feet
        if (remInches === 12) {
            feet += 1;
            remInches = 0;
        }

        return { feet, inches: remInches };
    }

    throw new Error(`Unsupported unitTo: ${unitTo}`);
}

export function convertFluid(value, unitFrom, unitTo) {
    if (unitFrom === unitTo) return value;

    let result;

    if (unitFrom === 'ml' && unitTo === 'floz') result = value * 0.033814;
    else if (unitFrom === 'ml' && unitTo === 'cups') result = value / 240;

    else if (unitFrom === 'floz' && unitTo === 'ml') result = value / 0.033814;
    else if (unitFrom === 'floz' && unitTo === 'cups') result = (value / 0.033814) / 240;

    else if (unitFrom === 'cups' && unitTo === 'ml') result = value * 240;
    else if (unitFrom === 'cups' && unitTo === 'floz') result = (value * 240) * 0.033814;

    else throw new Error(`Unsupported volume conversion: ${unitFrom} → ${unitTo}`);

    if (unitTo === 'cups') return Math.round(result * 10) / 10;
    return Math.round(result); 
}


export function convertEnergy(value, unitFrom, unitTo) {
    if (unitFrom === unitTo) return value;

    let result;

    if (unitFrom === 'kj' && unitTo === 'kcal') result = value / 4.184;
    else if (unitFrom === 'kcal' && unitTo === 'kj') result = value * 4.184;
    else throw new Error(`Unsupported energy conversion: ${unitFrom} → ${unitTo}`);

    return Math.round(result);
}