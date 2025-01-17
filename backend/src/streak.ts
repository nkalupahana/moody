import { getDatabase } from "firebase-admin/database";
import { AnyMap, UserRequest, validateKeys } from "./helpers.js";
import { Response } from "express";
import { DateTime } from "luxon";
import AES from "crypto-js/aes.js";
import aesutf8 from "crypto-js/enc-utf8.js";

const FETCH_LIMIT = 100;

export const calculateStreak = async (req: UserRequest, res: Response) => {
    const db = getDatabase();
    const data = req.body;
    const encryptionKey = await validateKeys(data.keys, db, req.user!.user_id);

    if (!encryptionKey) {
        res.send(400);
        return;
    }

    const logRef = db.ref(req.user!.user_id + "/logs").orderByKey();
    let logs: AnyMap = await (await logRef.limitToLast(FETCH_LIMIT).get()).val();
    if (!logs || Object.keys(logs).length === 0) {
        res.send({ streak: 0, danger: false });
        return;
    }

    const today = DateTime.fromISO(data.currentDate);
    let latestLog: AnyMap = JSON.parse(AES.decrypt(logs[Object.keys(logs).at(-1)!].data, encryptionKey).toString(aesutf8));
    let top = DateTime.fromObject({ year: latestLog.year, month: latestLog.month, day: latestLog.day });

    // If the top log is not today or yesterday, the streak is 0
    if (top.toISODate() !== today.toISODate() && top.toISODate() !== today.minus({ days: 1 }).toISODate()) {
        res.send({ streak: 0, danger: false });
        return;
    }
    // If the top log is yesterday, the user is in danger of losing their streak.
    let danger = top.toISODate() === today.minus({ days: 1 }).toISODate();

    let streak = 1;
    let running = true;
    while (running && Object.keys(logs).length > 0) {
        // Same general logic as `calculateStreak` in the frontend
        // (max change of one day to continue streak)
        const logKeys = Object.keys(logs).reverse();
        for (const key of logKeys) {
            const log = JSON.parse(AES.decrypt(logs[key].data, encryptionKey).toString(aesutf8));
            if (top.day !== log.day || top.month !== log.month || top.year !== log.year) {
                const logDT = DateTime.fromObject({ year: log.year, month: log.month, day: log.day });
                if (logDT.toISODate() === top.minus({ days: 1 }).toISODate()) {
                    top = logDT;
                    ++streak;
                } else {
                    running = false;
                    break;
                }
            }
        }

        // If the streak is going and we've run out of logs, try fetch more
        if (running) {
            logs = await (await logRef.endBefore(Object.keys(logs)[0]).limitToLast(FETCH_LIMIT).get()).val();
        }
    }


    res.send({ streak, danger });
};