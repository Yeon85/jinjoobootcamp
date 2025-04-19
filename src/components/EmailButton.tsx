import { useUser } from '../../contexts/UserContext';

const EmailButton = () => {
    const { email } = useUser();

    return (
        <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
            {email}
        </button>
    );
};

export default EmailButton;
