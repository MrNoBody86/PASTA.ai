import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';

// --- Configuration ---
const WEB_CLIENT_ID = '503761265112-dv2gn8jc24n91em5bomh4qr51tv9uqua.apps.googleusercontent.com';

const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.location.read', // Optional
  'https://www.googleapis.com/auth/fitness.body.read',     // Optional
  'https://www.googleapis.com/auth/fitness.nutrition.read',// Optional
  'https://www.googleapis.com/auth/fitness.sleep.read',    // Optional
  // Add FITNESS_ACTIVITY_WRITE, etc., if you intend to write data
];

const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events', // For creating/editing
];

// --- Initialization ---
GoogleSignin.configure({
  scopes: [...GOOGLE_FIT_SCOPES, ...GOOGLE_CALENDAR_SCOPES],
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true, // Request refresh token for long-lived access (typically handled by a backend)
});

// --- Authentication Functions ---
interface GoogleAuthResult {
  userInfo: any; // Type this more strictly based on GoogleSignin.signIn() response
  accessToken: string;
  idToken: string | null;
}

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens(); // { accessToken, idToken }

    console.log('Google Sign-In Success: User ->', userInfo.user.email);
    console.log('Access Token available');
    return { userInfo, accessToken: tokens.accessToken, idToken: tokens.idToken };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google sign-in cancelled by user.');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google sign-in operation already in progress.');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Google Play services not available or outdated.');
    } else {
      console.error('Google Sign-In Error:', error, error.code);
    }
    throw error; // Re-throw to be handled by UI
  }
};

export const getCurrentGoogleUser = async (): Promise<GoogleAuthResult | null> => {
    try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (!isSignedIn) return null;

        // signInSilently will attempt to refresh tokens if needed
        const userInfo = await GoogleSignin.signInSilently();
        const tokens = await GoogleSignin.getTokens();
        console.log('Google User (silent sign-in/current):', userInfo.user.email);
        return { userInfo, accessToken: tokens.accessToken, idToken: tokens.idToken };
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_REQUIRED) {
            console.log('Silent sign-in failed: Sign-in required.');
        } else {
            console.error('Error getting current Google user or refreshing token:', error);
        }
        return null; // Sign-in required or other error
    }
};


export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.revokeAccess(); // Important for full sign out
    await GoogleSignin.signOut();
    console.log('Google user signed out and access revoked.');
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    throw error;
  }
};

// --- Google Fit API Functions ---
const GOOGLE_FIT_API_BASE_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

export const fetchGoogleFitData = async (accessToken: string, startTimeMillis: number, endTimeMillis: number) => {
  if (!accessToken) throw new Error('Google Fit: Access token is required.');

  const requestBody = {
    aggregateBy: [
      { dataTypeName: "com.google.step_count.delta", dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" },
      { dataTypeName: "com.google.calories.expended", dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended" },
      { dataTypeName: "com.google.distance.delta", dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta" },
      // Add other data types you need, e.g., sleep, heart rate
      // { dataTypeName: "com.google.sleep.segment", dataSourceId: "derived:com.google.sleep.segment:com.google.android.gms:merged" }
    ],
    bucketByTime: { durationMillis: 86400000 }, // 24 hours in milliseconds (for daily aggregation)
    startTimeMillis: startTimeMillis,
    endTimeMillis: endTimeMillis,
  };

  try {
    const response = await axios.post(GOOGLE_FIT_API_BASE_URL, requestBody, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Process the response.data.bucket array
    // Each bucket corresponds to a day if bucketByTime.durationMillis is 24 hours
    // Each bucket has a dataset array for each dataTypeName requested.
    // Each dataset has a point array.
    // Example for steps:
    // bucket[0].dataset[0].point[0].value[0].intVal for steps
    // bucket[0].dataset[1].point[0].value[0].fpVal for calories
    console.log('Google Fit API Response:', JSON.stringify(response.data, null, 2));
    return response.data; // Return raw data for UI to parse
  } catch (error: any) {
    console.error('Error fetching Google Fit data via API:', error.response?.data || error.message);
    throw error;
  }
};


// --- Google Calendar API Functions ---
const GOOGLE_CALENDAR_API_BASE_URL = 'https://www.googleapis.com/calendar/v3';

export const fetchGoogleCalendarEvents = async (accessToken: string, calendarId: string = 'primary', timeMinIso?: string, timeMaxIso?: string) => {
  if (!accessToken) throw new Error('Google Calendar: Access token is required.');
  try {
    const params: any = { maxResults: 50, orderBy: 'startTime', singleEvents: true };
    if (timeMinIso) params.timeMin = timeMinIso;
    if (timeMaxIso) params.timeMax = timeMaxIso;

    const response = await axios.get(
      `${GOOGLE_CALENDAR_API_BASE_URL}/calendars/${calendarId}/events`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: params,
      }
    );
    console.log(`Fetched ${response.data.items?.length || 0} calendar events.`);
    return response.data.items || [];
  } catch (error: any) {
    console.error('Error fetching Google Calendar events:', error.response?.data || error.message);
    throw error;
  }
};

export const createGoogleCalendarEvent = async (accessToken: string, calendarId: string = 'primary', eventData: any) => {
  if (!accessToken) throw new Error('Google Calendar: Access token is required.');
  // eventData structure: { summary, description, start: { dateTime, timeZone }, end: { dateTime, timeZone } }
  try {
    const response = await axios.post(
      `${GOOGLE_CALENDAR_API_BASE_URL}/calendars/${calendarId}/events`,
      eventData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Google Calendar event created:', response.data.htmlLink);
    return response.data;
  } catch (error: any) {
    console.error('Error creating Google Calendar event:', error.response?.data || error.message);
    throw error;
  }
};