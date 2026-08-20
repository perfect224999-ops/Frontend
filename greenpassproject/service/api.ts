// ═══════════════════════════════════════════════════════════════
// services/api.ts
// ไฟล์กำหนดค่า Axios HTTP Client สำหรับเชื่อมต่อกับ Backend API
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';

// สร้าง axios instance พร้อม config ตั้งต้น
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:8081/api/v1`;
  }
  return 'http://localhost:8081/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// authApi สำหรับล็อกอิน
export const authApi = {
  adminLogin: async (payload: { username: string; password: string }) => {
    const response = await api.post('/admin/login', payload);
    return response.data;
  },
  rangerLogin: async (payload: { username: string; password: string }) => {
    const response = await api.post('/ranger/login', payload);
    return response.data;
  }
};

// stampApi สำหรับหน้าแสตมป์
export const stampApi = {
  scanCheckinQrCode: async (payload: { token: string; parkRangerId: number; parkRangerUsername: string }) => {
    const response = await api.post('/stamp', payload);
    return response.data;
  },
  getStatistics: async () => {
    const response = await api.get('/stamp/statistics');
    return response.data;
  }
};

// announcementApi สำหรับดึงข้อมูลประชาสัมพันธ์ข่าวสาร
export const announcementApi = {
  getAllAnnouncements: async () => {
    const response = await api.get('/announcement/all-announcement');
    return response.data;
  },
  addAnnouncement: async (payload: {
    title: string;
    content: string;
    publishDate: string;
    username: string;
    image?: string;
  }) => {
    const response = await api.post('/announcement/add', payload);
    return response.data;
  },
  updateAnnouncement: async (id: string, payload: {
    title: string;
    content: string;
    publishDate: string;
    username: string;
    image?: string;
  }) => {
    const response = await api.post(`/announcement/update?id=${id}`, payload);
    return response.data;
  },
  deleteAnnouncement: async (id: string) => {
    const response = await api.delete(`/announcement/delete?id=${id}`);
    return response.data;
  }
};


// rangerApi สำหรับจัดการบัญชีเจ้าหน้าที่อุทยาน
export const rangerApi = {
  addRanger: async (payload: {
    employeeId: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    position: string;
    parkName: string;
    startDate: string;
    district: string;
    subDistrict: string;
    province: string;
    gender: string;
    phone: string;
    email: string;
  }) => {
    const response = await api.post('/ranger/add', payload);
    return response.data;
  },
  getAllRangers: async () => {
    const response = await api.get('/ranger/all');
    return response.data;
  },
  updateRanger: async (username: string, payload: Partial<{
    employeeId: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    position: string;
    parkName: string;
    startDate: string;
    district: string;
    subDistrict: string;
    province: string;
    gender: string;
    phone: string;
    email: string;
    canIssueStamp: boolean;
    canAnnouncement: boolean;
    canEditParkDetails: boolean;
    canProgressReport: boolean;
  }>) => {
    const response = await api.post(`/ranger/update?username=${username}`, payload);
    return response.data;
  },
  getRangerByUsername: async (username: string) => {
    const response = await api.get(`/ranger/get?username=${username}`);
    return response.data;
  }
};

// rewardApi สำหรับจัดการของรางวัล
export const rewardApi = {
  getAllRewards: async () => {
    const response = await api.get('/reward/all');
    return response.data;
  },
  addReward: async (payload: {
    rewardTitle: string;
    rewardDetails: string;
    image: string;
  }) => {
    const response = await api.post('/reward/add', payload);
    return response.data;
  },
  updateReward: async (id: string, payload: {
    rewardTitle: string;
    rewardDetails: string;
    image?: string;
  }) => {
    const response = await api.post(`/reward/update?id=${id}`, payload);
    return response.data;
  }
};

export const parkApi = {
  getParkById: async (id: number = 1) => {
    const response = await api.get(`/park/get?id=${id}`);
    return response.data;
  },
  updatePark: async (payload: any) => {
    const response = await api.post('/park/update', payload);
    return response.data;
  }
};

export default api;