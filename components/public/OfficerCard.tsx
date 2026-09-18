import Image from "next/image";
import { User } from "lucide-react";

export function OfficerCard({
  name, position, rank, photoUrl, bio,
}: { name: string; position: string; rank?: string | null; photoUrl?: string | null; bio?: string | null }) {
  return (
    <div className="text-center">
      <div className="relative mx-auto h-32 w-32 rounded-full overflow-hidden bg-royal-100 ring-4 ring-gold-100">
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-royal-300">
            <User className="h-12 w-12" />
          </div>
        )}
      </div>
      <h3 className="mt-4 font-display font-bold text-royal-900">{name}</h3>
      <p className="text-sm text-gold-600 font-semibold">{position}</p>
      {rank && <p className="text-xs text-charcoal/50">{rank}</p>}
      {bio && <p className="mt-2 text-sm text-charcoal/70 max-w-xs mx-auto">{bio}</p>}
    </div>
  );
}
