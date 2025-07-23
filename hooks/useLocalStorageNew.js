import { useState, useEffect } from 'react';

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export const useLocalStorageNew = (storageKey, fallbackState) => {

    const [value, setValue] = useState(() => {

        // Check if localStorage is available
        if (typeof window !== 'undefined' && window.localStorage) {

            const storedValue = localStorage.getItem(storageKey);

            if (isJsonString(storedValue)) {
                // Do nothing
            } else {
                return (fallbackState)
            }

            return storedValue ? JSON.parse(storedValue) : fallbackState || '';

        } else {
            // Handle the case where localStorage is not available
            return fallbackState || '';
        }

        // const storedValue = localStorage.getItem(storageKey);
        // return storedValue ? JSON.parse(storedValue) : fallbackState || '';

    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, storageKey]);

    return [value, setValue];
};