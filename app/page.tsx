"use client";

import FooterSAU from "@/components/FooterSAU";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Page() {
  const router = useRouter();

  const [securecode, setSecurecode] = useState<string>("");

  const handleAsscessClick = () => {
    // ตรวจสอบรหัสที่ป้อนเข้ามา
    if (securecode.toLowerCase() !== "iotsau2026") {
      Swal.fire({
        icon: "error",
        title: "คำเตือน",
        text: "รหัสไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      });
      return;
    }
    // ไปยังหน้าแสดงรายการงานทั้งหมด
    router.push("/showallkinkun");
  };

  return (
    <>
      <div className="w-3/5 mt-10 p-10 shadow-xl mx-auto border-gray-400 rounded-xl flex flex-col justify-center items-center">
        {/* แสดงชื่อ app */}
        <h1 className="mt-2 text-2xl font-bold text-blue-700">
          Kinkun APP (Supabase)
        </h1>
        <h1 className=" text-lg font-bold text-blue-700">บันทึกการกิน</h1>

        {/* แสดงรูปจาก Internet */}
        <Image
          className="mt-5"
          src="https://cdn-icons-png.flaticon.com/128/1037/1037762.png"
          alt="Image"
          width={150}
          height={150}
        />

        {/* ป้อน Secure code สำหรับเข้าใช้งาน */}
        <input
          type="text"
          placeholder="Enter secure code"
          className="p-3 border border-gray-400 rounded mt-5 w-1/2"
          value={securecode}
          onChange={(e) => setSecurecode(e.target.value)}
        />

        {/* ปุ่มเข้าใช้งาน */}
        <button
          onClick={handleAsscessClick}
          className="mt-5 w-1/2 bg-blue-600 py-3 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          เข้าใช้งาน
        </button>
      </div>

      {/* แสดง footer */}
      <FooterSAU />
    </>
  );
}
