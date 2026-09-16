import Image from "next/image";
import logoLight from "../assets/logo_light.png";
import logoDark from "../assets/logo_dark.png";

export default function Logo({ 
  className, 
  textClassName = "text-3xl",
  hideText = false
}: { 
  className?: string; 
  textClassName?: string;
  hideText?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image 
        src={logoLight} 
        alt="KebyuEdu Logo" 
        priority
        className="dark:hidden"
        style={{ width: 'auto', height: '100%' }}
      />
      <Image 
        src={logoDark} 
        alt="KebyuEdu Logo" 
        priority
        className="hidden dark:block"
        style={{ width: 'auto', height: '100%' }}
      />
      {!hideText && (
        <div className={`font-outfit font-black tracking-tight leading-none whitespace-nowrap pt-1 ${textClassName}`}>
          <span className="text-[#1e3a8a] dark:text-white transition-colors duration-300">Kebyu</span>
          <span className="text-blue-500">Edu</span>
        </div>
      )}
    </div>
  );
}
