"use client";

import Image from "next/image";
import logoimg from "@/assets/logo.png";
import Link from "next/link";
import FooterSAU from "@/components/FooterSAU";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import Swal from "sweetalert2";

// สร้าง interface ที่ล้อกับ colummn ของตารางที่จะทำงานด้วย
interface Task {
  id: string;
  created_at: string;
  food_name: string;
  food_where: string;
  food_pay: number;
  food_image_url: string;
}

export default function Page() {
  //สร้าง state แบบ Task เพื่อเก็บข้อมูลที่ดึงมาจาก supabase
  const [tasks, setTasks] = useState<Task[]>([]);

  //ดึงข้อมูลตอนที่ Component นี้ Render
  useEffect(() => {
    //ฟังก์ชันดึงข้อมูล
    const fetchTasks = async () => {
      //ดึงข้อมูล
      const { data, error } = await supabase
        .from("kinkun_tb")
        .select("*")
        .order("created_at", { ascending: false });

      //ตรวจสอบ Error
      if (error) {
        Swal.fire({
          icon: "warning",
          title: "เกิดข้อผิดพลาด",
          text: "กรุณาลองใหม่อีกครั้ง",
        });
        return;
      }

      //ไม่มี Error เอาข้อมูลที่ดึงกำหนดให้กับ state ที่สร้างไว้
      if (data) {
        setTasks(data as Task[]);
      }
    };

    //เรียกใช้ฟัง์ชันดึงข้อมูล
    fetchTasks();
  }, []);

  // delete function
  const handleDeleteClick = async (id: string, food_image_url: string) => {
    //ยืนยันการลบข้อมูล
    Swal.fire({
      title: "ยืนยันการลบข้อมูล",
      text: "คุณต้องการลบข้อมูลนี้หรือไม่?",
      icon: "question",
      confirmButtonText: "ยืนยัน",
      showCancelButton: true,
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // ลบข้อมูลใน database
        const { error: error1 } = await supabase
          .from("kinkun_tb")
          .delete()
          .eq("id", id);

        if (error1) {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถลบข้อมูลในฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
            icon: "error",
          });
          return;
        }

        // ลบรูปจาก storage
        const { error: error2 } = await supabase.storage
          .from("kinkun_bk")
          .remove([
            food_image_url.substring(food_image_url.lastIndexOf("/") + 1),
          ]);

        if (error2) {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถลบรูปจาก storage ได้ กรุณาลองใหม่อีกครั้ง",
            icon: "error",
          });
          return;
        }

        // อัปเดตข้อมูลในตาราง
        setTasks(tasks.filter((task) => task.id !== id));
      }
    });
  };
  return (
    <>
      <div
        className="w-3/5 mt-20 p-10 shadow-xl mx-auto
                 border border-gray-400 rounded-xl
                 flex flex-col justify-center items-center"
      >

        {/* แสดงชื่อแอปฯ + การทำงาน */}
        <h1 className="mt-5 text-xl font-bold text-blue-700">
          Kinkun APP (Supabase)
        </h1>
        <h1 className=" text-xl font-bold text-blue-700">ข้อมูลการกิน</h1>
        {/* แสดงรูปจาก assets ในโปรเจ็กต์ */}
        <Image className="mt-5" src={logoimg} alt="logo" width={100} height={100} />

        {/* แสดงปุ่มเพิ่มงาน  */}
        <div className="w-full mt-5 flex justify-end">
          <Link
            href="/addkinkun"
            className="bg-blue-600 py-2 px-5 rounded
                             hover:bg-blue-800 text-white"
          >
            เพิ่มการกิน
          </Link>
        </div>

        {/* แสดงตารางที่นำข้อมูลทั้งหมดจาก task_tb มาแสดง */}
        <table className="w-full border border-gray-500 mt-5">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-500 p-2">รูป</th>
              <th className="border border-gray-500 p-2">ชื่อเมนูอาหาร</th>
              <th className="border border-gray-500 p-2">สถานที่</th>
              <th className="border border-gray-500 p-2">ราคา</th>
              <th className="border border-gray-500 p-2">วันที่</th>
              <th className="border border-gray-500 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-500 p-2">
                  <Image
                    src={item.food_image_url}
                    alt="logo"
                    width={50}
                    height={50}
                    className="mx-auto"
                  />
                </td>
                <td className="border border-gray-500 p-2">{item.food_name}</td>
                <td className="border border-gray-500 p-2">
                  {item.food_where}
                </td>
                <td className="border border-gray-500 p-2">
                  {item.food_pay.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="border border-gray-500 p-2 text-center">
                  {new Date(item.created_at).toLocaleString("th-TH", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })}
                </td>
                <td className="border border-gray-500 p-2 text-center">
                  <Link
                    href={`/updatekinkun/${item.id}`}
                    className="text-green-500 hover:underline "
                  >
                    แก้ไข
                  </Link>
                  {""} | {""}
                  <button
                    className="cursor-pointer text-red-500 hover:underline"
                    onClick={() =>
                      handleDeleteClick(item.id, item.food_image_url)
                    }
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ส่วนปุ่มออกจากการใช้งาน */}
        <Link href={"/"} className="mt-3 text-blue-500">
          ออกจากการใช้งาน
        </Link>
      </div>

      {/* แสดง Footer */}
      <FooterSAU />
    </>
  );
}
