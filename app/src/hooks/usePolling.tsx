import { useCallback, useEffect, useState } from 'react'
import { useInterval } from './useInterval';

interface IUsePollingConfig {
    pollRateMs: number;
    lockoutDurationMs: number;
    lockoutPolls: number;
}

const defaultConfig: IUsePollingConfig = {
    pollRateMs: 5000,
    lockoutDurationMs: 60000,
    lockoutPolls: 0
}

export const usePolling = (pollFunction: () => void, config?: IUsePollingConfig) => {
    const [isPolling, setIsPolling] = useState<boolean>(true);
    const callback = useCallback(pollFunction, [pollFunction]);

    const pollingConfig: IUsePollingConfig = { ...defaultConfig, ...config }
    const { pollRateMs, lockoutDurationMs, lockoutPolls } = pollingConfig

    const enable = () => {
        setIsPolling(true);
    }

    const disable = () => {
        setIsPolling(false);
    }

    if (lockoutDurationMs > 0 || lockoutPolls > 0) {
        setTimeout(disable, Math.min(lockoutDurationMs, pollRateMs * lockoutPolls));
    }

    useInterval(callback, pollRateMs, 60000);

    useEffect(() => {
        if (isPolling) {
            //
        }
    }, [isPolling])

    return {
        isPolling,
        enable,
        disable,
        poll: () => callback()
    }
}
