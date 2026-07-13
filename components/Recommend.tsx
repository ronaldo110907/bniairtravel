"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {supabase} from '@/lib/supabase';

type Product={id:string;slug:string;title:string;subtitle:string|null;price:number|null;thumbnail:string|null;is_best:boolean;};

export default function Recommend(){
 const [products,setProducts]=useState<Product[]>([]);
 useEffect(()=>{(async()=>{
 const {data}=await supabase.from('products').select('id,slug,title,subtitle,price,thumbnail,is_best,is_visible,sort').eq('is_visible',true).order('sort');
 setProducts((data as Product[])||[]);
 })();},[]);
 return <section className='max-w-7xl mx-auto px-6 py-16'>
 <h2 className='text-4xl font-bold mb-8'>추천 여행상품</h2>
 <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-3'>
 {products.map(p=><Link key={p.id} href={`/${p.slug}`} className='rounded-2xl overflow-hidden bg-white shadow hover:shadow-xl'>
 <div className='relative h-64'>
 <Image src={p.thumbnail||'/images/no-image.jpg'} alt={p.title} fill unoptimized className='object-cover'/>
 {p.is_best && <span className='absolute left-3 top-3 bg-red-600 text-white px-3 py-1 rounded-full'>BEST</span>}
 </div>
 <div className='p-6'>
 <h3 className='text-2xl font-bold'>{p.title}</h3>
 {p.subtitle && <p className='mt-2 text-gray-500'>{p.subtitle}</p>}
 <div className='mt-5 flex justify-between items-end'>
 <span className='text-2xl font-bold text-blue-600'>{p.price?`${p.price.toLocaleString()}원~`:'문의'}</span>
 <span className='bg-black text-white px-4 py-2 rounded-lg'>자세히 보기</span>
 </div>
 </div></Link>)}
 </div></section>
}
