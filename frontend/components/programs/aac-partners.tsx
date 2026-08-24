import Image from "next/image"
import Link from "next/link"
import type { AacPartner } from "@/lib/aac-program"

function PartnerTile({ partner }: { partner: AacPartner }) {
  const tile = (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-[#edeff2] bg-white px-3 py-4 shadow-sm transition-all hover:border-[#812926]/20 hover:shadow-md">
      <div className="relative flex h-14 w-full items-center justify-center">
        <Image
          src={partner.logo}
          alt=""
          width={180}
          height={56}
          unoptimized
          className="max-h-14 w-auto max-w-full object-contain"
        />
      </div>
      <span className="line-clamp-2 text-center text-[10px] font-medium leading-snug text-[#1c395c]/70">
        {partner.name}
      </span>
    </div>
  )

  if (partner.href) {
    return (
      <Link
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#812926] focus-visible:ring-offset-2"
        aria-label={`${partner.name} (opens in a new tab)`}
      >
        {tile}
      </Link>
    )
  }

  return tile
}

export function AacPartners({ partners }: { partners: readonly AacPartner[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {partners.map((partner) => (
        <li key={partner.name} className="min-h-[8.5rem]">
          <PartnerTile partner={partner} />
        </li>
      ))}
    </ul>
  )
}
