export interface Message {
    id: string;
    sender: string;
    message: string;
    chat_id?: string;
    createdAt?: string;
    edit?: boolean
}