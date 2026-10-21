'use client';

import { useEffect, useRef, useState } from 'react';
import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
// ролики идут встык: пролёт в квартиру, проезд к столу, наезд камеры на обивку стула
const CLIPS = [
  { dir: 'flight', frames: 120 },
  { dir: 'table', frames: 120 },
  { dir: 'chair', frames: 120 },
];
const FRAMES = CLIPS.reduce((n, c) => n + c.frames, 0);
const SOURCES = CLIPS.flatMap((c) =>
  Array.from({ length: c.frames }, (_, i) => `${base}/${c.dir}/${String(i).padStart(3, '0')}.webp`),
);
const ASPECT = 16 / 9;
// пролёт и проезд к столу идут до TABLE_END, потом камера стоит, пока открываются выноски,
// и с CHAIR_START едет к стулу
const TABLE_FRAME = CLIPS[0].frames + CLIPS[1].frames - 1;
const TABLE_END = 0.5;
const CHAIR_START = 0.7;
const CHAIR_END = 0.88;
const FLIGHT_END = (TABLE_END * (CLIPS[0].frames - 1)) / TABLE_FRAME;

type Callout = {
  title: string;
  text: string;
  // точка на последнем кадре, в долях ширины и высоты кадра
  at: { desktop: [number, number]; mobile: [number, number] };
  // в какую сторону от линии стоит подпись
  side: 'left' | 'right';
  range: [number, number];
  // на телефоне две подписи не помещаются рядом: эта уходит, когда появляется следующая
  narrowHideAt?: number;
};

const CALLOUTS: Callout[] = [
  {
    title: 'Обеденный стол',
    text: 'Столешница из тёмного мрамора, основание из массива ореха. Диаметр 160 см, на шесть персон.',
    at: { desktop: [0.625, 0.655], mobile: [0.585, 0.65] },
    side: 'right',
    range: [0.52, 0.58],
    narrowHideAt: 0.59,
  },
  {
    title: 'Стул Velour',
    text: 'Велюр цвета шампань, каркас из массива ясеня в графитовом тоне. Мягкая спинка-ракушка.',
    at: { desktop: [0.12, 0.645], mobile: [0.42, 0.8] },
    side: 'left',
    range: [0.59, 0.65],
  },
];

const FABRIC_SPECS = [
  ['Состав', '70% шерсть, 30% полиамид'],
  ['Износостойкость', '60 000 циклов Мартиндейла'],
  ['Уход', 'Сухая чистка, пятновыводитель'],
];

