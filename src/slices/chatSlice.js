import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: { messages: [] },
    reducers: {
        setMessages: (state, action) => {
            state.messages = Array.isArray(action.payload) ? action.payload : []; // Set entire message history
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload); // Add new message
        },
        deleteMessage: (state, action) => {
            state.messages = state.messages.filter(msg => msg.id !== action.payload);
        },
    },
});

export const { setMessages, addMessage, deleteMessage } = chatSlice.actions;
export default chatSlice.reducer;
