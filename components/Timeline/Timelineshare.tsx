type Props = {
  productSlug: string;
  course: "3N4D" | "4N5D";
};

export default function TimelineShare({ productSlug, course }: Props) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button
        type="button"
        className="
          rounded-xl
          bg-blue-600
          px-5
          py-3
          text-sm
          font-bold
          text-white
          hover:bg-blue-700
          transition
        "
      >
        📧 이메일 보내기
      </button>

      <button
        type="button"
        className="
          rounded-xl
          border
          border-gray-300
          bg-white
          px-5
          py-3
          text-sm
          font-bold
          hover:bg-gray-50
          transition
        "
      >
        🔗 링크 복사
      </button>
    </div>
  );
}
