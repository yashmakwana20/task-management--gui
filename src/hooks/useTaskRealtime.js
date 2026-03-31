import { useEffect, useRef } from "react";
import {
    startSignalRConnection,
    getSignalRConnection,
} from "../services/signalrService";

export default function useTaskRealtime(onTaskChanged) {
    const callbackRef = useRef(onTaskChanged);

    useEffect(() => {
        callbackRef.current = onTaskChanged;
    }, [onTaskChanged]);

    useEffect(() => {
        let isMounted = true;

        const handler = async (payload) => {
            console.log("TaskChanged event received:", payload);

            if (isMounted && typeof callbackRef.current === "function") {
                await callbackRef.current(payload);
            }
        };

        const register = async () => {
            try {
                const connection = await startSignalRConnection();
                connection.off("TaskChanged", handler);
                connection.on("TaskChanged", handler);
            } catch (error) {
                console.error("SignalR connection failed:", error);
            }
        };

        register();

        return () => {
            isMounted = false;
            const connection = getSignalRConnection();
            if (connection) {
                connection.off("TaskChanged", handler);
            }
        };
    }, []);
}