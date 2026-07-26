import Link from "next/link";

export default function CharacterNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <p className="text-2xl font-black uppercase">Character Not Found</p>
      <Link
        href="/gallery"
        className="mt-6 border-4 border-[#00ffcc] px-6 py-3 text-sm font-black uppercase text-[#00ffcc]"
      >
        Back To Gallery
      </Link>
    </div>
  );
}
