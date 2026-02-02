import { PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import App from '../../App';
import { IRootState } from '../../store';
import { toggleSidebar } from '../../store/themeConfigSlice';
import Footer from './Footer';
import Header from './Header';
import Setting from './Setting';
import Sidebar from './Sidebar';
import PwaInstallCard from '../../components/pwa/PwaInstallCard';

import Portals from '../../components/Portals';

import { usePwaInstall } from '../../hooks/usePwaInstall';

const DefaultLayout = ({ children }: PropsWithChildren) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    // ✅ 훅 호출은 반드시 컴포넌트 함수 내부!
    const { canInstall, install, showIOSGuide } = usePwaInstall();

    const [showLoader, setShowLoader] = useState(true);
    const [showTopButton, setShowTopButton] = useState(false);

    const goToTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    const onScrollHandler = () => {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            setShowTopButton(true);
        } else {
            setShowTopButton(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', onScrollHandler);

        const screenLoader = document.getElementsByClassName('screen_loader');
        if (screenLoader?.length) {
            screenLoader[0].classList.add('animate__fadeOut');
            setTimeout(() => {
                setShowLoader(false);
            }, 200);
        }

        return () => {
            window.removeEventListener('scroll', onScrollHandler); // ✅ onscroll ❌ scroll ✅
        };
    }, []);

    return (
        <App>
            <PwaInstallCard/>
            {/* ✅ PWA 설치 UI (레이아웃 위에 올리면 어느 화면에서든 뜸) */}
            {canInstall && (
                <button
                    type="button"
                    onClick={() => install()}
                    className="fixed bottom-6 ltr:left-6 rtl:right-6 z-[70] btn btn-primary rounded-full px-4 py-2 shadow-lg"
                >
                    📲 앱 설치하기
                </button>
            )}

            {showIOSGuide && (
                <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-black/90 px-4 py-3 text-white text-sm shadow-lg">
                    iPhone은 Safari에서 <b>공유</b> → <b>홈 화면에 추가</b>로 설치해요.
                </div>
            )}

            {/* BEGIN MAIN CONTAINER */}
            <div className="relative">
                {/* sidebar menu overlay */}
                <div
                    className={`${(!themeConfig.sidebar && 'hidden') || ''} fixed inset-0 bg-[black]/60 z-50 lg:hidden`}
                    onClick={() => dispatch(toggleSidebar())}
                ></div>

                {/* screen loader */}
                {showLoader && (
                    <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                        {/* ... (여긴 그대로) */}
                    </div>
                )}

                <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50">
                    {showTopButton && (
                        <button
                            type="button"
                            className="btn btn-outline-primary rounded-full p-2 animate-pulse bg-[#fafafa] dark:bg-[#060818] dark:hover:bg-primary"
                            onClick={goToTop}
                        >
                            {/* ... */}
                        </button>
                    )}
                </div>

                <Setting />

                <div className={`${themeConfig.navbar} main-container text-black dark:text-white-dark min-h-screen`}>
                    <Sidebar />

                    <div className="main-content flex flex-col min-h-screen">
                        <div className="lg:block">
                            <Header />
                        </div>

                        <Suspense>
                            <div className={`${themeConfig.animation} p-6 animate__animated`}>{children}</div>
                        </Suspense>

                        <Footer />
                        <Portals />
                    </div>
                </div>
            </div>
        </App>
    );
};

export default DefaultLayout;
