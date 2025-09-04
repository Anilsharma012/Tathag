const zoomConfig = {
    // You'll need to get these from your Zoom developer account
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
    jwtApiKey: process.env.ZOOM_API_KEY,
    jwtApiSecret: process.env.ZOOM_API_SECRET,
    redirectUri: process.env.ZOOM_REDIRECT_URI,
    
    // API endpoints
    zoomBaseUrl: 'https://api.zoom.us/v2',
    oauthTokenUrl: 'https://zoom.us/oauth/token',
    meetingsUrl: 'https://api.zoom.us/v2/users/me/meetings',
    recordingsUrl: 'https://api.zoom.us/v2/meetings/{meetingId}/recordings'
};

module.exports = zoomConfig;
