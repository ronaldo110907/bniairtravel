"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const destinations = [
  {
    title: "장가계",
    subtitle: "UNESCO WORLD HERITAGE",
    description: "하늘이 빚어낸 절경을 걷다.",
    image: "/images/zhangjiajie/cover.jpg",
    tags: ["🏔 자연절경", "🚠 천문산", "🌉 유리다리"],
  },
  {
    title: "백두산",
    subtitle: "MOUNTAIN OF HEAVEN",
    description: "천지를 마주하는 순간, 평생 잊지 못할 감동.",
    image: "/images/baekdu/cover.jpg",
    tags: ["🌋 천지", "🌲 원시림", "❄ 사계절"],
  },
  {
    title: "상해",
    subtitle: "MODERN SHANGHAI",
    description: "과거와 미래가 공존하는 도시.",
    image: "/images/shanghai/cover.jpg",
    tags: ["🌃 야경", "🛍 쇼핑", "🍜 미식"],
  },
  {
    title: "항주",
    subtitle: "BEAUTIFUL HANGZHOU",
    description: "한 폭의 수묵화 속으로.",
    image: "/images/hangzhou/cover.jpg",
    tags: ["🌿 서호", "🏯 역사", "☕ 여유"],
  },
];
return (
<section className="bg-white py-32">

<div className="mx-auto max-w-7xl px-6">

<div className="mb-28 text-center">

<p className="tracking-[8px] text-yellow-600 uppercase">
Discover China
</p>

<h2 className="mt-5 text-5xl font-black">
당신이 꿈꾸던 중국을 만나다.
</h2>

</div>
{destinations.map((item,index)=>(

<div
key={item.title}
className={`mb-40 grid items-center gap-20 lg:grid-cols-2 ${
index % 2 !==0 ? "lg:[&>*:first-child]:order-2" : ""
}`}
></div>
<motion.div

initial={{opacity:0,scale:0.9}}

whileInView={{opacity:1,scale:1}}

transition={{duration:0.8}}

viewport={{once:true}}

className="overflow-hidden rounded-3xl"
>

<Image

src={item.image}

alt={item.title}

width={900}

height={700}

className="h-[550px] w-full object-cover transition duration-700 hover:scale-105"

/>

</motion.div>
<motion.div

initial={{opacity:0,y:60}}

whileInView={{opacity:1,y:0}}

transition={{duration:0.8}}

viewport={{once:true}}

></motion.div>
<p className="tracking-[6px] text-yellow-600 uppercase">

{item.subtitle}

</p>
<h3 className="mt-5 text-5xl font-black">

{item.title}

</h3>
<p className="mt-8 text-xl leading-9 text-gray-600">

{item.description}

</p>
<div className="mt-10 flex flex-wrap gap-3">

{item.tags.map(tag=>(

<span

key={tag}

className="rounded-full bg-gray-100 px-5 py-3"

>

{tag}

</span>

))}

</div>
<button className="mt-12 rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-yellow-500">

여행 둘러보기 →

</button>
</motion.div>

</div>

))}

</div>

</section>
);