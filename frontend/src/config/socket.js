import { io } from "socket.io-client";
import { baseURL } from ".";

const socket = io(baseURL);

export default socket;
