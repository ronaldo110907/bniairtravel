export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 animate-pulse">
      <div className="mb-6 h-10 w-72 rounded bg-gray-300" />

      <div className="grid gap-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 h-6 w-40 rounded bg-gray-300" />
          <div className="space-y-3">
            <div className="h-16 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 h-6 w-40 rounded bg-gray-300" />
          <div className="space-y-3">
            <div className="h-16 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_2fr]">
          <div className="h-52 rounded-xl bg-white shadow" />
          <div className="h-52 rounded-xl bg-white shadow" />
          <div className="h-52 rounded-xl bg-white shadow" />
        </div>

        <div className="h-28 rounded-xl bg-white shadow" />

        <div className="h-64 rounded-xl bg-white shadow" />
      </div>
    </div>
  );
}
