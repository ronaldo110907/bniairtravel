import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type DocumentType = "entry" | "qcode";

async function checkAdmin(request: NextRequest) {
  // 기존 관리자 쿠키 확인
  const adminCookie = request.cookies.get("admin_user")?.value;

  if (adminCookie !== "true") {
    return null;
  }

  // 실제 Supabase 로그인 토큰 확인
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

function getDocumentConfig(type: DocumentType) {
  if (type === "entry") {
    return {
      folder: "entry-declaration",
      column: "entry_declaration_file" as const,
    };
  }

  return {
    folder: "qcode",
    column: "qcode_file" as const,
  };
}

function isAllowedFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
    "heic",
    "heif",
    "tif",
    "tiff",
    "avif",
  ];

  const isImage =
    (file.type.startsWith("image/") && file.type !== "image/svg+xml") ||
    imageExtensions.includes(extension);

  const isPdf = file.type === "application/pdf" || extension === "pdf";

  return isImage || isPdf;
}

/* =========================================================
   파일 업로드 / 변경
========================================================= */
export async function POST(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "관리자 인증이 필요합니다." },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const reservationId = String(formData.get("reservationId") ?? "").trim();

    const documentType = String(
      formData.get("documentType") ?? "",
    ) as DocumentType;

    const file = formData.get("file");

    if (!reservationId) {
      return NextResponse.json(
        { error: "예약 ID가 없습니다." },
        { status: 400 },
      );
    }

    if (documentType !== "entry" && documentType !== "qcode") {
      return NextResponse.json(
        { error: "문서 종류가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "업로드할 파일이 없습니다." },
        { status: 400 },
      );
    }

    if (!isAllowedFile(file)) {
      return NextResponse.json(
        {
          error: "이미지 파일 또는 PDF 파일만 등록할 수 있습니다.",
        },
        { status: 400 },
      );
    }

    // 30MB 제한
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기는 30MB 이하만 가능합니다." },
        { status: 400 },
      );
    }

    const config = getDocumentConfig(documentType);

    // 기존 파일 확인
    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from("reservations")
      .select("id, entry_declaration_file, qcode_file")
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const oldPath =
      documentType === "entry"
        ? reservation.entry_declaration_file
        : reservation.qcode_file;

    const originalExtension = file.name.split(".").pop()?.toLowerCase();

    const extension =
      originalExtension || (file.type === "application/pdf" ? "pdf" : "img");

    const filePath =
      `${config.folder}/${reservationId}/` +
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 새 파일 업로드
    const { error: uploadError } = await supabaseAdmin.storage
      .from("travel-documents")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("TRAVEL DOCUMENT UPLOAD ERROR", uploadError);

      return NextResponse.json(
        { error: "파일 업로드에 실패했습니다." },
        { status: 500 },
      );
    }

    const updateData =
      documentType === "entry"
        ? {
            entry_declaration_file: filePath,
          }
        : {
            qcode_file: filePath,
          };

    // DB에 Private Storage 경로 저장
    const { error: updateError } = await supabaseAdmin
      .from("reservations")
      .update(updateData)
      .eq("id", reservationId);

    if (updateError) {
      // DB 저장 실패하면 방금 올린 파일 회수
      await supabaseAdmin.storage.from("travel-documents").remove([filePath]);

      console.error("TRAVEL DOCUMENT DB ERROR", updateError);

      return NextResponse.json(
        { error: "파일 정보 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    // 기존 파일이 있었다면 새 파일 저장 성공 후 삭제
    if (oldPath && oldPath !== filePath) {
      const { error: oldDeleteError } = await supabaseAdmin.storage
        .from("travel-documents")
        .remove([oldPath]);

      if (oldDeleteError) {
        console.error("OLD TRAVEL DOCUMENT DELETE ERROR", oldDeleteError);
      }
    }

    return NextResponse.json({
      success: true,
      path: filePath,
    });
  } catch (error) {
    console.error("TRAVEL DOCUMENT POST ERROR", error);

    return NextResponse.json(
      { error: "파일 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/* =========================================================
   Private 파일 보기 - Signed URL 생성
========================================================= */
export async function GET(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "관리자 인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const reservationId = searchParams.get("reservationId") ?? "";

    const documentType = searchParams.get("documentType") as DocumentType;

    if (!reservationId) {
      return NextResponse.json(
        { error: "예약 ID가 없습니다." },
        { status: 400 },
      );
    }

    if (documentType !== "entry" && documentType !== "qcode") {
      return NextResponse.json(
        { error: "문서 종류가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from("reservations")
      .select("entry_declaration_file, qcode_file")
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const filePath =
      documentType === "entry"
        ? reservation.entry_declaration_file
        : reservation.qcode_file;

    if (!filePath) {
      return NextResponse.json(
        { error: "등록된 파일이 없습니다." },
        { status: 404 },
      );
    }

    // 10분짜리 임시 URL
    const { data, error } = await supabaseAdmin.storage
      .from("travel-documents")
      .createSignedUrl(filePath, 60 * 10);

    if (error || !data?.signedUrl) {
      console.error("SIGNED URL ERROR", error);

      return NextResponse.json(
        { error: "파일을 불러오지 못했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl,
    });
  } catch (error) {
    console.error("TRAVEL DOCUMENT GET ERROR", error);

    return NextResponse.json(
      { error: "파일 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

/* =========================================================
   파일 삭제
========================================================= */
export async function DELETE(request: NextRequest) {
  try {
    const user = await checkAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: "관리자 인증이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const reservationId = String(body.reservationId ?? "");

    const documentType = body.documentType as DocumentType;

    if (!reservationId) {
      return NextResponse.json(
        { error: "예약 ID가 없습니다." },
        { status: 400 },
      );
    }

    if (documentType !== "entry" && documentType !== "qcode") {
      return NextResponse.json(
        { error: "문서 종류가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const { data: reservation, error: reservationError } = await supabaseAdmin
      .from("reservations")
      .select("entry_declaration_file, qcode_file")
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const filePath =
      documentType === "entry"
        ? reservation.entry_declaration_file
        : reservation.qcode_file;

    if (filePath) {
      const { error: removeError } = await supabaseAdmin.storage
        .from("travel-documents")
        .remove([filePath]);

      if (removeError) {
        console.error("TRAVEL DOCUMENT DELETE ERROR", removeError);

        return NextResponse.json(
          { error: "파일 삭제에 실패했습니다." },
          { status: 500 },
        );
      }
    }

    const updateData =
      documentType === "entry"
        ? {
            entry_declaration_file: null,
          }
        : {
            qcode_file: null,
          };

    const { error: updateError } = await supabaseAdmin
      .from("reservations")
      .update(updateData)
      .eq("id", reservationId);

    if (updateError) {
      return NextResponse.json(
        { error: "파일 정보 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("TRAVEL DOCUMENT DELETE ERROR", error);

    return NextResponse.json(
      { error: "파일 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
