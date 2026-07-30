import ScanCheckinQRCode from "./ScanCheckinQRCode";

export const metadata = {
  title: "สแกน Check-in QR code - GreenPass Park Ranger",
  description: "ระบบสแกน QR Code ตั๋วท่องเที่ยวอุทยาน เพื่อประทับตราอุทยานแห่งชาติสะสมสแตมป์",
};

export default function ScanCheckinPage() {
  return <ScanCheckinQRCode />;
}
