import { useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// iOS 판별
function isIOS() {
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

// PWA standalone(이미 설치됨) 판별
function isStandalone() {
  const standaloneMatch =
    window.matchMedia?.('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as any).standalone === true;
  return !!standaloneMatch || !!iosStandalone;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  // ✅ iOS는 설치 버튼 대신 안내 UI
  const showIOSGuide = useMemo(() => {
    return isIOS() && !isStandalone();
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (isStandalone()) {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    };

    // 이미 설치된 상태면 아무것도 안 함
    if (isStandalone()) {
      setCanInstall(false);
      return;
    }

    // Android / Chrome 설치 이벤트
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // 기본 미니바 숨김
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // 설치 완료 시
    const onInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
    };

    // display-mode 변경 감지 (설치 직후 반영 지연 대응)
    const mql = window.matchMedia?.('(display-mode: standalone)');
    const onMqlChange = () => refresh();

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('visibilitychange', refresh);
    mql?.addEventListener?.('change', onMqlChange);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        onBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('visibilitychange', refresh);
      mql?.removeEventListener?.('change', onMqlChange);
    };
  }, []);

  // 설치 트리거
  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    // accepted / dismissed 이후 prompt는 재사용 불가
    setDeferredPrompt(null);
    setCanInstall(false);

    return choice.outcome;
  };

  return {
    canInstall,   // Android/Chrome에서 설치 가능 여부
    install,      // 설치 실행 함수
    showIOSGuide, // iOS 홈화면 추가 안내 여부
  };
}
