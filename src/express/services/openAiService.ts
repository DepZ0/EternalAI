import { OpenAiDataBase } from "database/openAiDb";
import OpenAI from "openai";

export class OpenAiService {
  constructor(private openAiDataBase: OpenAiDataBase, private openai: OpenAI) {}

  public sendMessage = async (body: { userId: number; messageText: string; roleMsg: string; famousPerson: string }) => {
    const { userId, messageText, roleMsg, famousPerson } = body;

    // Find or create chat
    const chat = await this.openAiDataBase.findOrCreateChat({ userId, famousPerson });

    const chatId = chat.id;

    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: "system", content: roleMsg },
        { role: "user", content: messageText },
      ],
      model: process.env.OPEN_AI_CHAT_MODEL,
    });

    const assistantMessage = String(completion.choices[0].message.content);
    const senderRole = completion.choices[0].message.role ? "assistant" : "user";

    // Save message from user
    await this.openAiDataBase.createMessage({
      chatId,
      sender: "user",
      messageText,
    });

    // Save message from assistant
    if (senderRole === "assistant") {
      await this.openAiDataBase.createMessage({
        chatId,
        sender: "assistant",
        messageText: assistantMessage,
      });
    }

    const getAllMessages = await this.openAiDataBase.getMessagesByChatId(chatId);
    return getAllMessages;
  };

  public clearMessageHistory = async (body: { userId: number; famousPerson: string }) => {
    const { userId, famousPerson } = body;
    const chat = await this.openAiDataBase.findOrCreateChat({ userId, famousPerson });

    try {
      const clearMessages = await this.openAiDataBase.clearMessageHistory(chat.id, famousPerson, userId);
      return clearMessages;
    } catch (error) {
      return error;
    }
  };
}
