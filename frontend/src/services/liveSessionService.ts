import apiClient from "./api";

export const liveSessionService = {
  /**
   * Start a live session for a webinar (host only)
   */
  startLiveSession: async (webinarId: number) => {
    const response = await apiClient.post(`/live/start/${webinarId}/`);
    return response.data;
  },

  /**
   * Join a live session for a webinar (registered students only)
   */
  joinLiveSession: async (webinarId: number) => {
    const response = await apiClient.get(`/live/join/${webinarId}/`);
    return response.data;
  },

  /**
   * Check if a live session is active
   */
  checkLiveStatus: async (webinarId: number) => {
    const response = await apiClient.get(`/live/status/${webinarId}/`);
    return response.data;
  },
};

export default liveSessionService;
