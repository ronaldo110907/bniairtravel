type PersonFormProps = {
  person: any;
  setPerson: React.Dispatch<React.SetStateAction<any>>;
};

export default function PersonForm({ person, setPerson }: PersonFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          한글 이름
        </label>

        <input
          className="
        w-full
        rounded-lg
        border
        px-3
        py-2
        "
          value={person.name}
          onChange={(e) =>
            setPerson({
              ...person,
              name: e.target.value,
            })
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          영문 이름
        </label>

        <input
          className="
    w-full
    rounded-lg
    border
    px-3
    py-2
    "
          value={person.passport_name || ""}
          onChange={(e) =>
            setPerson({
              ...person,
              passport_name: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          성별
        </label>

        <select
          className="
w-full
rounded-lg
border
px-3
py-2
"
          value={person.passport_sex || ""}
          onChange={(e) =>
            setPerson({
              ...person,
              passport_sex: e.target.value,
            })
          }
        >
          <option value="">선택</option>
          <option value="MR">MR</option>
          <option value="MS">MS</option>
          <option value="MSTR">MSTR</option>
          <option value="MISS">MISS</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          생년월일
        </label>

        <input
          type="date"
          className="
    w-full
    rounded-lg
    border
    px-3
    py-2
    "
          value={person.passport_birth || ""}
          onChange={(e) =>
            setPerson({
              ...person,
              passport_birth: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          여권번호
        </label>

        <input
          className="
    w-full
    rounded-lg
    border
    px-3
    py-2
    "
          value={person.passport_number || ""}
          onChange={(e) =>
            setPerson({
              ...person,
              passport_number: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          국적
        </label>

        <input
          className="
    w-full
    rounded-lg
    border
    px-3
    py-2
    "
          value={person.passport_nationality || ""}
          onChange={(e) =>
            setPerson({
              ...person,
              passport_nationality: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          발급일
        </label>

        <input
          type="date"
          className="
    w-full
    rounded-lg
    border
    px-3
    py-2
    "
          value={person.passport_issue || ""}
          onChange={(e) =>
            setPerson({
              ...person,
              passport_issue: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-gray-700">
          만료일
        </label>

        <input
          type="date"
          className="
    w-full
    rounded-lg
    border
    px-3
    py-2
    "
          value={person.passport_expiry || ""}
          onChange={(e) =>
            setPerson({
              ...person,
              passport_expiry: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
