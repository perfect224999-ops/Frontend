"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { rangerApi, parkApi, getBaseURL } from "../../../../service/api";
import { 
  getProvincesList, 
  getDistrictsByProvince, 
  getSubDistrictsByDistrict,
  getZipcodesBySubdistrict 
} from "../../../../data/thaiLocationData";
import { 
  UserCog, 
  IdCard, 
  User, 
  Calendar, 
  Briefcase, 
  Trees, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Check, 
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Lock,
  Hash,
  Eye,
  EyeOff,
  FileSignature,
  UploadCloud,
  X,
  ImageIcon
} from "lucide-react";

interface Ranger {
  id: string;
  employeeId: string;
  username?: string;
  password?: string;
  name: string;
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
  role?: string;
}

const DEFAULT_RANGERS: Ranger[] = [
  { 
    id: "01", 
    employeeId: "PR01", 
    password: "pass1234",
    name: "สมชาย ใจดี", 
    firstName: "สมชาย", 
    lastName: "ใจดี", 
    birthDate: "15 ต.ค. 2547", 
    position: "หัวหน้าอุทยาน", 
    parkName: "อุทยานแห่งชาติเขาใหญ่",
    startDate: "15/10/2566",
    district: "ปากช่อง",
    subDistrict: "ปากช่อง",
    province: "นครราชสีมา",
    zipcode: "30130",
    gender: "ชาย",
    phone: "065-5249531",
    email: "perfasd@gmail.com"
  },
  { 
    id: "04", 
    employeeId: "PR04", 
    password: "pass1234",
    name: "จอนนี่ จิ้มเอม", 
    firstName: "จอนนี่", 
    lastName: "จิ้มเอม", 
    birthDate: "15 ต.ค. 2547", 
    position: "เจ้าหน้าที่ประชาสัมพันธ์", 
    parkName: "อุทยานแห่งชาติแก่งกระจาน",
    startDate: "15/10/2566",
    district: "หนองสองตอน",
    subDistrict: "หนองสองตอน",
    province: "ฉะเชิงเทรา",
    zipcode: "24000",
    gender: "ชาย",
    phone: "057-1425756",
    email: "xcperfasd@gmail.com"
  }
];

const formatThaiDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${day} ${months[month - 1]} ${year + 543}`;
  }
  return dateStr;
};

const formatSlashDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    return `${day}/${month}/${year + 543}`;
  }
  return dateStr;
};

function EditProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rangerId = searchParams.get("id");

  const [rangers, setRangers] = useState<Ranger[]>([]);
  const [currentRanger, setCurrentRanger] = useState<Ranger | null>(null);

  // Form states based on Page 163
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("pass1234");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [position, setPosition] = useState("");
  const [parkName, setParkName] = useState("");
  const [parkSearchQuery, setParkSearchQuery] = useState("");
  const [isParkDropdownOpen, setIsParkDropdownOpen] = useState(false);
  const parkDropdownRef = useRef<HTMLDivElement>(null);
  const [dbParks, setDbParks] = useState<Array<{ parkId: number; name: string }>>([]);

  useEffect(() => {
    async function loadParks() {
      try {
        const res = await parkApi.searchParks("");
        const list = res?.result || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((p: any) => ({
            parkId: p.parkId || p.id,
            name: p.name
          }));
          setDbParks(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch parks from database:", err);
      }
    }
    loadParks();
  }, []);

  const allParkOptions = useMemo(() => {
    if (dbParks.length > 0) {
      return dbParks.map((p) => p.name);
    }
    return [
      "อุทยานแห่งชาติแก่งกระจาน",
      "อุทยานแห่งชาติเขาใหญ่",
      "อุทยานแห่งชาติเอราวัณ",
      "อุทยานแห่งชาติสุเทพ-ปุย",
      "อุทยานแห่งชาติดอยอินทนนท์"
    ];
  }, [dbParks]);

  const filteredParks = useMemo(() => {
    const q = parkSearchQuery.trim().toLowerCase();
    if (!q) return allParkOptions;
    return allParkOptions.filter((name) => 
      name.toLowerCase().includes(q) ||
      name.replace(/อุทยานแห่งชาติ/g, "").trim().toLowerCase().includes(q)
    );
  }, [allParkOptions, parkSearchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (parkDropdownRef.current && !parkDropdownRef.current.contains(event.target as Node)) {
        setIsParkDropdownOpen(false);
        setParkSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPark = (selected: string) => {
    setParkName(selected);
    setParkSearchQuery("");
    setIsParkDropdownOpen(false);
  };

  const [startDate, setStartDate] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [zipcode, setZipcode] = useState("10000");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getSignatureImageSrc = (sig: string) => {
    if (!sig) return "";
    const trimmed = sig.trim();
    if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/uploads/") || trimmed.includes("uploads/")) {
      const baseUrl = getBaseURL ? getBaseURL() : "http://172.20.10.5:8081/api/v1";
      const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      return `${baseUrl}${cleanPath}`;
    }
    if (trimmed.startsWith("src/")) {
      return `/${trimmed}`;
    }
    const baseUrl = getBaseURL ? getBaseURL() : "http://172.20.10.5:8081/api/v1";
    return `${baseUrl}/uploads/signatures/${trimmed}`;
  };

  const compressImage = (file: File, maxWidth = 800, maxHeight = 400, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type || "image/png", quality));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setSignature(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setSignature(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    const fetchRangerData = async () => {
      if (!rangerId) return;

      let foundRanger: Ranger | null = null;

      // 1. Check local storage "greenpass_rangers" list first (handles newly added rangers with timestamp IDs)
      const savedRangers = localStorage.getItem("greenpass_rangers");
      if (savedRangers) {
        try {
          const list: Ranger[] = JSON.parse(savedRangers);
          const found = list.find((r: any) => 
            String(r.id) === String(rangerId) ||
            String(r.username) === String(rangerId) ||
            String(r.employeeId) === String(rangerId) ||
            `PR${r.id}` === rangerId ||
            (r.username && r.username.toLowerCase() === rangerId.toLowerCase())
          );
          if (found) {
            foundRanger = found;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Check local storage individual key "greenpass_ranger_detail_" + rangerId
      if (!foundRanger) {
        const savedIndividual = localStorage.getItem(`greenpass_ranger_detail_${rangerId}`);
        if (savedIndividual) {
          try {
            foundRanger = JSON.parse(savedIndividual);
          } catch (e) {}
        }
      }

      // Normalize username for API call (e.g. "01" -> "ranger01", "ranger01" -> "ranger01")
      const targetUsername = rangerId.startsWith("ranger") 
        ? rangerId 
        : (rangerId.length <= 2 ? `ranger${rangerId.padStart(2, "0")}` : rangerId);

      // 3. Try getRangerByUsername from MySQL DB API
      if (!foundRanger) {
        try {
          const res = await rangerApi.getRangerByUsername(targetUsername);
          const item = res?.result || res?.data;
          if (res && (res.success || res.status) && item) {
            foundRanger = {
              id: item.username,
              employeeId: item.username.toUpperCase(),
              password: item.password || "pass1234",
              name: `${item.firstname || ""} ${item.surname || ""}`.trim() || item.username,
              phone: item.mobilephone || "",
              email: item.email || "",
              position: item.position || "เจ้าหน้าที่อุทยาน",
              parkName: item.park?.name || "อุทยานแห่งชาติเขาใหญ่",
              firstName: item.firstname || "",
              lastName: item.surname || "",
              birthDate: formatThaiDate(item.birthDate),
              startDate: formatSlashDate(item.startDate),
              district: item.district || "-",
              subDistrict: item.subDistrict || "-",
              province: item.province || "-",
              zipcode: item.zipcode || "10000",
              gender: item.gender === 2 ? "หญิง" : "ชาย",
              signature: item.signature || "src/sig1.png"
            };
          }
        } catch (err) {
          console.warn("Could not fetch ranger by username:", err);
        }
      }

      // 4. Try getAllRangers from MySQL DB API
      if (!foundRanger) {
        try {
          const response = await rangerApi.getAllRangers();
          if (response && (response.success || response.status) && response.result) {
            const list = response.result.map((item: any) => ({
              id: item.username,
              employeeId: item.username.toUpperCase(),
              password: item.password || "pass1234",
              name: `${item.firstname || ""} ${item.surname || ""}`.trim() || item.username,
              phone: item.mobilephone || "",
              email: item.email || "",
              position: item.position || "เจ้าหน้าที่อุทยาน",
              parkName: item.park?.name || "อุทยานแห่งชาติเขาใหญ่",
              firstName: item.firstname || "",
              lastName: item.surname || "",
              birthDate: formatThaiDate(item.birthDate),
              startDate: formatSlashDate(item.startDate),
              district: item.district || "-",
              subDistrict: item.subDistrict || "-",
              province: item.province || "-",
              zipcode: item.zipcode || "10000",
              gender: item.gender === 2 ? "หญิง" : "ชาย",
              signature: item.signature || "src/sig1.png"
            }));
            const found = list.find((r: any) => 
              String(r.id).toLowerCase() === targetUsername.toLowerCase() || 
              String(r.id).toLowerCase() === rangerId.toLowerCase()
            );
            if (found) foundRanger = found;
          }
        } catch (e) {}
      }

      // 5. Check DEFAULT_RANGERS
      if (!foundRanger) {
        foundRanger = DEFAULT_RANGERS.find(r => 
          r.id === rangerId || 
          r.id === targetUsername || 
          `PR${r.id}` === rangerId ||
          `PR${r.id}` === targetUsername
        ) || null;
      }

      // 6. Safe fallback
      if (!foundRanger) {
        foundRanger = {
          id: rangerId,
          employeeId: rangerId.length <= 4 ? `PR${rangerId}` : rangerId.toUpperCase(),
          password: "pass1234",
          name: "สมชาย ใจดี",
          firstName: "สมชาย",
          lastName: "ใจดี",
          birthDate: "15 ต.ค. 2547",
          position: "เจ้าหน้าที่อุทยาน",
          parkName: "อุทยานแห่งชาติเขาใหญ่",
          startDate: "15/10/2566",
          district: "ปากช่อง",
          subDistrict: "ปากช่อง",
          province: "นครราชสีมา",
          zipcode: "30130",
          gender: "ชาย",
          phone: "089-1234567",
          email: "ranger01@park.go.th"
        };
      }

      // Populate form fields
      setCurrentRanger(foundRanger);
      setEmployeeId((foundRanger.employeeId || foundRanger.id || "").toUpperCase());
      setPassword(foundRanger.password || "Pass1234");
      setFirstName(foundRanger.firstName || foundRanger.name.split(" ")[0] || "");
      setLastName(foundRanger.lastName || foundRanger.name.split(" ")[1] || "");
      setBirthDate(foundRanger.birthDate || "");
      const rawPos = foundRanger.position || "เจ้าหน้าที่อุทยาน";
      const normalizedPos = (rawPos === "เจ้าหน้าที่ธุรการ" || rawPos.startsWith("เจ้าหน้าที่รับแจ้งเหตุ"))
        ? "เจ้าหน้าที่รับแจ้งเหตุ"
        : rawPos;
      setPosition(normalizedPos);
      const initialPark = foundRanger.parkName || "อุทยานแห่งชาติเขาใหญ่";
      setParkName(initialPark);
      setParkSearchQuery(initialPark);
      setStartDate(foundRanger.startDate || "");
      const cleanDist = (foundRanger.district && foundRanger.district !== "-") ? foundRanger.district : "";
      const cleanSub = (foundRanger.subDistrict && foundRanger.subDistrict !== "-") ? foundRanger.subDistrict : "";
      const cleanZip = (foundRanger.zipcode && foundRanger.zipcode !== "-") ? foundRanger.zipcode : "";
      const cleanProv = (foundRanger.province && foundRanger.province !== "-") ? foundRanger.province : "";
      setDistrict(cleanDist);
      setSubDistrict(cleanSub);
      setProvince(cleanProv);
      setZipcode(cleanZip);
      setGender(foundRanger.gender || "ชาย");
      setPhone(foundRanger.phone || "");
      setEmail(foundRanger.email || "");
      const sigValue = foundRanger.signature || localStorage.getItem(`greenpass_ranger_sig_${foundRanger.id || foundRanger.employeeId}`) || "";
      setSignature(sigValue);
    };

    fetchRangerData();
  }, [rangerId]);

  const validateParkRangerForm = (): string | null => {
    const cleanEmpId = employeeId.trim();
    if (!cleanEmpId) {
      return "กรุณากรอกรหัสพนักงาน/ชื่อผู้ใช้งาน";
    }
    if (cleanEmpId.includes(" ")) {
      return "รหัสพนักงาน/ชื่อผู้ใช้งานต้องไม่มีเว้นวรรคหรือช่องว่าง";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanEmpId)) {
      return "รหัสพนักงานต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรืออักขระ _ - เท่านั้น (ห้ามมีภาษาไทย)";
    }

    const cleanPassword = password.trim();
    if (!cleanPassword) {
      return "กรุณากรอกรหัสผ่าน (ห้ามเป็นค่าว่าง)";
    }
    if (/[\u0E00-\u0E7F]/.test(password)) {
      return "รหัสผ่านต้องเป็นภาษาอังกฤษเท่านั้น (ห้ามมีภาษาไทย)";
    }
    if (!/[a-z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)";
    }
    if (!/[A-Z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)";
    }
    if (!/[0-9]/.test(password)) {
      return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว (0-9)";
    }
    if (!/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
      return "รหัสผ่านต้องเป็นภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษมาตรฐานเท่านั้น (ห้ามมีภาษาไทยหรือภาษาอื่น)";
    }
    if (cleanPassword.length < 4 || cleanPassword.length > 16) {
      return "รหัสผ่านต้องมีความยาว 4 ถึง 16 ตัวอักษร";
    }

    const cleanFirstName = firstName.trim();
    if (!cleanFirstName) {
      return "กรุณากรอกชื่อเจ้าหน้าที่";
    }
    if (cleanFirstName.length < 2 || cleanFirstName.length > 50) {
      return "ชื่อต้องมีความยาว 2 ถึง 50 ตัวอักษร";
    }
    if (/[0-9]/.test(cleanFirstName)) {
      return "ชื่อต้องไม่มีตัวเลข";
    }
    if (!/^[a-zA-Zก-๙\s]+$/.test(cleanFirstName)) {
      return "ชื่อต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น (ห้ามมีอักขระพิเศษ)";
    }

    const cleanLastName = lastName.trim();
    if (!cleanLastName) {
      return "กรุณากรอกนามสกุลเจ้าหน้าที่";
    }
    if (cleanLastName.length < 2 || cleanLastName.length > 50) {
      return "นามสกุลต้องมีความยาว 2 ถึง 50 ตัวอักษร";
    }
    if (/[0-9]/.test(cleanLastName)) {
      return "นามสกุลต้องไม่มีตัวเลข";
    }
    if (!/^[a-zA-Zก-๙\s]+$/.test(cleanLastName)) {
      return "นามสกุลต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น (ห้ามมีอักขระพิเศษ)";
    }

    if (!province || province.trim() === "") {
      return "กรุณาเลือกจังหวัด";
    }
    if (!district || district.trim() === "" || district === "-") {
      return "กรุณาเลือกอำเภอ / เขต";
    }
    if (!subDistrict || subDistrict.trim() === "" || subDistrict === "-") {
      return "กรุณาเลือกตำบล / แขวง";
    }

    const cleanZipcode = zipcode.trim();
    if (!cleanZipcode || cleanZipcode === "-") {
      return "กรุณาเลือกรหัสไปรษณีย์";
    }
    if (!/^\d{5}$/.test(cleanZipcode)) {
      return "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก";
    }

    const cleanPhone = phone.replace(/[-\s]/g, "");
    if (!cleanPhone) {
      return "กรุณากรอกเบอร์โทรศัพท์";
    }
    if (!/^\d+$/.test(cleanPhone)) {
      return "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น";
    }
    if (cleanPhone.length !== 10) {
      return "เบอร์โทรศัพท์ต้องมีความยาว 10 หลัก (เช่น 0812345678)";
    }
    if (!/^(06|08|09|02)/.test(cleanPhone)) {
      return "เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 (เช่น 08, 09, 06)";
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return "กรุณากรอกอีเมล";
    }
    if (cleanEmail.includes(" ")) {
      return "อีเมลต้องไม่มีเว้นวรรคหรือช่องว่าง";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return "กรุณากรอกอีเมลให้อยู่ในรูปแบบที่ถูกต้อง (เช่น example@domain.com)";
    }

    if (birthDate) {
      const bDate = new Date(birthDate);
      const today = new Date();
      if (bDate > today) {
        return "วัน/เดือน/ปีเกิดต้องไม่เป็นวันที่ในอนาคต";
      }
    }

    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRanger) return;

    setError("");
    setSuccess("");

    const validationError = validateParkRangerForm();
    if (validationError) {
      setError("กรุณากรอกข้อมูลให้ถูกต้อง");
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmpId = employeeId.trim().toUpperCase();
      const targetUsername = currentRanger.username || currentRanger.employeeId || currentRanger.id || cleanEmpId;

      try {
        await rangerApi.updateRanger(targetUsername, {
          employeeId: cleanEmpId,
          password: password.trim().slice(0, 16),
          firstName,
          lastName,
          birthDate,
          position,
          parkName,
          startDate,
          district,
          subDistrict,
          province,
          zipcode: zipcode.trim().slice(0, 5),
          gender: gender === "หญิง" ? "2" : "1",
          phone,
          email,
          signature: signature.trim() || currentRanger.signature || "src/sig1.png"
        });
      } catch (apiErr) {
        console.warn("Could not update ranger in backend DB API:", apiErr);
      }

      const updatedObj = {
        ...currentRanger,
        id: cleanEmpId,
        employeeId: cleanEmpId,
        username: cleanEmpId,
        password: password.trim(),
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        birthDate,
        position,
        parkName,
        startDate,
        district,
        subDistrict,
        province,
        zipcode,
        gender,
        phone,
        email,
        signature: signature.trim() || currentRanger.signature || "src/sig1.png"
      };

      if (signature) {
        try {
          localStorage.setItem(`greenpass_ranger_sig_${cleanEmpId}`, signature);
          localStorage.setItem(`greenpass_ranger_sig_${cleanEmpId.toLowerCase()}`, signature);
        } catch (e) {}
      }

      // Update in greenpass_rangers array
      const savedRangers = localStorage.getItem("greenpass_rangers");
      let list: Ranger[] = savedRangers ? JSON.parse(savedRangers) : [];
      let updatedList = list.map((r) => (r.id === currentRanger.id || r.username === currentRanger.id || r.employeeId === currentRanger.id) ? updatedObj : r);
      if (!list.some(r => r.id === currentRanger.id || r.username === currentRanger.id || r.employeeId === currentRanger.id)) {
        updatedList = [updatedObj, ...list];
      }
      localStorage.setItem("greenpass_rangers", JSON.stringify(updatedList));

      // Update individual storage key
      localStorage.setItem(`greenpass_ranger_detail_${cleanEmpId}`, JSON.stringify(updatedObj));
      localStorage.setItem(`greenpass_ranger_detail_${cleanEmpId.toLowerCase()}`, JSON.stringify(updatedObj));

      setSuccess("แก้ไขประวัติเจ้าหน้าที่อุทยานสำเร็จแล้ว!");

      setTimeout(() => {
        router.push(`/admin/view-park-ranger-detail?id=${cleanEmpId}`);
      }, 1000);

    } catch (err) {
      console.error("Failed to update park ranger:", err);
      setError("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentRanger) {
    return (
      <div className="w-full max-w-3xl mx-auto py-20 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-600">กำลังโหลดข้อมูลเจ้าหน้าที่อุทยาน...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto font-sans relative py-4 my-2 px-2 sm:px-4">
      
      {/* Container หลัก สีขาว */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-slate-200/50 text-slate-800">
        
        {/* Header Banner */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              แก้ไขประวัติเจ้าหน้าที่อุทยาน #{currentRanger.id}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              แก้ไขและอัปเดตข้อมูลรายละเอียดเจ้าหน้าที่ให้เป็นปัจจุบัน
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <User className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลพื้นฐาน</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* รหัสพนักงาน */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รหัสพนักงาน</span>
                </label>
                <input 
                  type="text" 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all uppercase"
                  disabled={isLoading}
                />
              </div>

              {/* รหัสผ่าน ข้างๆ รหัสพนักงาน */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รหัสผ่าน</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all pr-10"
                    disabled={isLoading}
                    placeholder="ระบุรหัสผ่านเข้าสู่ระบบ"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* เพศ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เพศ</span>
                </label>
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* วัน/เดือน/ปีเกิด (Date Picker) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>วัน/เดือน/ปีเกิด</span>
                </label>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all cursor-pointer"
                  disabled={isLoading}
                />
              </div>

              {/* ชื่อ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ชื่อ</span>
                </label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* นามสกุล */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>นามสกุล</span>
                </label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* ตำแหน่ง */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ตำแหน่ง</span>
                </label>
                <div className="relative">
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    <option value="เจ้าหน้าที่ประชาสัมพันธ์">เจ้าหน้าที่ประชาสัมพันธ์</option>
                    <option value="หัวหน้าอุทยาน">หัวหน้าอุทยาน</option>
                    <option value="เจ้าหน้าที่พิทักษ์ป่า">เจ้าหน้าที่พิทักษ์ป่า</option>
                    <option value="เจ้าหน้าที่รับแจ้งเหตุ">เจ้าหน้าที่รับแจ้งเหตุ</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* อุทยานที่สังกัด (Searchable Combobox) */}
              <div className="space-y-1.5 relative" ref={parkDropdownRef}>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-emerald-600" />
                  <span>อุทยานที่สังกัด</span>
                </label>
                <div className="relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={isParkDropdownOpen ? parkSearchQuery : parkName}
                      onChange={(e) => {
                        setParkSearchQuery(e.target.value);
                        if (!isParkDropdownOpen) setIsParkDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setIsParkDropdownOpen(true);
                      }}
                      placeholder="พิมพ์ค้นหา หรือเลือกอุทยานแห่งชาติ..."
                      className="w-full bg-slate-50 text-slate-900 rounded-xl pl-3.5 pr-16 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all cursor-text placeholder:text-slate-400"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
                      {(parkName || parkSearchQuery) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setParkName("");
                            setParkSearchQuery("");
                          }}
                          className="p-1 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
                          title="ล้างข้อมูลอุทยาน"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isParkDropdownOpen) {
                            setParkSearchQuery("");
                          }
                          setIsParkDropdownOpen(!isParkDropdownOpen);
                        }}
                        className="p-1 hover:text-emerald-700 rounded-full transition-colors"
                        title={isParkDropdownOpen ? "ปิดรายการ" : "เปิดรายการอุทยาน"}
                      >
                        {isParkDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isParkDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 overflow-hidden max-h-64 flex flex-col animate-in fade-in-0 zoom-in-95 duration-100">
                      <div className="p-2 border-b border-slate-100 bg-slate-50/80 text-[11px] font-medium text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Search className="w-3 h-3 text-emerald-600" />
                          {parkSearchQuery.trim() ? "ผลการค้นหา" : "รายชื่ออุทยานทั้งหมด"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {filteredParks.length} แห่ง
                        </span>
                      </div>

                      <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
                        {filteredParks.length > 0 ? (
                          filteredParks.map((pName) => {
                            const isSelected = pName === parkName;
                            return (
                              <button
                                key={pName}
                                type="button"
                                onClick={() => handleSelectPark(pName)}
                                className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                                  isSelected 
                                    ? "bg-emerald-50/90 text-emerald-800 font-bold" 
                                    : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
                                }`}
                              >
                                <span className="truncate pr-2">{pName}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">
                            ไม่พบข้อมูลอุทยานแห่งชาติที่ค้นหา
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* วันที่เริ่มปฏิบัติงาน (Date Picker) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>วันที่เริ่มปฏิบัติงาน</span>
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all cursor-pointer"
                  disabled={isLoading}
                />
              </div>

              {/* รูปลายเซ็นเจ้าหน้าที่ (Signature) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileSignature className="w-3.5 h-3.5 text-emerald-600" />
                    <span>รูปลายเซ็นเจ้าหน้าที่</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    รองรับไฟล์ JPG, PNG, WEBP (พื้นหลังโปร่งใสหรือสีขาว)
                  </span>
                </label>

                {signature ? (
                  <div className="relative rounded-2xl border border-emerald-200 bg-emerald-50/20 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-28 h-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1.5 overflow-hidden shadow-sm">
                        <img 
                          src={getSignatureImageSrc(signature)} 
                          alt="Signature Preview" 
                          className="max-w-full max-h-full object-contain" 
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> แนบรูปลายเซ็นเรียบร้อย
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          รูปลายเซ็นนี้จะใช้สำหรับประทับตราดิจิทัล (Digital Stamp) ของเจ้าหน้าที่
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200 shadow-xs">
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                        เปลี่ยนรูป
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSignatureChange}
                          disabled={isLoading}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setSignature("")}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-red-200/60 shadow-xs"
                        disabled={isLoading}
                      >
                        <X className="w-3.5 h-3.5" />
                        ลบรูป
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                      คลิกเพื่อเลือกไฟล์รูปลายเซ็นเจ้าหน้าที่...
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      แนะนำภาพลายเซ็นแนวนอน (หรือรูปภาพที่มีลายมือชื่อเจ้าหน้าที่)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSignatureChange}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: ที่อยู่ปฏิบัติงาน (77 จังหวัด -> อำเภอ -> ตำบล -> รหัสไปรษณีย์) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>ที่อยู่ (เลือกจังหวัด / อำเภอ / ตำบล / รหัสไปรษณีย์)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* จังหวัด (77 จังหวัดทั่วไทย) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>จังหวัด <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-600 font-bold">(77 จังหวัด)</span>
                </label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setProvince(newProv);
                      setDistrict("");
                      setSubDistrict("");
                      setZipcode("");
                    }}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={isLoading}
                  >
                    <option value="" disabled>-- กรุณาเลือกจังหวัด --</option>
                    {getProvincesList().map((p, idx) => (
                      <option key={`${p}-${idx}`} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* อำเภอ (อิงตามจังหวัดที่เลือก) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">อำเภอ / เขต <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setDistrict(newDist);
                      setSubDistrict("");
                      setZipcode("");
                    }}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={!province || isLoading}
                  >
                    <option value="" disabled>-- กรุณาเลือกอำเภอ / เขต --</option>
                    {getDistrictsByProvince(province).map((d, idx) => (
                      <option key={`${d}-${idx}`} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* ตำบล (อิงตามอำเภอที่เลือก) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">ตำบล / แขวง <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={subDistrict}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setSubDistrict(newSub);
                      if (newSub) {
                        const zips = getZipcodesBySubdistrict(province, district, newSub);
                        setZipcode(zips[0] || "");
                      } else {
                        setZipcode("");
                      }
                    }}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10"
                    disabled={!district || isLoading}
                  >
                    <option value="" disabled>-- กรุณาเลือกตำบล / แขวง --</option>
                    {getSubDistrictsByDistrict(province, district).map((sd, idx) => (
                      <option key={`${sd}-${idx}`} value={sd}>{sd}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* รหัสไปรษณีย์ (เลือกตามตำบล/อำเภอ) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">รหัสไปรษณีย์ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer pr-10 font-mono"
                    disabled={!subDistrict || isLoading}
                  >
                    <option value="" disabled>-- เลือกรหัสไปรษณีย์ --</option>
                    {getZipcodesBySubdistrict(province, district, subDistrict).map((z, idx) => (
                      <option key={`${z}-${idx}`} value={z}>{z}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>


          {/* Section 3: ข้อมูลติดต่อ */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider pb-2 border-b border-slate-200">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>ช่องทางติดต่อ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* เบอร์มือถือ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เบอร์มือถือ</span>
                </label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono"
                  disabled={isLoading}
                  placeholder="0812345678"
                />
              </div>

              {/* อีเมล */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>อีเมล</span>
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>

            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button 
              type="button"
              onClick={() => router.push(`/admin/view-park-ranger-detail?id=${currentRanger.id}`)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ย้อนกลับ
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              ยืนยันบันทึกข้อมูล
            </button>
          </div>

        </form>
      </div>
    </div>
  );

}

export default function EditParkRangerProfilePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12 text-xs font-bold text-zinc-400">
        กำลังโหลดประวัติส่วนตัว...
      </div>
    }>
      <EditProfileContent />
    </Suspense>
  );
}
