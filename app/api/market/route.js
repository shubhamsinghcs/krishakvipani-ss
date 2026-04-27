import { NextResponse } from "next/server";

// Mock Database
let cropsDatabase = [
  { id: "1", crop: "बासमती धान 1121", quantity: "150", price: "4500", location: "राजपुरा, पंजाब", phone: "+919876543210" },
  { id: "2", crop: "देसी कपास", quantity: "40", price: "7200", location: "मानसा, पंजाब", phone: "+919876543211" },
  { id: "3", crop: "गेहूं (HD-2967)", quantity: "300", price: "2400", location: "पटियाला, पंजाब", phone: "+919876543212" },
];

export async function GET() {
  return NextResponse.json({ success: true, crops: cropsDatabase });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { crop, quantity, price, location, phone } = body;
    
    if (!crop || !quantity || !price || !location || !phone) {
      return NextResponse.json({ success: false, message: "सभी फ़ील्ड आवश्यक हैं।" }, { status: 400 });
    }

    const newCrop = {
      id: Date.now().toString(),
      crop, quantity, price, location, phone
    };

    cropsDatabase = [newCrop, ...cropsDatabase];

    return NextResponse.json({ success: true, crop: newCrop });
  } catch (error) {
    return NextResponse.json({ success: false, message: "सर्वर त्रुटि" }, { status: 500 });
  }
}
