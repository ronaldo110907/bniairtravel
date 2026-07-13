"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Departure = {
  id: string;
  departure_date: string;
  price: number;
  seat: number;
  airline: string;
  status: string;
  products: {
    title: string;
  };
};

export default function DeparturesPage() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartures();
  }, []);

  async function loadDepartures() {
    const { data, error } = await supabase
      .from("departures")
      .select(`
        *,
        products(title)
      `)
      .order("departure_date", {
        ascending: true,
      });

    if (error) {
      console.error("DEPARTURES ERROR", error);
      alert(error.message);
      setDepartures([]);
    } else {
      console.log("DEPARTURES DATA", data);
      setDepartures((data as Departure[]) || []);
    }
    setLoading(false);
  }

  async function deleteDeparture(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;

    await supabase
      .from("departures")
      .delete()
      .eq("id", id);

    loadDepartures();
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-8">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-3xl font-bold">
              출발일 관리
            </h1>

            <p className="text-gray-500 mt-2">
              상품별 출발일 관리
            </p>

          </div>

          <Link
            href="/admin/departures/new"
            className="bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            출발일 등록
          </Link>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left px-6 py-4">
                  상품
                </th>

                <th className="text-left px-6 py-4">
                  출발일
                </th>

                <th className="text-left px-6 py-4">
                  가격
                </th>

                <th className="text-center px-6 py-4">
                  좌석
                </th>

                <th className="text-center px-6 py-4">
                  항공사
                </th>

                <th className="text-center px-6 py-4">
                  상태
                </th>

                <th className="text-center px-6 py-4">
                  관리
                </th>

              </tr>

            </thead>

            <tbody>

              {departures.map((item) => (

                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="px-6 py-5 font-semibold">
                    {item.products?.title}
                  </td>

                  <td className="px-6">
                    {item.departure_date}
                  </td>

                  <td className="px-6">
                    {item.price.toLocaleString()}원
                  </td>

                  <td className="text-center">
                    {item.seat}
                  </td>

                  <td className="text-center">
                    {item.airline}
                  </td>

                  <td className="text-center">
                    {item.status}
                  </td>

                  <td>

                    <div className="flex justify-center gap-4">

                      <Link
                        href={`/admin/departures/${item.id}`}
                      >
                        <Pencil
                          size={18}
                          className="text-blue-600"
                        />
                      </Link>

                      <button
                        onClick={() =>
                          deleteDeparture(item.id)
                        }
                      >
                        <Trash2
                          size={18}
                          className="text-red-600"
                        />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}