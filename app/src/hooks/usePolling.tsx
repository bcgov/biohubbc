import { useState } from 'react'

interface IUsePollingConfig {
    startEnabled: boolean;
    initialDelayMs: number;
    maxDelayMs: number;
    lockoutDurationMs: number;
    lockoutPolls: number;
    decayRate: (prevDelay: number) => number
}

const defaultConfig: IUsePollingConfig = {
    startEnabled: true,
    initialDelayMs: 5000,
    maxDelayMs: 60000,
    lockoutDurationMs: 120000,
    lockoutPolls: 0,
    decayRate: (prevDelay: number) => 2 * prevDelay
}

export const usePolling = (callback: () => void, config: IUsePollingConfig) => {
    const pollingConfig: IUsePollingConfig = { ...defaultConfig, ...config }
    const [isPolling, setIsPolling] = useState<boolean>();

    const { initialDelayMs, maxDelayMs, lockoutDurationMs, lockoutPolls, decayRate } = pollingConfig

    const nextDelay = (delayMs: number) => {
        return Math.min(decayRate(delayMs), maxDelayMs);
    }

    if (lockoutDurationMs > 0 || lockoutPolls > 0) {
        let lockoutPollDurationMs = initialDelayMs;
        let currentDelay = initialDelayMs;
        for (let i = 0; i < lockoutPolls - 1; i ++) {
            currentDelay = nextDelay(currentDelay);
            lockoutPollDurationMs += currentDelay;
        }

        setTimeout(() => {
            disable();
        }, Math.min(lockoutDurationMs, lockoutPollDurationMs));
    }

    const enable = () => {
        setIsPolling(true);
    }

    const disable = () => {
        setIsPolling(false);
    }

    return {
        isPolling,
        enable,
        disable,
        poll: () => callback()
    }
}
