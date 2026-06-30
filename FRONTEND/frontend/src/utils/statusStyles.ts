export const tableStatusStyles: Record<string, string> = {
    VACANT: 'bg-dark-surface border-status-available text-green-400',
    RESERVED: 'bg-dark-surface border-status-reserved text-yellow-400',
    DINING: 'bg-dark-surface border-status-occupied text-red-400',
    BILLING: 'bg-dark-surface border-status-billing text-blue-400 animate-pulse',
    PREPARING: 'bg-dark-surface border-status-maintenance text-gray-400',
}

export const statusColors: Record<string, string> = {
    VACANT: 'bg-status-available',
    RESERVED: 'bg-status-reserved',
    DINING: 'bg-status-occupied',
    BILLING: 'bg-status-billing',
    PREPARING: 'bg-status-maintenance',
}
