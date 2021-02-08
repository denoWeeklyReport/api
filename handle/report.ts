import { Context } from "https://deno.land/x/oak/mod.ts";
import { ReportSchema } from './../schema/report.ts'
import { db } from '../tool/db.ts'
import * as jwt from '../tool/jwt.ts'
import { Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";

const reports = db.collection<ReportSchema>("reports");
export const getById = async ({ request, response, params }: Context | any) => {
    const { id } = params;
    console.log(id)
    const report = await reports.findOne({ _id: new Bson.ObjectId(id) });
    console.log(report)
    response.body = {
        report: report
    };
}
export const get = async ({ request, response, params }: Context | any) => {
    const { username, year, week } = params;
    const y = parseInt(year);
    const w = parseInt(week);
    const report = await reports.findOne({ username: username, year: y, week: w });
    if (!report) {
        response.status = 404;
    }
    console.log(report)
    response.body = {
        report: report
    };
}
export const insert = async ({ request, response, params }: Context | any) => {
    const { username, text, year, week } = await request.body({ type: 'json' }).value;
    const y = parseInt(year);
    const w = parseInt(week);
    const jwtstring = request.headers.get("jwt");
    if (jwtstring) {
        const payload = await jwt.decodeJWT(jwtstring);
        console.log(payload, username, payload.username == username)
        if (payload.username == username) {
            const insertId = await reports.insertOne({
                username: username,
                year: y,
                week: w,
                text: text
            });
            if (insertId) {
                response.status = 200;
                response.body = "insert ok";
            } else {
                response.status = 500;
                response.body = "insert error";
            }
        } else {
            response.status = 403;
            response.body = "user own false";
        }

    } else {
        response.status = 403;
        response.body = "no jwt found";
    }
}
export const remove = async ({ request, response, params }: Context | any) => {

}
export const update = async ({ request, response, params }: Context | any) => {
    const { username, text, year, week } = await request.body({ type: 'json' }).value;
    const y = parseInt(year);
    const w = parseInt(week);
    const jwtstring = request.headers.get("jwt");
    if (jwtstring) {
        const payload = await jwt.decodeJWT(jwtstring);
        console.log(payload, username, payload.username == username)
        if (payload.username == username) {
            const { matchedCount, modifiedCount, upsertedId } = await reports.updateOne(
                { username: username, year: y, week: w },
                { $set: { text: text } }
            );
            if (modifiedCount == 1) {
                response.status = 200;
                response.body = "update ok";
            } else {
                response.status = 500;
                response.body = "update error";
            }
        } else {
            response.status = 403;
            response.body = "user own false";
        }

    } else {
        response.status = 403;
        response.body = {
            msg: "no jwt found"
        }
    }
    // console.log(jwt);
    // const report = await reports.findOne({ _id: new Bson.ObjectId(id) });
}
export const list = async ({ request, response, params }: Context | any) => {
    const { username, current, size } = params;
    const total = await reports.count({ username: username });
    const limit = parseInt(size);
    const skip = (parseInt(current) - 1) * limit;
    const all_reports = await reports.find({ username: username }).skip(skip).limit(limit).sort({"_id":-1});
    const arr: any[] = [];
    await all_reports.forEach((element: any) => {
        delete element.password;
        arr.push(element);
    });
    response.body = {
        total: total,
        size: size,
        page: {
            current: current,
            max: Math.ceil(total / size),
        },
        list: arr
    };
}