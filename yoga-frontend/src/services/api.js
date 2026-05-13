import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export const authService = {
  register: async (email, password, username) => {
    const response = await api.post("/register", {
      email,
      password,
      username,
    });

    return response.data;
  },

  login: async (email, password) => {
    const formData = new FormData();

    formData.append("username", email);
    formData.append("password", password);

    const response = await axios.post(`${API_URL}/token`, formData);

    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
  },
};

export const userService = {
  me: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
};

export const contactService = {
  createMessage: async (message) => {
    const response = await api.post("/contact/messages", { message });
    return response.data;
  },

  getMyMessages: async () => {
    const response = await api.get("/contact/my-messages");
    return response.data;
  },
};

export const adminService = {
  getAllContactMessages: async () => {
    const response = await api.get("/admin/contact/messages");
    return response.data;
  },

  replyToContactMessage: async (messageId, adminReply) => {
    const response = await api.put(
      `/admin/contact/messages/${messageId}/reply`,
      {
        admin_reply: adminReply,
      },
    );

    return response.data;
  },

  deleteContactMessage: async (messageId) => {
    const response = await api.delete(
      `/admin/contact/messages/${messageId}`,
    );

    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default api;