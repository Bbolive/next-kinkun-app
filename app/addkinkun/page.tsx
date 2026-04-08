"use client";

import logoimg from "@/assets/logo.png";
import FooterSAU from "@/components/FooterSAU";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  //สร้าง state เพื่อจัดการกับข้อมูลใน component
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [foodImageFile, setFoodImageFile] = useState<File | null>(null); //เก็บตัวรูปที่เลือก
  const [imagePreview, setImagePreview] = useState<string | null>(null); //เก็บที่อยู่ของรูปที่จะแสดง

  //ฟังก์ชันเลือกรูป และแสดงรูป
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; //e.target.files?.[0] คือ รูปที่เลือก

    if (file) {
      setFoodImageFile(file); //เอารูปกำหนดให้กับ foodImageFile
      setImagePreview(URL.createObjectURL(file)); //เอาตำแหน่งรูปกำหนดให้กับ imagePreview
    }
  };

  //ฟังก์ชันบันทึกข้อมูลเพื่อส่งรูปไป storage:bucket(task_tb) และบันทึกข้อมูลไปยัง database:table(task_tb)
  const handleSaveClick = async () => {
    const priceNumber = Number(price);

    if (
      title === "" ||
      location === "" ||
      price === "" ||
      isNaN(priceNumber) ||
      foodImageFile === null
    ) {
      Swal.fire({
        title: "คำเตือน",
        text: "กรุณาตรวจสอบข้อมูล",
        icon: "warning",
      });
      return;
    }

    //อัปโหลดรูปไปยัง storage:bucket(task_tb) และ Get image url ของรูปเพื่อไปใช้บันทึกลง database
    let food_image_url = ""; //ตัวแปรเก็บที่อยู่รูป

    const new_file_name = `${Date.now()}_${foodImageFile.name}`; //เปลี่ยนชื่อรูป

    //อัปโหลด
    const { error: error1 } = await supabase.storage
      .from("kinkun_bk")
      .upload(new_file_name, foodImageFile);

    if (error1) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    //ไปเอา image url ของรูปที่อัปโหลด
    const { data } = await supabase.storage
      .from("kinkun_bk")
      .getPublicUrl(new_file_name);

    food_image_url = data.publicUrl;

    //บันทึกข้อมูลไปยัง database:table(task_tb)
    const { error: error2 } = await supabase.from("kinkun_tb").insert({
      food_name: title,
      food_where: location,
      food_pay: priceNumber,
      food_image_url: food_image_url,
    });

    if (error2) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    Swal.fire({
      title: "ผลการทำงาน",
      text: "บันทึกข้อมูลเรียบร้อย",
      icon: "success",
      confirmButtonText: "ตกลง",
    });

    //แล้วย้อนกลับไปหน้า /showallkinkun
    router.push("/showallkinkun");
  };

  return (
    <>
      <div
        className="w-3/5 mt-20 p-10 shadow-xl mx-auto mb-10
                      border border-gray-400 rounded-xl
                      flex flex-col justify-center items-center"
      >
        {/* แสดงชื่อแอปฯ + การทำงาน */}
        <h1 className=" text-xl font-bold text-blue-700">
          Kinkun APP (Supabase)
        </h1>
        <h1 className=" text-xl font-bold text-blue-700">เพิ่มข้อมูลการกิน</h1>
        {/* แสดงรูปจาก assets ในโปรเจ็กต์ */}
        <Image
          className="mt-5"
          src={logoimg}
          alt="logo"
          width={100}
          height={100}
        />

        {/* ส่วนของการป้อนงาน และรายละเอียดงาน */}
        <div className="w-full flex flex-col mt-5">
          <h1>ชื่อเมนูอาหาร</h1>
          <input
            type="text"
            placeholder="เช่น Pizza, KFC,..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border border-gray-700 rounded mt-1 mb-2"
          />
          <h1>สถานที่</h1>
          <input
            type="text"
            placeholder="เช่น KFC, The Pizza Company,..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-2 border border-gray-700 rounded mt-1 mb-2"
          />
          <h1>ราคา(บาท)</h1>
          <input
            type="number"
            placeholder="เช่น 100, 150.00,..."
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 border border-gray-700 rounded mt-1 mb-2"
          />
        </div>

        {/* ส่วนเลือกรูป และแสดงรูป */}
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
            className="px-4 py-2 bg-blue-600 text-white
                              rounded mt-1 mb-2 w-30 text-center"
          >
            เลือกรูป
          </label>
          {/* แสดงรูป */}
          {
            //ตรวจสอบว่ามีการเลือกรูปหรือไม่จาก imagePreview
            imagePreview && (
              <Image
                src={imagePreview}
                alt="preview"
                width={150}
                height={150}
              />
            )
          }
        </div>

        {/* ส่วนปุ่มบันทึกงานใหม่ */}
        <button
          onClick={handleSaveClick}
          className="w-full px-4 py-2 bg-blue-600 text-white
                        hover:bg-blue-600 rounded mt-5 cursor-pointer"
        >
          บันทึกข้อมูลการกิน
        </button>

        {/* ส่วนปุ่มกลับไปหน้า /showallkinkun */}
        <Link href={"/showallkinkun"} className="mt-3 text-blue-500">
          กลับไปหน้าแสดงข้อมูลการกิน
        </Link>
      </div>

      {/* ส่วนของ Footer */}
      <FooterSAU />
    </>
  );
}
