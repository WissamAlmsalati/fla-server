"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseBarcodeScanner {
    onScan: (barcode: string) => void;
    enabled?: boolean;
}

/**
 * Hook to detect hardware barcode scanner input.
 * Barcode scanners act like keyboards and type characters very fast,
 * typically ending with Enter key.
 */
export function useBarcodeScanner({ onScan, enabled = true }: UseBarcodeScanner) {
    const bufferRef = useRef<string>("");
    const lastKeyTimeRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Maximum time between keystrokes for scanner input (ms)
    const MAX_KEYSTROKE_DELAY = 50;
    // Minimum length for a valid barcode
    const MIN_BARCODE_LENGTH = 3;
    // Timeout to clear buffer if no Enter is pressed
    const BUFFER_TIMEOUT = 200;

    const clearBuffer = useCallback(() => {
        bufferRef.current = "";
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Ignore if typing in an input field (unless it's the search input and it's a scan)
            const target = event.target as HTMLElement;
            const isInputElement =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTimeRef.current;
            lastKeyTimeRef.current = currentTime;

            // If Enter is pressed, check if we have a valid barcode
            if (event.key === "Enter") {
                const barcode = bufferRef.current.trim();

                if (barcode.length >= MIN_BARCODE_LENGTH) {
                    // Prevent form submission if we're in an input
                    if (isInputElement) {
                        event.preventDefault();
                    }

                    onScan(barcode);
                }

                clearBuffer();
                return;
            }

            // Only collect printable characters
            if (event.key.length !== 1) {
                return;
            }

            // If too much time has passed, start a new buffer
            if (timeDiff > MAX_KEYSTROKE_DELAY && bufferRef.current.length > 0) {
                // This might be manual typing, clear the buffer
                clearBuffer();
            }

            // Add character to buffer
            bufferRef.current += event.key;

            // Set a timeout to clear the buffer if no Enter comes
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(clearBuffer, BUFFER_TIMEOUT);
        },
        [onScan, clearBuffer]
    );

    useEffect(() => {
        if (!enabled) {
            return;
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [enabled, handleKeyDown]);
}
