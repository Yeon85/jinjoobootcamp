import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleRTL, toggleTheme, toggleSidebar } from '../../store/themeConfigSlice';
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
import IconMailDot from '../Icon/IconMailDot';
import IconBellBing from '../Icon/IconBellBing';
import IconUser from '../Icon/IconUser';
import IconLogout from '../Icon/IconLogout';

const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const { t } = useTranslation();
    const isRtl = themeConfig.rtlClass === 'rtl';

    const [searchOpen, setSearchOpen] = useState(false);
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
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm bg-white dark:bg-black px-5 py-2.5 flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <img src="/assets/images/logo.svg" alt="logo" className="w-8" />
                    <span className="text-2xl ml-2 font-semibold dark:text-white-light hidden md:inline">VRISTO</span>
                </Link>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 bg-white-light/40 dark:bg-dark/40 rounded-full">
                        <IconSearch />
                    </button>
                    <button onClick={handleThemeToggle} className="p-2 bg-white-light/40 dark:bg-dark/40 rounded-full">
                        {themeConfig.theme === 'light' && <IconSun />}
                        {themeConfig.theme === 'dark' && <IconMoon />}
                        {themeConfig.theme === 'system' && <IconLaptop />}
                    </button>
                    <Dropdown
                        offset={[0, 8]}
                        placement={isRtl ? 'bottom-start' : 'bottom-end'}
                        btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40"
                        button={<img className="w-5 h-5 rounded-full" src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="flag" />}
                    >
                        <ul className="grid grid-cols-2 gap-2 w-64 p-2">
                            {themeConfig.languageList.map((item) => (
                                <li key={item.code}>
                                    <button
                                        onClick={() => handleLocaleChange(item.code)}
                                        className={`flex w-full items-center p-2 rounded hover:bg-primary/10 ${i18next.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                    >
                                        <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 rounded-full" />
                                        <span className="ml-3">{item.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Dropdown>
                    <Dropdown
                        offset={[0, 8]}
                        placement={isRtl ? 'bottom-start' : 'bottom-end'}
                        btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40"
                        button={<IconUser />}
                    >
                        <ul className="text-dark dark:text-white-dark w-56">
                            <li>
                                <Link to="/users/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    My Profile
                                </Link>
                            </li>
                            <li>
                                <Link to="/auth/boxed-signin" className="block px-4 py-2 text-danger hover:bg-gray-100 dark:hover:bg-gray-700">
                                    Sign Out
                                </Link>
                            </li>
                        </ul>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
};

export default Header;