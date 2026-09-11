// Phone numbers allowed to see the CEO dashboard / CEO tabs.
// Everyone else gets the regular staff experience.
export const CEO_PHONES = ['7796419792'];

const normalize = (phone?: string): string =>
    String(phone ?? '').replace(/[^0-9]/g, '').slice(-10);

export const isCeoPhone = (phone?: string): boolean => {
    const value = normalize(phone);
    return value.length === 10 && CEO_PHONES.includes(value);
};
