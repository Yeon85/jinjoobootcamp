import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleRTL, toggleTheme, toggleSidebar } from '../../store/themeConfigSlice';
import { logoutUser } from '../../store/userSlice';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import Dropdown from '../Dropdown';
import IconMenu from '../Icon/IconMenu';
import IconCalendar from '../Icon/IconCalendar';
import IconEdit from '../Icon/IconEdit';
import IconChatNotification from '../Icon/IconChatNotification';
import IconSearch from '../Icon/IconSearch';
import IconXCircle from '../Icon/IconXCircle';
import IconSun from '../Icon/IconSun';
import IconMoon from '../Icon/IconMoon';
import IconLaptop from '../Icon/IconLaptop';
import IconUser from '../Icon/IconUser';
import IconLogout from '../Icon/IconLogout';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconCaretDown from '../Icon/IconCaretDown';
import IconMenuApps from '../Icon/Menu/IconMenuApps';
import IconMenuComponents from '../Icon/Menu/IconMenuComponents';
import IconMenuElements from '../Icon/Menu/IconMenuElements';
import IconMenuDatatables from '../Icon/Menu/IconMenuDatatables';
import IconMenuForms from '../Icon/Menu/IconMenuForms';
import IconMenuPages from '../Icon/Menu/IconMenuPages';
import IconMenuMore from '../Icon/Menu/IconMenuMore';

const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const isRtl = themeConfig.rtlClass === 'rtl';
    const user = useSelector((state: IRootState) => state.user);

    const { t } = useTranslation();

    const [search, setSearch] = useState(false);
    const [flag, setFlag] = useState(themeConfig.locale);

    useEffect(() => {
        const selector = document.querySelector(`ul.horizontal-menu a[href="${window.location.pathname}"]`);
        if (selector) {
            selector.classList.add('active');
            const all = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            all.forEach((el) => el.classList.remove('active'));
            const ul = selector.closest('ul.sub-menu');
            if (ul) {
                const parentMenu = ul.closest('li.menu')?.querySelector('.nav-link');
                parentMenu?.classList.add('active');
            }
        }
    }, [location]);

    const setLocale = (flag: string) => {
        setFlag(flag);
        dispatch(toggleRTL(flag.toLowerCase() === 'ae' ? 'rtl' : 'ltr'));
    };

    const handleThemeToggle = () => {
        const nextTheme = themeConfig.theme === 'light' ? 'dark' : themeConfig.theme === 'dark' ? 'system' : 'light';
        dispatch(toggleTheme(nextTheme));
    };

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm bg-white dark:bg-black px-5 py-2.5 flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <img src="/assets/images/logo.svg" alt="logo" className="w-8" />
                    <span className="text-2xl ml-2 font-semibold dark:text-white-light hidden md:inline">VRISTO</span>
                </Link>

                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    {/* 검색 버튼 */}
                    <button onClick={() => setSearch(!search)} className="p-2 bg-white-light/40 dark:bg-dark/40 rounded-full">
                        <IconSearch />
                    </button>

                    {/* 테마 토글 버튼 */}
                    <button onClick={handleThemeToggle} className="p-2 bg-white-light/40 dark:bg-dark/40 rounded-full">
                        {themeConfig.theme === 'light' && <IconSun />}
                        {themeConfig.theme === 'dark' && <IconMoon />}
                        {themeConfig.theme === 'system' && <IconLaptop />}
                    </button>

                    {/* 사용자 프로필 / 로그인 메뉴 */}
                    <Dropdown
                        offset={[0, 8]}
                        placement={isRtl ? 'bottom-start' : 'bottom-end'}
                        btnClassName="relative"
                        button={user.isLoggedIn ? (
                            <img className="w-9 h-9 rounded-full" src={user.profileImage || '/assets/images/default-profile.png'} alt="userProfile" />
                        ) : (
                            <IconUser className="w-6 h-6" />
                        )}
                    >
                        <ul className="text-dark dark:text-white-dark py-2 w-56">
                            {user.isLoggedIn ? (
                                <>
                                    <li className="px-4 py-2">
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                    </li>
                                    <li>
                                        <Link to="/users/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => dispatch(logoutUser())}
                                            className="block w-full text-left px-4 py-2 text-danger hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Sign Out
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="px-4 py-2 text-center">
                                        <p className="font-semibold">Welcome!</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">로그인 해주세요.</p>
                                    </li>
                                    <li>
                                        <Link to="/auth/boxed-signin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            로그인
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/auth/boxed-signup" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            회원가입
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </Dropdown>
                </div>
            </div>

            {/* 👉 (필요 시) horizontal-menu 추가 가능 */}
        </header>
    );
};

export default Header;
