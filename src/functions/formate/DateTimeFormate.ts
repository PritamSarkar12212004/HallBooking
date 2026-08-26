export const formatDate = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatTime = (timeString: string) => {
    if (!timeString) return '';
    if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
    }
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
};