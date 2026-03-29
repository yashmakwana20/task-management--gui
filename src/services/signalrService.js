import {
    HubConnectionBuilder,
    LogLevel,
    HttpTransportType,
} from "@microsoft/signalr";

let connection = null;

const getToken = () => {
    return localStorage.getItem("token");
};

export const startSignalRConnection = async () => {
    if (
        connection &&
        (connection.state === "Connected" || connection.state === "Connecting")
    ) {
        return connection;
    }

    connection = new HubConnectionBuilder()
        .withUrl("http://localhost/TaskManagementAPI/taskHub", {
            accessTokenFactory: () => getToken() || "",
            transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(LogLevel.Information)
        .build();

    connection.onreconnecting(() => {
        console.log("SignalR reconnecting...");
    });

    connection.onreconnected(() => {
        console.log("SignalR reconnected.");
    });

    connection.onclose(() => {
        console.log("SignalR disconnected.");
    });

    await connection.start();
    console.log("SignalR connected.");

    return connection;
};

export const getSignalRConnection = () => connection;

export const stopSignalRConnection = async () => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};