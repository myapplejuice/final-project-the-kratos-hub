import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import APIService from './utils/api-service';

export default function App() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function initializeApp() {
            const apiState = await APIService.ping();
            if (!apiState) {
                throw new Error('Servers unavailable!\nPlease try again later');
            }

            setIsReady(true);
        }

        initializeApp();
    }, []);

    if (!isReady) {
        return <div style={{ fontSize: 24, textAlign: 'center', marginTop: 50, color: 'white' }}>Loading...</div>;
    }

    return <Navigate to="/gate" replace />;
}

async function fakeInit() {
    return new Promise(resolve => setTimeout(resolve, 1000));
}