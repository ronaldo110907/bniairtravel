import { NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

export const runtime = "nodejs";
export async function POST(request: Request) {

  try {

    const { imageUrl } =
      await request.json();


    if (!imageUrl) {
      return NextResponse.json(
        {
          error: "이미지 없음",
        },
        {
          status: 400,
        }
      );
    }


    console.log("OCR START");


    const worker = await createWorker("eng", 1, {
      logger: (m: any) => {
        console.log(m);
      },
    });


    const result =
      await worker.recognize(imageUrl);


    await worker.terminate();


    console.log("OCR COMPLETE");


    return NextResponse.json({
      text: result.data.text,
    });


  } catch (error) {

    console.error(
      "OCR ERROR",
      error
    );


    return NextResponse.json(
      {
        error: "OCR 실패",
      },
      {
        status: 500,
      }
    );

  }

}