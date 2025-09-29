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