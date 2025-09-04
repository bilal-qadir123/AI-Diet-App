import axios from "axios";

const API_BASE = "http://localhost:5000";

export const waterService = {
  async getWater(token: string) {
    const response = await axios.get(`${API_BASE}/food/water`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateWater(token: string, waterConsumed: number) {
    const response = await axios.patch(
      `${API_BASE}/food/water`,
      { waterConsumed },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};