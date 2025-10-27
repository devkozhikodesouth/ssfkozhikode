"use client";

export default function LogoSlider() {
  const logos = [   
    { src: "/logo.png", alt: "logo" },
    { src: "/logo.png", alt: "logo" },
    { src: "/logo.png", alt: "logo" },
    { src: "/logo.png", alt: "logo" },
    { src: "/logo.png", alt: "logo" },
    { src: "/logo.png", alt: "logo" },
  
];

  return (
    <div className="w-full overflow-hidden py-8 from-[#f7f2ff] to-[#e6f5ff]">
      <div className="slider flex gap-16 whitespace-nowrap">
        {[...logos, ...logos].map((logo, i) => (
          <img
            key={i}
            src={logo.src}
            alt={logo.alt}
            className="h-10 w-auto opacity-70 hover:opacity-100 transition"
          />
        ))}
      </div>
    <style jsx>{`
        .slider {
          display: flex;
          animation: scroll 20s linear infinite;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}


