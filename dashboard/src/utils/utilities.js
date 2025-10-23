export function formatPermissions(permissionsString) {
    return permissionsString
        .split(',')
        .map(permission => permission.charAt(0).toUpperCase() + permission.slice(1))
        .join(', ');
};