export function FlightHero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const current = useRef(0);
  const [view, setView] = useState({ w: 0, h: 0 });

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const frame = useTransform(
    scrollYProgress,
    [0, TABLE_END, CHAIR_START, CHAIR_END],
    [0, TABLE_FRAME, TABLE_FRAME, FRAMES - 1],
    { clamp: true },
  );

  const introOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.08], [0, -60]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);
  const homeOpacity = useTransform(
    scrollYProgress,
    [FLIGHT_END - 0.08, FLIGHT_END - 0.02, FLIGHT_END + 0.05, FLIGHT_END + 0.1],
    [0, 1, 1, 0],
  );
  const homeY = useTransform(scrollYProgress, [FLIGHT_END - 0.08, FLIGHT_END - 0.02], [40, 0]);

  const calloutsOpacity = useTransform(scrollYProgress, [0.67, 0.7], [1, 0]);
  // на макрокадре обивки
  const fabricText = useTransform(scrollYProgress, [0.88, 0.95], [0, 1]);
  const fabricTextY = useTransform(scrollYProgress, [0.88, 0.95], [40, 0]);

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
    images.current = SOURCES.map((src, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
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
      setView({ w: c.clientWidth, h: c.clientHeight });
      draw(current.current);
    };
    resize();
    // backdrop-filter с url() умеет только Chromium, у него одного есть userAgentData
    if ('userAgentData' in navigator) document.documentElement.dataset.refract = '';
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
    <section id="top" ref={section} className="relative h-[1000vh]">
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
          style={{ opacity: homeOpacity, y: homeY }}
          className="pointer-events-none absolute inset-x-0 bottom-[12vh] mx-auto max-w-[1600px] px-4 text-center md:px-10"
        >
          <p className="eyebrow text-copper">Квартиры с видом на реку</p>
          <h2 className="display mt-4 text-[11vw] leading-[0.9] md:text-[6vw]">Вы дома</h2>
        </motion.div>

        <GlassFilter />
        <motion.div style={{ opacity: calloutsOpacity }} className="pointer-events-none absolute inset-0">
          {view.w > 0 &&
            CALLOUTS.map((c) => (
              <CalloutMark key={c.title} callout={c} view={view} progress={scrollYProgress} />
            ))}
        </motion.div>

        <motion.div style={{ opacity: fabricText }} className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent md:bg-gradient-to-r md:from-night/85 md:via-night/35" />
          <div className="absolute inset-0 mx-auto flex max-w-[1600px] items-end px-4 pb-[8vh] md:items-center md:px-10 md:pb-0">
            <motion.div style={{ y: fabricTextY }} className="max-w-[620px]">
              <p className="eyebrow text-white/70">Обивка стульев</p>
              <h2 className="display mt-5 text-[13vw] leading-[0.92] text-white md:text-[3.6vw]">
                Букле, которое
                <br />
                хочется потрогать
              </h2>
              <p className="mt-6 text-[15px] font-light leading-relaxed text-white/85 md:text-base">
                Плотная петельная ткань тёплого карамельного оттенка. Не скатывается, не боится когтей
                и годами держит форму каналов на спинке.
              </p>
              <dl className="mt-8 divide-y divide-white/15 border-y border-white/15 text-[14px]">
                {FABRIC_SPECS.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3">
                    <dt className="text-white/60">{k}</dt>
                    <dd className="text-right text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CalloutMark({
  callout,
  view,
  progress,
}: {
  callout: Callout;
  view: { w: number; h: number };
  progress: MotionValue<number>;
}) {
  const [a, b] = callout.range;
  const span = b - a;
  const dot = useTransform(progress, [a, a + span * 0.15], [0, 1]);
  const line = useTransform(progress, [a + span * 0.1, a + span * 0.55], [0, 1]);
  const card = useTransform(progress, [a + span * 0.5, b], [0, 1]);
  const cardY = useTransform(progress, [a + span * 0.5, b], [14, 0]);
  const hideAt = callout.narrowHideAt;
  const fade = useTransform(progress, (v) =>
    hideAt === undefined ? 1 : Math.min(1, Math.max(0, 1 - (v - hideAt) / 0.03)),
  );

  // кадр вписан по cover: пересчитываем точку из долей кадра в пиксели экрана
  const narrow = view.w < 768;
  const drawW = Math.max(view.w, view.h * ASPECT);
  const drawH = drawW / ASPECT;
  const [fx, fy] = narrow ? callout.at.mobile : callout.at.desktop;
  const x = (view.w - drawW) / 2 + fx * drawW;
  const y = (view.h - drawH) / 2 + fy * drawH;
  const lineH = Math.min(view.h * 0.26, 240);
  const cardW = Math.min(300, view.w - 32);
  const left =
    callout.side === 'right'
      ? Math.min(Math.max(x, 16), view.w - cardW - 16)
      : Math.min(Math.max(x - cardW, 16), view.w - cardW - 16);

  return (
    <motion.div style={{ opacity: narrow ? fade : 1 }} className="pointer-events-none absolute inset-0">
      <motion.span
        style={{ opacity: dot, left: x, top: y }}
        className="absolute -ml-[4px] -mt-[4px] block h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
      />
      <motion.span
        style={{ scaleY: line, left: x, top: y - lineH, height: lineH - 4 }}
        className="absolute block w-px origin-bottom bg-white/85"
      />
      <motion.div
        style={{ opacity: card, y: cardY, left, bottom: view.h - (y - lineH), width: cardW }}
        className="glass absolute rounded-[22px] p-5"
      >
        <p className="eyebrow text-white">{callout.title}</p>
        <p className="mt-3 text-[14px] font-light leading-relaxed text-white/85">{callout.text}</p>
      </motion.div>
    </motion.div>
  );
}

// карта смещения: в центре нейтральный серый (стекло не увеличивает), у самого края резкий перепад —
// там фон загибается, как в толстом стекле. Каналы R/G/B смещаем чуть по-разному — радужная кромка
const RIM = 0.12;
// две карты складываем в фильтре: mix-blend-mode внутри feImage браузер не применяет
const rimMap = (axis: 'x' | 'y', rim: number) => {
  const [hi, mid] = axis === 'x' ? ['#ff0000', '#800000'] : ['#00ff00', '#008000'];
  const dir = axis === 'x' ? 'x1="0" x2="1" y1="0" y2="0"' : 'x1="0" x2="0" y1="0" y2="1"';
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs><linearGradient id="a" ${dir}>
        <stop offset="0" stop-color="${hi}"/><stop offset="${rim}" stop-color="${mid}"/>
        <stop offset="${1 - rim}" stop-color="${mid}"/><stop offset="1" stop-color="#000000"/>
      </linearGradient></defs>
      <rect width="400" height="400" fill="url(#a)"/>
    </svg>`,
  )}`;
};
const MAP_X = rimMap('x', RIM);
const MAP_Y = rimMap('y', RIM * 2);

const CHANNELS = [
  { id: 'r', scale: -0.3, matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0' },
  { id: 'g', scale: -0.31, matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0' },
  { id: 'b', scale: -0.32, matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' },
];

function GlassFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      {/* в долях плашки: иначе для backdrop-filter проценты считаются от этого пустого svg */}
      <filter
        id="glass-refract"
        x="0"
        y="0"
        width="1"
        height="1"
        primitiveUnits="objectBoundingBox"
        colorInterpolationFilters="sRGB"
      >
        <feImage href={MAP_X} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="mx" />
        <feImage href={MAP_Y} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="my" />
        <feComposite in="mx" in2="my" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="map" />
        {CHANNELS.map((c) => [
          <feDisplacementMap
            key={`d${c.id}`}
            in="SourceGraphic"
            in2="map"
            scale={c.scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result={`d${c.id}`}
          />,
          <feColorMatrix key={`m${c.id}`} in={`d${c.id}`} type="matrix" values={c.matrix} result={c.id} />,
        ])}
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" />
      </filter>
    </svg>
  );
}
