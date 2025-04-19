import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
    email: string;
    setEmail: (email: string) => void;
}

// Context 객체 생성
const UserContext = createContext<UserContextType | undefined>(undefined);

// Context를 공급해주는 Provider 컴포넌트
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [email, setEmail] = useState('johndoe@gmail.com');

    return (
        <UserContext.Provider value={{ email, setEmail }}>
            {children}
        </UserContext.Provider>
    );
};

// Context를 사용하는 커스텀 Hook
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
