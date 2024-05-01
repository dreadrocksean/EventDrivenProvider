import React, {createContext, FC, ReactElement, useCallback, useContext, useEffect, useState} from 'react';

const TYPE_BASE = 'blah/blah/v1'
const RESPONSE_TYPE = `${TYPE_BASE}/res`;
const REQUEST_TYPE = `${TYPE_BASE}/req`;

const init = {
    systemNotifications: [],
    apiErrors: [],
    working: false,
    reset() {},
};

const Context = createContext(init);

const SystemNotificationProvider = () => {
    const [systemNotifications, setSystemNotifications] = useState(init.systemNotifications);
    const [working, setWorking] = useState(init.working);
    const [apiErrors, setApiErrors] = useState(init.apiErrors);
    const [error, setError] = useState();

    const reset = useCallback(async () => {
        setWorking(true);
        setSystemNotifications(init.systemNotifications);
        setApiErrors(init.apiErrors);

        try {
            await fetch("");
            setWorking(false);
        } catch (error) {
            setError(error);
            setWorking(false);
        }
    }, []);

    const postMessage = useCallback(() => {
        window.postMessage({
            type: RESPONSE_TYPE,
            payload: {systemNotifications, apiErrors, error, working},
        });
    }, [systemNotifications, apiErrors, error, working]);

    useEffect(() => {
        const func = (event) = {
            if (event.data?.type === REQUEST_TYPE && systemNotifications) postMessage()
        };
        postMessage();
        window.addEventListener('message', func);
        return () => {
            window.removeEventListener('message', func);
        }
    }, [postMessage]);

    useEffect(() => {
        reset();
    }, [reset]);

    return null;
};

export const useSystemNotificationsContext = () => useContext(Context);

export const useSystemNotifications = () => {
    const [data, setData] = useState(init);

    useEffect(()=>{
        const func = (event) => {
            if (event.data.type === RESPONSE_TYPE) {
                const payload = event.data.payload;
                console.log('payload from window', payload);
                setData(payload);
            }
        };

        window.addEventListener('message', func);
        return () => {
            window.removeEventListener('message', func);
        }

    }, []);

    return data;
};

export default SystemNotificationProvider;