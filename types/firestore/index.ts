export * from "./heist";

export interface UserDoc {
  id: string;
  codename: string;
}

export const COLLECTIONS = {
  HEISTS: "heists",
  USERS: "users",
} as const;
