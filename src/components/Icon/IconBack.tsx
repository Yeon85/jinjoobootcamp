import { FC } from 'react';

interface IconBackProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconBack: FC<IconBackProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* < 모양 */}
            <path
                d="M15 6L9 12L15 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default IconBack;
