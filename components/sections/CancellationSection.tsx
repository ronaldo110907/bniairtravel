"use client";

const rules=[
["예약 후 다음날 ~ 출발 60일 전","예약금 환불 불가"],
["59일 ~ 45일 전","총 여행경비의 30%"],
["44일 ~ 30일 전","총 여행경비의 50%"],
["29일 ~ 21일 전","총 여행경비의 60%"],
["20일 ~ 15일 전","총 여행경비의 70%"],
["14일 ~ 1일 전","총 여행경비의 80%"],
["출발 당일","총 여행경비의 100%"],
];

export default function CancellationSection(){
return(
<section className="mx-auto max-w-6xl py-24">
<div className="text-center mb-14">
<p className="text-sm tracking-[0.35em] text-[#B88A44]">CANCELLATION POLICY</p>
<h2 className="mt-3 text-4xl font-bold">전세기 특별약관 및 취소규정</h2>
</div>

<div className="rounded-3xl border border-amber-300 bg-amber-50 p-8">
<h3 className="text-2xl font-bold text-amber-900">전세기 특별약관</h3>
<p className="mt-4 leading-8 text-gray-700">
본 상품은 전세기 상품으로 국외여행 표준약관이 아닌 전세기 특별약관이 적용됩니다.
취소 시 일반 상품보다 높은 취소수수료가 발생할 수 있습니다.
</p>
</div>

<div className="mt-8 rounded-3xl border bg-white p-8">
<h3 className="text-xl font-bold">계약금 안내</h3>
<ul className="mt-5 list-disc space-y-2 pl-5 text-gray-600 leading-7">
<li>예약일 기준 3일 이내 1인당 계약금 200,000원 입금</li>
<li>기한 내 미입금 시 예약이 자동 취소될 수 있습니다.</li>
<li>취소규정 적용기간 예약 시 계약금보다 취소료가 큰 경우 해당 취소료가 적용됩니다.</li>
</ul>
</div>

<div className="mt-8 overflow-hidden rounded-3xl border bg-white">
<table className="w-full">
<thead className="bg-[#C8A15A] text-white">
<tr>
<th className="p-4 text-left">취소 시점</th>
<th className="p-4 text-left">취소 수수료</th>
</tr>
</thead>
<tbody>
{rules.map(([d,f],i)=>(
<tr key={i} className="border-t even:bg-[#FCFAF7]">
<td className="p-4 font-medium">{d}</td>
<td className="p-4">{f}</td>
</tr>
))}
</tbody>
</table>
</div>

<div className="mt-8 rounded-3xl bg-red-50 border border-red-200 p-6">
<p className="font-bold text-red-700">※ 중요 안내</p>
<p className="mt-3 leading-7 text-gray-700">
항공 좌석 및 호텔 객실을 사전 확보한 전세기 상품으로 취소 시 위 특별약관이 적용됩니다.
예약 전 반드시 취소규정을 확인해 주시기 바랍니다.
</p>
</div>

</section>
)}
