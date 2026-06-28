// İçerik sayfası yüklenirken iskelet — gerçek kolon yerleşimiyle aynı
// genişlik/padding, böylece veri gelince zıplama olmaz.
export default function Loading() {
  return (
    <main className="relative flex w-full justify-center">
      <div className="flex w-full max-w-xs flex-col gap-10 px-4 pt-20 pb-10 sm:px-0 md:max-w-5xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] w-full animate-pulse rounded-lg bg-white/5"
          />
        ))}
      </div>
    </main>
  );
}
