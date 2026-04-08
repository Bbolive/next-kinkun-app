"use client";

import logoimg from "@/assets/logo.png";
import FooterSAU from "@/components/FooterSAU";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import Swal from "sweetalert2";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null); // เก็บ URL เดิมไว้เพื่อลบ

  // 1. ดึงข้อมูลเดิมมาแสดง
  useEffect(() => {
    const fetchTask = async () => {
      const { data, error } = await supabase
        .from("kinkun_tb")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
        return;
      }

      setTitle(data.food_name);
      setLocation(data.food_where);
      setPrice(data.food_pay.toString());
      setImagePreview(data.food_image_url);
      setOldImageUrl(data.food_image_url); // เก็บ URL รูปเดิมไว้ลบภายหลัง
    };
    fetchTask();
  }, [id]);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateClick = async () => {
    // --- ส่วนที่ 1: Validation (ตรวจสอบค่าว่างเหมือนโค้ดชุดที่ 2) ---
    if (!title.trim() || !location.trim() || !price.trim()) {
      Swal.fire("คำเตือน", "กรุณากรอกข้อมูลให้ครบ", "warning");
      return;
    }

    let currentImageUrl = imagePreview;

    // --- ส่วนที่ 2: จัดการรูปภาพ (ถ้ามีการเลือกรูปใหม่) ---
    if (imageFile) {
      // 2.1 ลบรูปเก่าออกจาก Storage (ถ้ามีรูปเดิมอยู่)
      if (oldImageUrl) {
        const oldFileName = oldImageUrl.split("/").pop()?.split("?")[0];
        if (oldFileName) {
          await supabase.storage.from("kinkun_bk").remove([oldFileName]);
        }
      }

      // 2.2 อัปโหลดรูปใหม่
      const newFileName = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("kinkun_bk")
        .upload(newFileName, imageFile);

      if (uploadError) {
        Swal.fire("Error", "ไม่สามารถอัปโหลดรูปใหม่ได้", "error");
        return;
      }

      // 2.3 รับ URL รูปใหม่
      const { data } = supabase.storage
        .from("kinkun_bk")
        .getPublicUrl(newFileName);
      currentImageUrl = data.publicUrl;
    }

    // --- ส่วนที่ 3: อัปเดตข้อมูลลง Database ---
    const { error: updateError } = await supabase
      .from("kinkun_tb")
      .update({
        food_name: title,
        food_where: location,
        food_pay: parseFloat(price),
        food_image_url: currentImageUrl,
      })
      .eq("id", id);

    if (updateError) {
      Swal.fire("Error", "บันทึกข้อมูลไม่สำเร็จ", "error");
    } else {
      await Swal.fire({
        title: "สำเร็จ",
        text: "แก้ไขข้อมูลเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      });
      router.push("/showallkinkun");
    }
  };

  return (
    <>
      <div className="w-3/5 mt-20 p-10 shadow-xl mx-auto border border-gray-400 rounded-xl flex flex-col justify-center items-center">
        <h1 className=" text-2xl font-bold text-blue-700">Manage Task App</h1>
        <h1 className=" text-lg text-blue-700">เพิ่มข้อมูลการกิน</h1>
        <Image
          className="mt-5"
          src={logoimg}
          alt="logo"
          width={100}
          height={100}
        />

        <div className="w-full flex flex-col mt-5">
          <h1>ชื่อเมนูอาหาร</h1>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="p-2 border border-gray-700 rounded mt-1 mb-2"
          />
          <h1>สถานที่</h1>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            type="text"
            className="p-2 border border-gray-700 rounded mt-1 mb-2"
          />
          <h1>ราคา(บาท)</h1>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            className="p-2 border border-gray-700 rounded mt-1 mb-2"
          />
        </div>

        <div className="w-full flex flex-col mt-5">
          <h1>อัปโหลดรูป</h1>
          <input
            id="selectImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelectImage}
          />
          <label
            htmlFor="selectImage"
            className="py-2 px-4 cursor-pointer bg-blue-600 hover:bg-blue-800 text-white rounded mt-1 mb-2 w-30 text-center"
          >
            เลือกรูปภาพ
          </label>
          {imagePreview && (
            <Image src={imagePreview} alt="preview" width={150} height={150} />
          )}
        </div>

        <button
          onClick={handleUpdateClick} // เพิ่ม onClick ให้ทำงาน
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-5 cursor-pointer"
        >
          บันทึกข้อมูลการกิน
        </button>

        <Link
          href="/showallkinkun"
          className="mt-3 text-blue-500"
        >
          กลับไปหน้าแสดงข้อมูลการกิน
        </Link>
      </div>
      <FooterSAU />
    </>
  );
}
