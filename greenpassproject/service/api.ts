// ═══════════════════════════════════════════════════════════════
// services/api.ts
// ไฟล์กำหนดค่า Axios HTTP Client สำหรับเชื่อมต่อกับ Backend API
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';

// สร้าง axios instance พร้อม config ตั้งต้น
export const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://172.20.10.5:8081/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// อัปเดต baseURL อัตโนมัติในทุก request ตาม hostname ปัจจุบัน
api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  return config;
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
  setRole: async (username: string, payload: {
    canIssueStamp: boolean;
    canAnnouncement: boolean;
    canEditParkDetails: boolean;
    canProgressReport: boolean;
  }) => {
    try {
      const response = await api.post(`/ranger/set-role?username=${username}`, payload);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const response = await api.post(`/ranger/update?username=${username}`, payload);
        return response.data;
      }
      throw err;
    }
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

// fileUploadApi สำหรับอัปโหลดไฟล์รูปภาพแยกตามหมวดหมู่ (เช่น park, announcements, reports, rewards)
export const fileUploadApi = {
  upload: async (file: File | Blob, category: string = 'park') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
    const payload = {
      status,
      currentStatus: status,
      progress: progress || `อัปเดตสถานะเป็น ${status}`,
      image: image || undefined,
      rangerUsername: rangerUsername || '',
      username: rangerUsername || ''
    };
    const headers = rangerUsername ? { username: rangerUsername } : {};

    try {
      const response = await api.put(`/report/${id}/status`, payload, { headers });
      return response.data;
    } catch (err: any) {
      // Fallback: หาก endpoint PUT ล้มเหลว ให้ลองผ่าน replyReportApi
      return replyReportApi.createReplyReport({
        reportId: id,
        ...payload
      });
    }
  }
};

// replyReportApi สำหรับดึงและส่งข้อมูลการตอบกลับรายงาน (Replyreport)
export const replyReportApi = {
  getReplyReports: async (reportId: number) => {
    try {
      const response = await api.get(`/reply-report/my-reply-report?reportId=${reportId}`);
      return response.data;
    } catch (e: any) {
      try {
        const fallback = await api.get(`/reply-report/${reportId}`);
        return fallback.data;
      } catch {
        throw e;
      }
    }
  },
  createReplyReport: async (payload: {
    reportId: number;
    currentStatus?: string;
    status?: string;
    progress?: string;
    image?: string;
    parkRangerUsername?: string;
    username?: string;
  }) => {
    const username = payload.parkRangerUsername || payload.username || '';
    const headers = username ? { username } : {};

    const requestBody = {
      reportId: payload.reportId,
      report_id: payload.reportId,
      currentStatus: payload.currentStatus || payload.status || '',
      current_status: payload.currentStatus || payload.status || '',
      status: payload.status || payload.currentStatus || '',
      progress: payload.progress || '',
      image: payload.image || undefined,
      parkRangerUsername: username,
      park_ranger_username: username,
      username: username,
      rangerUsername: username
    };

    // 1. ลองส่งไปที่ /report/{id}/status (PUT) ก่อนเนื่องจากเป็น endpoint หลักที่ backend รองรับ
    if (payload.reportId) {
      try {
        const res = await api.put(`/report/${payload.reportId}/status`, requestBody, { headers });
        return res.data;
      } catch (errPut: any) {
        // หากได้ 400 Bad Request หรือ 403 Forbidden จาก backend ให้โยน error ขึ้นไปเลย
        if (errPut?.response?.status && errPut?.response?.status !== 404 && errPut?.response?.status !== 405) {
          throw errPut;
        }
      }
    }

    // 2. หากไม่มี reportId หรือ PUT 404/405 ให้ลอง POST /reply-report
    try {
      const res = await api.post('/reply-report', requestBody, { headers });
      return res.data;
    } catch (err1: any) {
      // 3. หาก 404/405 ลองส่งไปที่ /reply-report/add (POST)
      if (err1?.response?.status === 404 || err1?.response?.status === 405) {
        try {
          const res2 = await api.post('/reply-report/add', requestBody, { headers });
          return res2.data;
        } catch (err2: any) {
          throw err2;
        }
      }
      throw err1;
    }
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