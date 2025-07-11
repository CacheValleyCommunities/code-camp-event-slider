/**
 * Event configuration for the hack-a-thon
 */

export const EventConfig = {
    // Event Details
    name: 'CodeCamp: Bridgerland',
    date: '2025-07-11T08:00:00', // ISO string format
    location: 'Utah Tech University',
    day1End: '2025-07-11T20:00:00', // End of first day
    day2Start: '2025-07-12T08:00:00', // Start of second day
    day2End: '2025-07-12T20:00:00', // End of second day
    timezone: 'America/Denver',

    // Logo and Branding
    logoUrl: '/codecamp.png',
    primaryColor: '#00ff00',
    secondaryColor: '#333333',

    // Alert Presets - customize these for your event
    alerts: {
        welcome: 'Welcome to Code Camp 2025! 🎉',
        registration: 'Registration is now open at the front desk',
        breakfast: 'Breakfast is being served in the Main Hall',
        lunch: 'Lunch is ready! Please head to the cafeteria',
        dinner: 'Dinner is now available in the Main Hall',
        snacks: 'Snacks and drinks available at the refreshment station',
        parking: 'Parking lot will close in 15 minutes',
        wifi: 'WiFi Network: CodeCamp2025 | Password: Hackathon123',
        emergency: 'Please evacuate the building immediately!',
        judging: 'Project judging will begin in 30 minutes',
        presentation: 'Presentations will start in the main auditorium',
        awards: 'Award ceremony starting now in the main hall!'
    },

    // // Schedule (optional - can be used for automated alerts)
    // schedule: [
    //     { time: '08:00', alert: 'registration' },
    //     { time: '09:00', alert: 'breakfast' },
    //     { time: '12:00', alert: 'lunch' },
    //     { time: '18:00', alert: 'dinner' },
    //     { time: '20:00', alert: 'judging' }
    // ]
};

export default EventConfig;
