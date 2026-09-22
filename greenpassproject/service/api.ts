// ═══════════════════════════════════════════════════════════════
// services/api.ts
// ไฟล์กำหนดค่า Axios HTTP Client สำหรับเชื่อมต่อกับ Backend API
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';

// สร้าง axios instance พร้อม config ตั้งต้น
export const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:8081/api/v1`;
  }
  return 'http://localhost:8081/api/v1';
  //return 'http://172.20.10.3:8081/api/v1';
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
  scanCheckinQrCode: async (payload: { token: string; parkRangerId?: number; parkRangerUsername?: string }) => {
    try {
      const response = await api.post('/stamp', payload, {
        validateStatus: (status) => status < 500
      });
      return response.data;
    } catch (err: any) {
      if (err?.response?.data) {
        return err.response.data;
      }
      throw err;
    }
  },
  getStatistics: async (parkId?: number, username?: string) => {
    const params: Record<string, any> = {};
    if (parkId) params.parkId = parkId;
    if (username) params.username = username;
    const response = await api.get('/stamp/statistics', { params });
    return response.data;
  },
  getQr: async (username: string) => {
    const response = await api.get('/stamp/qr', { headers: { username } });
    return response.data;
  },
  getMyStamps: async (username: string) => {
    const response = await api.get('/stamp/my-stamps', { headers: { username } });
    return response.data;
  },
  getStampDetails: async (username: string, parkId: number) => {
    const response = await api.get(`/stamp/stamp-details?parkId=${parkId}`, { headers: { username } });
    return response.data;
  }
};

// announcementApi สำหรับดึงข้อมูลประชาสัมพันธ์ข่าวสาร
export const announcementApi = {
  getAllAnnouncements: async () => {
    const response = await api.get('/announcement/all-announcement');
    return response.data;
  },
  getAnnouncementDetails: async (announcementId: number) => {
    const response = await api.get(`/announcement/announcement-details?announcementId=${announcementId}`);
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
    employeeId?: string;
    username?: string;
    password?: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    position: string;
    parkName?: string;
    parkId?: number;
    startDate: string;
    district: string;
    subDistrict: string;
    province: string;
    zipcode?: string;
    gender: string | number;
    phone: string;
    email: string;
    signature?: string;
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
    password?: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    position: string;
    parkName: string;
    startDate: string;
    district: string;
    subDistrict: string;
    province: string;
    zipcode?: string;
    gender: string;
    phone: string;
    email: string;
    signature?: string;
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
    const response = await api.get('/reward/reward-all');
    return response.data;
  },
  getRewardById: async (id: number) => {
    const response = await api.get(`/reward/${id}`);
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
  updateReward: async (id: number | string, payload: {
    rewardTitle?: string;
    rewardDetails?: string;
    image?: string;
  }) => {
    const response = await api.post(`/reward/update?id=${id}`, payload);
    return response.data;
  },
  deleteReward: async (id: number | string) => {
    const response = await api.delete(`/reward/delete?id=${id}`);
    return response.data;
  }
};

// parkApi สำหรับจัดการข้อมูลอุทยาน
export const parkApi = {
  getParkById: async (id: number = 1) => {
    const response = await api.get(`/park/get?parkId=${id}`);
    return response.data;
  },
  searchParks: async (keyword: string = '') => {
    const response = await api.get(`/park/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },
  updatePark: async (payload: any) => {
    const response = await api.post('/park/update', payload);
    return response.data;
  }
};

// reportApi สำหรับจัดการรายงาน/เรื่องร้องเรียน
export const reportApi = {
  getMyReports: async (username: string) => {
    const response = await api.get('/report/my-reports', {
      headers: { username }
    });
    return response.data;
  },
  getAllReports: async () => {
    const response = await api.get('/report/all');
    return response.data;
  },
  getReportsByParkId: async (parkId: number) => {
    const response = await api.get(`/report/park/${parkId}`);
    return response.data;
  },
  getReportsForRanger: async (username: string) => {
    const response = await api.get(`/report/ranger/${username}`);
    return response.data;
  },
  addReport: async (username: string, payload: {
    name: string;
    description: string;
    image?: string;
    parkId: number;
  }) => {
    const response = await api.post('/report/add-report', payload, {
      headers: { username }
    });
    return response.data;
  },
  getReportById: async (id: number) => {
    const response = await api.get(`/report/${id}`);
    return response.data;
  },
  updateReportStatus: async (id: number, status: string, rangerUsername?: string, progress?: string, image?: string) => {
    const response = await api.put(`/report/${id}/status`, { status, progress, image, username: rangerUsername, rangerUsername }, {
      headers: rangerUsername ? { username: rangerUsername } : {}
    });
    return response.data;
  }
};

// replyReportApi สำหรับดึงข้อมูลความคืบหน้าการตอบกลับรายงาน
export const replyReportApi = {
  getReplyReports: async (reportId: number) => {
    const response = await api.get(`/reply-report/my-reply-report?reportId=${reportId}`);
    return response.data;
  }
};


// userApi สำหรับจัดการบัญชีผู้ใช้งานทั่วไป
export const userApi = {
  register: async (payload: any) => {
    const response = await api.post('/user/register', payload);
    return response.data;
  },
  login: async (payload: { username: string; password: string }) => {
    const response = await api.post('/user/login', payload);
    return response.data;
  },
  updateUser: async (username: string, payload: any) => {
    const response = await api.put(`/user/${username}`, payload);
    return response.data;
  }
};

// adminApi สำหรับแอดมินและสถิติภาพรวม
export const adminApi = {
  getStatistics: async (month?: number, year?: number) => {
    const params: Record<string, any> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/admin/statistics', { params });
    return response.data;
  }
};

export default api;