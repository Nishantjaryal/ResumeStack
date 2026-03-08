import { HumeClient } from "hume";
import { env } from "process";

export async function fetchChatMessages(humeChatId: string) {

    "use cache";
    const client = new HumeClient({apiKey: env.HUME_API_KEY!});
    const messages = []
    const chateventInterator = await client.empathicVoice.chats.listChatEvents(humeChatId, { pageNumber: 0, pageSize:100});  
    for await (const chatEvent of chateventInterator){
        messages.push(chatEvent)
    }
    return messages;
}