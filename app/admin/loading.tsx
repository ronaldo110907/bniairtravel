export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
        <div className="mb-4 text-5xl">✈️</div>

        <h2 className="text-2xl font-bold">
          관리자 페이지를 준비하고 있습니다.
        </h2>

        <p className="mt-4 text-gray-500">
          최초 접속 시 서버 준비로 인해
          <br />약 20~30초 정도 소요될 수 있습니다.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      </div>
    </div>
  );
}
