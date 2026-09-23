import { MobileFrame } from '@/components/layout/MobileFrame'

/** 00. 앱 스플래시 */
export function SplashPage() {
  return (
    <MobileFrame background="splash" className="items-center justify-center">
      <div className="text-center">
        <div className="bg-accent mx-auto mb-4.5 flex size-22 animate-[pop_.5s_ease] items-center justify-center rounded-[26px] text-4xl">
          🐷
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-white">
          같이모으기
        </h1>
        <div className="mt-9 flex justify-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="size-1.5 animate-pulse rounded-full bg-white/60"
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </MobileFrame>
  )
}
