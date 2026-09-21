import Link from "next/link";

const guides = [
  {
    episode: 1,
    title: "예약관리 편",
    description: "예약 확인부터 예약자 수정까지",
    image: "admin1.png",
  },
  {
    episode: 2,
    title: "출발일 관리 편",
    description: "출발일 생성과 공유좌석 주의사항",
    image: "admin2.png",
  },
  {
    episode: 3,
    title: "달력 사용법 편",
    description: "출발상품과 예약현황을 한눈에 확인",
    image: "admin3.png",
  },
  {
    episode: 4,
    title: "예약별 정산 편",
    description: "판매금액 · 비용 · 입금내역 · 수익 확인",
    image: "admin4.png",
  },
  {
    episode: 5,
    title: "출발일 총정산 편",
    description: "출발일 전체 판매 · 지출 · 최종 수익 확인",
    image: "admin5.png",
  },
  {
    episode: 6,
    title: "인보이스 편",
    description: "계약금 · 잔금 인보이스 발행 방법",
    image: "admin6.png",
  },
  {
    episode: 7,
    title: "수배의뢰서 편",
    description: "명단 정리부터 항공 스케줄까지 한 번에",
    image: "admin7.png",
  },
  {
    episode: 8,
    title: "일정 이메일 발송 편",
    description: "상품 일정과 안내사항을 이메일로 발송",
    image: "admin8.png",
  },
  {
    episode: 9,
    title: "긴급특가 관리 편",
    description: "긴급특가 등록부터 홈페이지 노출 · 순서 관리까지",
    image: "admin9.png",
  },
  {
    episode: 10,
    title: "상품 등록 관리 편",
    description:
      "상품 상세페이지 제작 요청부터 상품 등록 · 판매설정 · 출발일 관리 연결까지",
    image: "admin10.png",
  },
  {
    episode: 11,
    title: "견적서 만들기 편",
    description:
      "기존 상품 일정 불러오기부터 맞춤 견적 작성 · 금액 입력 · PDF 출력까지",
    image: "admin11.png",
  },
  {
    episode: 12,
    title: "거래처 관리 편",
    description:
      "거래처 등록부터 예약 등록 시 한 글자 자동 검색 · 선택 연결 · 사용여부 관리까지",
    image: "admin12.png",
  },
  {
    episode: 13,
    title: "관리자 사고방지 총정리 편",
    description:
      "1~12화 핵심 주의사항과 실수하기 쉬운 관리자 기능을 한 번에 최종 점검",
    image: "admin13.png",
  },
];

const STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/useadmin`;

export default function AdminGuidePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* 상단 */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-sm font-semibold text-blue-600">
              BNI ADMIN GUIDE
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              📘 웹툰으로 보는 관리자 페이지 사용법
            </h1>

            <p className="mt-2 text-gray-500">
              필요한 기능을 선택하면 웹툰으로 쉽고 빠르게 확인할 수 있습니다.
            </p>
          </div>

          <Link
            href="/admin"
            className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            ← 관리자 메인으로
          </Link>
        </div>

        {/* 안내 */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-900">
          💡 처음 사용하는 기능이 있다면 아래 제목을 확인한 후 해당 웹툰을
          열어보세요.
        </div>

        {/* 웹툰 목록 */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => {
            const imageUrl = `${STORAGE_URL}/${guide.image}`;

            return (
              <a
                key={guide.episode}
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* 썸네일 */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={`${guide.episode}화 ${guide.title}`}
                    className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                {/* 내용 */}
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                      {guide.episode}화
                    </span>

                    <h2 className="text-lg font-bold text-gray-900">
                      {guide.title}
                    </h2>
                  </div>

                  <p className="text-sm leading-6 text-gray-500">
                    {guide.description}
                  </p>

                  <div className="mt-4 text-sm font-semibold text-blue-600">
                    웹툰 크게 보기 →
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
}
