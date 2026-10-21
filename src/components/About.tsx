'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const STATS = [
  { value: '85%', label: ['квартир', 'с видом на реку'] },
  { value: '4 га', label: ['садов', 'и набережной'] },
];

export function About() {
  const photo = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photo, offset: ['start end', 'end start'] });
  // фото чуть отстаёт от скролла — как в окне
  const photoY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    // наезжает снизу на последний кадр пролёта: секция пролёта ещё держит кадр, пока этот блок поднимается
    <section
      id="about"
      data-theme="light"
      className="relative z-10 -mt-[100svh] rounded-t-[28px] bg-cream text-night shadow-[0_-30px_80px_rgba(0,0,0,0.45)] md:rounded-t-[40px]"
    >
      <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-24 md:px-10 md:pb-36 md:pt-36">
        <p className="mx-auto max-w-[900px] text-center text-[15px] font-medium uppercase leading-[1.7] tracking-[0.08em] md:text-[19px]">
          «Медный сад» — квартал на берегу реки, где архитектура продолжает природу. Башни раскрываются
          лепестками, на террасах растут сады, а закат заходит в каждую гостиную.
        </p>

        <div className="mt-20 grid gap-12 md:mt-28 md:grid-cols-12 md:gap-10">
          <div ref={photo} className="relative aspect-[4/5] overflow-hidden md:col-span-6">
            <motion.img
              src={`${base}/about/architecture.webp`}
              alt="Башни «Медного сада» на берегу реки"
              style={{ y: photoY, scale: 1.18 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col md:col-span-5 md:col-start-8 md:pt-6">
            <p className="eyebrow text-night/50">Архитектура</p>
            <h2 className="display mt-5 text-[34px] leading-[1.05] md:text-[44px]">
              Фасады,
              <br />
              вдохновлённые лепестками
            </h2>
            <div className="mt-8 space-y-5 text-[15px] font-light leading-relaxed text-night/75 md:text-base">
              <p>
                Башни одеты в медные ламели, которые повторяют изгиб лепестка: к вершине силуэт сужается, а
                линии становятся мягче. Днём медь отражает небо, вечером светится вместе с закатом.
              </p>
              <p>
                Между башнями — мосты-галереи с садами и прогулочными тропами. Двор поднят над землёй и
                закрыт от машин: внизу остаются только набережная и парк.
              </p>
            </div>

            <dl className="mt-auto grid grid-cols-2 gap-6 pt-14">
              {STATS.map((s) => (
                <div key={s.value} className="flex items-end gap-3">
                  <dt className="display whitespace-nowrap text-[44px] leading-[0.85] md:text-[72px]">{s.value}</dt>
                  <dd className="pb-1 text-[12px] leading-tight text-night/60">
                    {s.label[0]}
                    <br />
                    {s.label[1]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <h2 className="display mt-28 text-center text-[15vw] leading-[0.9] text-copper md:mt-40 md:text-[10vw]">
          Вид на реку
        </h2>
      </div>
    </section>
  );
}
