"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { faqs } from "@/data/zhangjiajie";

export default function FAQSection(){

 const [open,setOpen]=useState<number|null>(0);
 return(
<section className="mx-auto max-w-5xl py-24">
<div className="text-center mb-12">
<p className="text-sm tracking-[0.35em] text-[#B88A44]">FAQ</p>
<h2 className="mt-3 text-4xl font-bold">자주 묻는 질문</h2>
<p className="mt-4 text-gray-500">예약 전 가장 많이 문의하시는 내용을 모았습니다.</p>
</div>

<div className="space-y-4">
{faqs.map((f,i)=>(
<div key={i} className="overflow-hidden rounded-2xl border border-[#ECE7DF] bg-white shadow-sm">
<button onClick={()=>setOpen(open===i?null:i)}
className="flex w-full items-center justify-between p-6 text-left">
<span className="font-semibold">{f.question}</span>
<ChevronDown className={`transition ${open===i?"rotate-180":""}`}/>
</button>
<div className={`grid transition-all duration-300 ${open===i?"grid-rows-[1fr]":"grid-rows-[0fr]"}`}>
<div className="overflow-hidden">
<p className="border-t bg-[#FCFAF7] p-6 leading-7 text-gray-600">{f.answer}</p>
</div>
</div>
</div>
))}
</div>
</section>
)}
