"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOnlinePlayers = findOnlinePlayers;
// import { resolve } from 'path';
const index_1 = __importDefault(require("../index"));
function findOnlinePlayers() {
    return new Promise((resolve, reject) => {
        index_1.default.all("SELECT * FROM matchmaking WHERE status = 'ONLINE'", (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
//# sourceMappingURL=matchmaking.repository.js.map