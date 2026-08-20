import { readStorage, removeStorage, writeStorage } from "./storageManager";

export const storage = {
    read: readStorage,
    write: writeStorage,
    remove: removeStorage
}