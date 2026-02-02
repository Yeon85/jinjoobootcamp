import { useEffect, useState } from 'react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

function isStandalone() {
  // Android/Chrome 등
  const standaloneMatch = window.matchMedia?.('(display-mode: standalone)').matches;
  // iOS Safari 홈화면 추가
  const iosStandalone = (window.navigator as any).standalone === true;
  return !!standaloneMatch || !!iosStandalone;
}

type Props = {
  title?: string;
  subtitle?: string;
};

export default function TopInstallBar({
  title = '톡 확인',
  subtitle = '로아톡 확인',
}: Props) {
  const { canInstall, install } = usePwaInstall();
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());

    // display-mode 변경도 감지(일부 브라우저에서 동작)
    const mq = window.matchMedia?.('(display-mode: standalone)');
    const onChange = () => setStandalone(isStandalone());
    mq?.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, []);

  // ✅ 앱(PWA)으로 실행 중이면 바 자체를 숨김
  if (standalone) return null;

  return (
    <div className="sticky top-0 z-50 w-full">
      <div className="backdrop-blur bg-white/80 dark:bg-[#0E1726]/80 border-b border-white-light dark:border-[#1b2e4b]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-14 flex items-center justify-between">
            {/* 왼쪽 */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-primary to-[#7c3aed] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">●</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-black dark:text-white truncate">{title}</p>
                <p className="text-xs text-white-dark truncate">{subtitle}</p>
              </div>
            </div>

            {/* 오른쪽: 설치 가능한 상황에서만 버튼 */}
            {canInstall ? (
              <button
                type="button"
                onClick={install}
                className="btn btn-sm btn-outline-primary rounded-full !px-4"
              >
                📲 앱 설치
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
