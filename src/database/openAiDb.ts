import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { messages, chats } from "schema";

export class OpenAiDataBase {
  constructor(private db: NodePgDatabase) {}

  public async findOrCreateChat(body: { userId: number; famousPerson: string }) {
    let chat = await this.db
      .select()
      .from(chats)
      .where(and(eq(chats.userId, body.userId), eq(chats.famousPerson, body.famousPerson)))
      .then((rows) => rows[0]);

    if (!chat) {
      [chat] = await this.db.insert(chats).values({ userId: body.userId, famousPerson: body.famousPerson }).returning({
        id: chats.id,
        createdAt: chats.createdAt,
        userId: chats.userId,
        famousPerson: chats.famousPerson,
      });

      chat = chat as { id: number; createdAt: Date; userId: number; famousPerson: string };
    }

    return chat;
  }

  public async createMessage(body: { chatId: number; sender: string; messageText: string }) {
    const insertMessageToDb = await this.db
      .insert(messages)
      .values({ chatId: body.chatId, sender: body.sender, messageText: body.messageText });

    return insertMessageToDb;
  }

  public async getMessagesByChatId(chatId: number) {
    const getMessages = await this.db
      .select({
        sender: messages.sender,
        messageText: messages.messageText,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    return getMessages;
  }

  public async clearMessageHistory(chatId: number, famousPerson: string, userId: number) {
    const clearMessages = await this.db.delete(messages).where(eq(messages.chatId, chatId));
    const clearChat = await this.db
      .delete(chats)
      .where(and(eq(chats.userId, userId), eq(chats.famousPerson, famousPerson)));

    return { clearMessages, clearChat };
  }
}
