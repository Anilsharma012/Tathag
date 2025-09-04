const axios = require('axios');
const jwt = require('jsonwebtoken');
const zoomConfig = require('../config/zoomConfig');
const { ObjectId } = require('mongodb');

const ZoomService = {
    async getZoomAccessToken() {
        try {
            if (zoomConfig.jwtApiKey && zoomConfig.jwtApiSecret) {
                // Using JWT authentication
                const jwtToken = jwt.sign({
                    iss: zoomConfig.jwtApiKey
                }, zoomConfig.jwtApiSecret, {
                    expiresIn: '1h'
                });
                return jwtToken;
            } else {
                // Using OAuth
                const response = await axios.post(zoomConfig.oauthTokenUrl, null, {
                    params: {
                        grant_type: 'client_credentials'
                    },
                    auth: {
                        username: zoomConfig.clientId,
                        password: zoomConfig.clientSecret
                    }
                });
                return response.data.access_token;
            }
        } catch (error) {
            console.error('Error getting Zoom access token:', error);
            throw error;
        }
    },

    async createMeeting(courseId, title, startTime, duration) {
        try {
            const token = await this.getZoomAccessToken();
            const response = await axios.post(zoomConfig.meetingsUrl, {
                topic: title,
                type: 2, // Scheduled meeting
                start_time: startTime,
                duration: duration,
                timezone: 'Asia/Kolkata',
                settings: {
                    host_video: true,
                    participant_video: true,
                    waiting_room: false,
                    auto_recording: 'cloud',
                    join_before_host: true
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                meetingId: response.data.id,
                joinUrl: response.data.join_url,
                startTime: response.data.start_time,
                recordingUrl: null // Will be updated after recording is available
            };
        } catch (error) {
            console.error('Error creating Zoom meeting:', error);
            throw error;
        }
    },

    async getMeetingRecordings(meetingId) {
        try {
            const token = await this.getZoomAccessToken();
            const response = await axios.get(zoomConfig.recordingsUrl.replace('{meetingId}', meetingId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting Zoom recordings:', error);
            throw error;
        }
    }
};

module.exports = ZoomService;
