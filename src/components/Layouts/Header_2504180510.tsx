import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleRTL, toggleTheme } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import Dropdown from '../Dropdown';
import IconSun from '../Icon/IconSun';
import IconMoon from '../Icon/IconMoon';
import IconLaptop from '../Icon/IconLaptop';
import IconBellBing from '../Icon/IconBellBing';
import IconMailDot from '../Icon/IconMailDot';
import IconUser from '../Icon/IconUser';
import IconLogout from '../Icon/IconLogout';
import IconLockDots from '../Icon/IconLockDots';

const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const { t } = useTranslation();
    const isRtl = themeConfig.rtlClass === 'rtl';

    const [flag, setFlag] = useState(themeConfig.locale);

    useEffect(() => {
        const selector = document.querySelector(`ul.horizontal-menu a[href='${location.pathname}']`);
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

    const handleThemeToggle = () => {
        const nextTheme = themeConfig.theme === 'light' ? 'dark' : themeConfig.theme === 'dark' ? 'system' : 'light';
        dispatch(toggleTheme(nextTheme));
    };

    const handleLocaleChange = (code: string) => {
        i18next.changeLanguage(code);
        setFlag(code);
        dispatch(toggleRTL(code.toLowerCase() === 'ae' ? 'rtl' : 'ltr'));
    };

    return (
        <header className="z-40 shadow-sm bg-white dark:bg-black px-5 py-2.5 flex items-center justify-between">
            {/* 로고 */}
            <Link to="/" className="flex items-center">
                <img src="/assets/images/logo.svg" alt="logo" className="w-8" />
                <span className="text-2xl ml-2 font-semibold dark:text-white-light hidden md:inline">VRISTO</span>
            </Link>

            {/* 오른쪽 메뉴 */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">

                {/* 테마 토글 */}
                <button onClick={handleThemeToggle} className="p-2 rounded-full bg-white-light/40 dark:bg-dark/40">
                    {themeConfig.theme === 'light' && <IconSun />}
                    {themeConfig.theme === 'dark' && <IconMoon />}
                    {themeConfig.theme === 'system' && <IconLaptop />}
                </button>

                {/* 언어 선택 */}
                <Dropdown
                    offset={[0, 8]}
                    placement={isRtl ? 'bottom-start' : 'bottom-end'}
                    btnClassName="p-2 rounded-full bg-white-light/40 dark:bg-dark/40"
                    button={<img className="w-5 h-5 rounded-full" src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="flag" />}
                >
                    <ul className="grid grid-cols-2 gap-2 w-40 p-2">
                        {themeConfig.languageList.map((item) => (
                            <li key={item.code}>
                                <button
                                    onClick={() => handleLocaleChange(item.code)}
                                    className={`flex w-full items-center p-2 rounded hover:bg-primary/10 ${i18next.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                >
                                    <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 rounded-full" />
                                    <span className="ml-2 text-sm">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Dropdown>

                {/* 알림 */}
                <button className="p-2 rounded-full bg-white-light/40 dark:bg-dark/40">
                    <IconBellBing />
                </button>

                {/* 메일 */}
                <button className="p-2 rounded-full bg-white-light/40 dark:bg-dark/40">
                    <IconMailDot />
                </button>

                {/* 유저 드롭다운 */}
                <Dropdown
                    offset={[0, 8]}
                    placement={isRtl ? 'bottom-start' : 'bottom-end'}
                    btnClassName="p-1 rounded-full"
                    button={<img className="w-8 h-8 rounded-full object-cover" src="/assets/images/users/user-1.jpg" alt="User" />}
                >
                    <div className="p-4 text-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg shadow-md">
                        <img className="w-14 h-14 mx-auto rounded-full object-cover mb-2" src="/assets/images/users/user-1.jpg" alt="User Profile" />
                        <h5 className="text-base font-semibold text-gray-900 dark:text-white">John Doe</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">johndoe@gmail.com</p>
                        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Pro</span>
                    </div>
                    <ul className="bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white">
                        <li>
                            <Link to="/users/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <IconUser className="w-4 h-4" /> Profile
                            </Link>
                        </li>
                        <li>
                            <Link to="/apps/inbox" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <IconMailDot className="w-4 h-4" /> Inbox
                            </Link>
                        </li>
                        <li>
                            <button className="flex items-center w-full gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <IconLockDots className="w-4 h-4" /> Lock Screen
                            </button>
                        </li>
                        <li className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                            <Link to="/auth/boxed-signin" className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <IconLogout className="w-4 h-4" /> Sign Out
                            </Link>
                        </li>
                    </ul>
                </Dropdown>

            </div>
        </header>
    );
};

export default Header;
