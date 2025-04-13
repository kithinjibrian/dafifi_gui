export interface Message {
    id?: string;
    mock: boolean;
    sender: string;
    message: string;
    time?: string;
    chat_id?: string;
    executed?: boolean;
}