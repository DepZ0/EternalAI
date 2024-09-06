import { OpenAiDataBase } from "database/openAiDb";
import { UserDataBase } from "database/userDb";
import OpenAI from "openai";
import { BadRequestError } from "util/customErrors";

export class OpenAiService {
  constructor(private openAiDataBase: OpenAiDataBase, private userDataBase: UserDataBase, private openai: OpenAI) {}

  public sendMessage = async (body: { userId: number; messageText: string; roleMsg: string; famousPerson: string }) => {
    const { userId, messageText, roleMsg, famousPerson } = body;

    // Find or create chat
    const chat = await this.openAiDataBase.findOrCreateChat({ userId, famousPerson });
    const chatId = chat.id;

    const getAllMessagesForCheckLenght = await this.openAiDataBase.getMessagesByChatId(chatId);
    const user = await this.userDataBase.getUserById(userId);

    //
    const maxFreeMessagesCount: number = user.sharedBonusMessages === false ? 10 : 16;
    // In DB we have 2 lines after 1 request, 1 from user and 1 from bot. So 10 = 5 msg, 16 = 5(default free msg) + 3 msg(msg for share link)

    if (getAllMessagesForCheckLenght.length >= maxFreeMessagesCount) {
      const isSubscriprionExist = await this.userDataBase.getSubscriptionByUserId(userId);
      if (!isSubscriprionExist) throw new BadRequestError("For send me more messages - You need to buy subscription");
    }

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

    const getAllMessagesForCheckLenght = await this.openAiDataBase.getMessagesByChatId(chat.id);
    if (getAllMessagesForCheckLenght.length >= 10) {
      const isSubscriprionExist = await this.userDataBase.getSubscriptionByUserId(userId);
      if (!isSubscriprionExist || isSubscriprionExist.active === false)
        throw new BadRequestError("For send me more messages or clear message history - You need to buy subscription");
    }

    try {
      const clearMessages = await this.openAiDataBase.clearMessageHistory(chat.id, famousPerson, userId);
      return clearMessages;
    } catch (error) {
      return error;
    }
  };

  public getTestChat = async (body: { messageText: string; roleMsg: string; famousPerson: string }) => {};
}
