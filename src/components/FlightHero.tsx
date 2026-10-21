'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';

const FRAMES = 120;
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const frameSrc = (i: number) => `${base}/flight/${String(i).padStart(3, '0')}.webp`;

export function FlightHero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const current = useRef(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  // последние 12% скролла камера уже в комнате и стоит
  const frame = useTransform(scrollYProgress, [0, 0.88], [0, FRAMES - 1], { clamp: true });

  const introOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.18], [0, -60]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1]);
  const outroY = useTransform(scrollYProgress, [0.8, 0.92], [40, 0]);

  const draw = (index: number) => {
    const c = canvas.current;
    // если нужный кадр ещё грузится, показываем ближайший загруженный до него
    let i = index;
    while (i > 0 && !images.current[i]?.complete) i--;
    const img = images.current[i];
    if (!c || !img?.complete || !img.naturalWidth) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
  };

  useEffect(() => {
    images.current = Array.from({ length: FRAMES }, (_, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = frameSrc(i);
      img.onload = () => {
        if (i <= current.current) draw(current.current);
      };
      return img;
    });

    const resize = () => {
      const c = canvas.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw(current.current);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useMotionValueEvent(frame, 'change', (v) => {
    const i = Math.round(v);
    if (i === current.current) return;
    current.current = i;
    requestAnimationFrame(() => draw(i));
  });

  return (
    <section id="top" ref={section} className="relative h-[480vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-night/40" />

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="absolute inset-x-0 bottom-[14vh] mx-auto max-w-[1600px] px-4 md:px-10"
        >
          <p className="eyebrow inline-flex items-center gap-3 rounded-full border border-copper/60 bg-night/40 px-4 py-2 text-copper backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-copper" />
            Сдача в 2027 году
          </p>
          <h1 className="display mt-5 text-[17vw] leading-[0.86] md:text-[9.5vw]">
            Медный
            <br />
            сад
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[460px] text-[15px] font-light leading-relaxed text-cream/85 md:text-base">
              Жилой комплекс на берегу реки. Башни-лепестки в медных фасадах, сады на террасах и закаты
              в панорамных окнах. Ключи — в 2027 году.
            </p>
            <a
              href="#flats"
              className="eyebrow pointer-events-auto self-start rounded-full bg-copper px-7 py-4 text-night transition-colors hover:bg-cream md:self-auto"
            >
              Выбрать квартиру
            </a>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: hintOpacity }}
          className="eyebrow absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-cream/60"
        >
          Листайте — заглянем внутрь
        </motion.div>

        <motion.div
          style={{ opacity: outroOpacity, y: outroY }}
          className="pointer-events-none absolute inset-x-0 bottom-[12vh] mx-auto max-w-[1600px] px-4 text-center md:px-10"
        >
          <p className="eyebrow text-copper">Квартиры с видом на реку</p>
          <h2 className="display mt-4 text-[11vw] leading-[0.9] md:text-[6vw]">Вы дома</h2>
        </motion.div>
      </div>
    </section>
  );
}
