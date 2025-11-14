// Allow importing CSS files in TypeScript (Next.js global CSS imports)
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
declare module "swiper/css";
declare module "swiper/css/pagination";
declare module "swiper/css/navigation";
