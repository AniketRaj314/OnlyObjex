import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
  mode?: "wordmark" | "mark";
  subtitle?: string;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  className = "",
  mode = "wordmark",
  subtitle,
  priority = false,
}: BrandLogoProps) {
  const content =
    mode === "mark" ? (
      <Image
        src="/brand/onlyobjex-mark.svg"
        alt="OnlyObjex"
        width={44}
        height={44}
        priority={priority}
        className="h-11 w-11 rounded-2xl"
      />
    ) : (
      <div className="flex items-center gap-3">
        <Image
          src="/brand/onlyobjex-wordmark.svg"
          alt="OnlyObjex"
          width={232}
          height={56}
          priority={priority}
          className="h-10 w-auto sm:h-11"
        />
        {subtitle ? (
          <p className="hidden text-sm text-[var(--color-text-soft)] md:block">
            {subtitle}
          </p>
        ) : null}
      </div>
    );

  return (
    <Link href={href} className={`flex items-center ${className}`.trim()}>
      {content}
    </Link>
  );
}
