import Image from "next/image";

/** Left card of the About section: the transparent cutout stands on the bottom edge, filling ~95% of the height. */
export function AboutPhoto() {
  return (
    <div
      className="relative aspect-[4/5] w-full max-w-sm justify-self-center overflow-hidden rounded-xl border border-white/[0.06] bg-surface-2"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <Image
        src="/images/eng-sopheak-about.png"
        alt="Eng Sopheak"
        width={1346}
        height={1702}
        quality={92}
        sizes="(min-width:768px) 400px, 90vw"
        className="absolute inset-x-0 bottom-0 h-[95%] w-full object-contain object-bottom"
      />
    </div>
  );
}
