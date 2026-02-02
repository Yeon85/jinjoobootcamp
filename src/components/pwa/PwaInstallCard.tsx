import { usePwaInstall } from '../../hooks/usePwaInstall';

export default function PwaInstallCard() {
  const { canInstall, install, showIOSGuide } = usePwaInstall();

  // 둘 다 아니면 렌더 안 함
  if (!canInstall && !showIOSGuide) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[70] w-[calc(100%-24px)] max-w-md -translate-x-1/2">
      {canInstall && (
        <button
          type="button"
          onClick={() => install()}
          className="group w-full rounded-2xl border border-white/10 bg-white/95 p-4 text-left shadow-lg backdrop-blur dark:bg-[#0b1220]/90"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              {/* 아이콘 */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M7 11l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 21h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex-1">
              <div className="text-sm font-semibold text-black dark:text-white">
                앱으로 설치하면 더 빠르고 편해요
              </div>
              <div className="mt-0.5 text-xs text-black/60 dark:text-white/60">
                홈화면에 추가되고, 전체화면으로 실행돼요
              </div>
            </div>

            <div className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm group-hover:opacity-90">
              설치
            </div>
          </div>
        </button>
      )}

      {showIOSGuide && (
        <div className="rounded-2xl border border-white/10 bg-black/85 p-4 text-white shadow-lg backdrop-blur">
          <div className="text-sm font-semibold">iPhone 설치 방법</div>
          <div className="mt-1 text-xs text-white/80 leading-relaxed">
            Safari 하단의 <b>공유</b> 버튼 →
            <b> “홈 화면에 추가”</b>를 눌러 설치하세요.
          </div>
        </div>
      )}
    </div>
  );
}
