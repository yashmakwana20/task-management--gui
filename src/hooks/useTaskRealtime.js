import { useEffect } from "react";
import { startSignalRConnection, getSignalRConnection } from "../services/signalrService";
import toast from "react-hot-toast";

export default function useTaskRealtime(onTaskChanged) {
    useEffect(() => {
        let isMounted = true;
        let handler = null;

        const register = async () => {
            try {
                const connection = await startSignalRConnection();

                connection.off("TaskChanged", handler);

                handler = async (payload) => {
                    console.log("TaskChanged event received:", payload);

                    if (isMounted && typeof onTaskChanged === "function") {
                        await onTaskChanged(payload);
                    }

                    if (payload?.eventType === "task-assigned") {
                        toast.success("Task data updated in real time.");
                    }
                };

                connection.on("TaskChanged", handler);
            } catch (error) {
                console.error("SignalR connection failed:", error);
            }
        };

        register();

        return () => {
            isMounted = false;
            const connection = getSignalRConnection();
            if (connection && handler) {
                connection.off("TaskChanged", handler);
            }
        };
    }, [onTaskChanged]);
}