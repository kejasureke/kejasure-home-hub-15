import { useState, ImgHTMLAttributes } from "react";

interface BlurImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  wrapperClassName?: string;
}

/**
 * Progressive blur-up image. Shows a soft blurred placeholder tinted
 * by the image dominant hue until the real image finishes loading.
 */
const BlurImage = ({ src, alt, className = "", wrapperClassName = "", ...rest }: BlurImageProps) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <div
        aria-hidden
        className={`absolute inset-0 bg-secondary/60 transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100 animate-pulse"
        }`}
      />
      <img
        {...rest}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`${className} transition-[filter,opacity] duration-500 ${
          loaded ? "blur-0 opacity-100" : "blur-md opacity-0"
        }`}
      />
    </div>
  );
};

export default BlurImage;
