import Image from "next/image";
import Countdown from "./Countdown";
import RegisterPanel, { RegisterButton } from "./RegisterSection";

/* Layout
 *  ≥1024px : two columns — content left, element 2 (manuscript) sticky right
 *  Below the hero, the registration flow is its own centred section (button scrolls to it)
 *  <1024px : single column — element 2 is display:none (and lazy, so never fetched);
 *            element 1 becomes a large hero banner behind the title art */
export default function MutaallimPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-mut-ink font-mut text-mut-cream selection:bg-mut-gold selection:text-mut-ink">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-gradient-to-b from-mut-ink via-mut-ink to-mut-ink-2" />

      <div className="relative mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ───────── Content ───────── */}
        <div className="relative z-10 px-4 pb-20 pt-20 sm:px-8 lg:flex lg:min-h-screen lg:items-center lg:px-16 lg:pb-16 lg:pt-28 xl:px-24">
          {/* Element 1: hero banner on mobile/tablet, supporting corner motif on desktop */}
          <Image
            src="/elment1.webp"
            alt=""
            aria-hidden
            width={640}
            height={638}
            sizes="(min-width: 1024px) 420px, 440px"
            priority
            className="pointer-events-none absolute -right-24 -top-10 z-0 w-[22rem] rotate-[8deg] select-none sm:-right-16 sm:w-[28rem] lg:-left-32 lg:right-auto lg:-top-16 lg:w-[26rem] lg:rotate-[262deg] lg:opacity-80"
          />

          <div className="relative z-10 mx-auto w-full max-w-[520px] lg:mx-0">
            <h1 className="mx-auto mt-2 w-[92%] max-w-[460px] lg:mx-0 lg:w-full">
              <Image
                src="/content.webp"
                alt="മുതഅല്ലിം സമ്മേളനം — മുക്കം. Muta'allim Sammelanam, Mukkam. SSF Kozhikode South."
                width={1699}
                height={1520}
                sizes="(min-width: 1024px) 460px, 92vw"
                priority
                className="h-auto w-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              />
            </h1>

            <Countdown />
            <RegisterButton />
          </div>
        </div>

        {/* ───────── Element 2 (desktop only) ───────── */}
        <aside aria-hidden className="relative hidden lg:block">
          <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
            <div className="absolute h-[75%] w-[75%] rounded-full bg-mut-plum/30 blur-3xl" />
            <Image
              src="/element2.webp"
              alt=""
              width={1400}
              height={1161}
              sizes="(min-width: 1440px) 900px, 62vw"
              loading="lazy"
              className="mut-float relative h-auto w-[120%] max-w-none shrink-0 drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)] xl:w-[112%]"
            />
          </div>
        </aside>
      </div>

      {/* Next section: registration flow */}
      <RegisterPanel />
    </div>
  );
}
