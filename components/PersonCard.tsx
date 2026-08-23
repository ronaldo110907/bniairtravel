type ReservationPeople = {
  id: string;
  reservation_id: string;
  name: string;
  passport_image: string | null;
  passport_name: string | null;
  passport_number: string | null;
  passport_birth: string | null;
  passport_expiry: string | null;
  passport_issue: string | null;
  passport_sex: string | null;
  passport_nationality: string | null;
  sort_order: number;
  is_guide: boolean;
};

export type PersonCardProps = {
  person: ReservationPeople;
  index: number;
  totalPeople: number;
  openPersonId: string | null;

  onToggle: (id: string) => void;
  onMakePrimary: (person: ReservationPeople) => Promise<void>;
  onMoveUp: (person: ReservationPeople) => Promise<void>;
  onMoveDown: (person: ReservationPeople) => Promise<void>;
  onEdit: (person: ReservationPeople) => void;
  onDelete: (id: string) => Promise<void>;
  onUpload: (person: ReservationPeople, file: File) => Promise<void>;
  onPreview: (image: string) => void;
};

export default function PersonCard({
  person,
  index,
  totalPeople,
  openPersonId,
  onToggle,
  onMakePrimary,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onUpload,
  onPreview,
}: PersonCardProps) {
  const isOpen = openPersonId === person.id;
  void person;
  void index;
  void totalPeople;
  void onMakePrimary;
  void onMoveUp;
  void onMoveDown;
  void onEdit;
  void onDelete;
  void onUpload;
  void onPreview;

  return (
    <div
      className="
      rounded-xl
      border
      bg-white
      p-4
    "
    >
      <div
        className="
        mb-3
        flex
        cursor-pointer
        items-center
        justify-between
        rounded-lg
        bg-gray-100
        p-3
      "
      >
        <div className="flex items-center gap-2">
          {index === 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
              대표예약자
            </span>
          )}

          <div className="font-bold">{person.name}</div>

          {person.is_guide && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              👤 인솔자
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {index !== 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void onMakePrimary(person);
              }}
              className="
        rounded-full
        bg-indigo-600
        px-2
        py-0.5
        text-xs
        font-bold
        text-white
      "
            >
              👑 대표로 변경
            </button>
          )}
          {index > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void onMoveUp(person);
              }}
              className="
      rounded-full
      bg-gray-600
      px-2
      py-0.5
      text-xs
      font-bold
      text-white
    "
            >
              ▲
            </button>
          )}

          {index > 0 && index < totalPeople - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void onMoveDown(person);
              }}
              className="
      rounded-full
      bg-gray-600
      px-2
      py-0.5
      text-xs
      font-bold
      text-white
    "
            >
              ▼
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggle(person.id)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            {isOpen ? "접기" : "상세보기"}
          </button>
          <span
            className={
              person.passport_image
                ? "rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white"
                : "rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-white"
            }
          >
            {person.passport_image ? "여권등록" : "미등록"}
          </span>
        </div>
      </div>
      {isOpen && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <div className="text-xs text-gray-500">한글이름</div>
              <div className="font-semibold">{person.name || "-"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">영문이름</div>
              <div className="font-semibold">{person.passport_name || "-"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">성별</div>
              <div className="font-semibold">{person.passport_sex || "-"}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">생년월일</div>
              <div className="font-semibold">
                {person.passport_birth || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">여권번호</div>
              <div className="font-semibold">
                {person.passport_number || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">국적</div>
              <div className="font-semibold">
                {person.passport_nationality || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">발급일</div>
              <div className="font-semibold">
                {person.passport_issue || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">만료일</div>
              <div className="font-semibold">
                {person.passport_expiry || "-"}
              </div>
            </div>
          </div>
        </>
      )}
      {person.passport_image && (
        <div className="mt-4">
          <img
            src={person.passport_image}
            alt="여권"
            className="w-48 rounded-lg border"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label
          className="
            inline-block
            cursor-pointer
            rounded-lg
            bg-green-600
            px-3
            py-1
            text-sm
            font-bold
            text-white
          "
        >
          여권 등록
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              void onUpload(person, file);

              e.target.value = "";
            }}
          />
        </label>

        {person.passport_image && (
          <button
            type="button"
            onClick={() => onPreview(person.passport_image!)}
            className="
              rounded-lg
              bg-indigo-600
              px-3
              py-1
              text-sm
              font-bold
              text-white
              hover:bg-indigo-700
            "
          >
            👁 여권보기
          </button>
        )}

        <button
          type="button"
          onClick={() => onEdit(person)}
          className="
            rounded-lg
            bg-blue-500
            px-3
            py-1
            text-sm
            font-bold
            text-white
          "
        >
          수정
        </button>

        <button
          type="button"
          onClick={() => {
            if (index === 0) {
              alert(
                "대표예약자는 삭제할 수 없습니다.\n\n다른 예약자를 대표예약자로 변경한 후 삭제해주세요.",
              );

              return;
            }

            void onDelete(person.id);
          }}
          className="
            rounded-lg
            bg-red-500
            px-3
            py-1
            text-sm
            font-bold
            text-white
          "
        >
          삭제
        </button>
      </div>
    </div>
  );
}
