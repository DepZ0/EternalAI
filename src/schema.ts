import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  foreignKey,
  date,
} from "drizzle-orm/pg-core";

// Таблица users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  googleId: varchar("google_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Таблица subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true).notNull(),
});

// Таблица questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  questionText: text("question_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Таблица answers
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  answerText: text("answer_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Таблица famous_people
export const famousPeople = pgTable("famous_people", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

// Таблица chats
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  famousPersonId: integer("famous_person_id")
    .references(() => famousPeople.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Таблица messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  sender: varchar("sender", { length: 50 }).notNull(), // user или famous_person
  messageText: text("message_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refreshTokens", {
  id: integer("id").primaryKey(),
  userId: integer("userId"),
  token: text("token"),
  createdAt: timestamp("createdAt"),
  expiresIn: date("expiresIn"),
  device: varchar("device", { length: 200 }),
});
