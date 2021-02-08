import { Context } from "https://deno.land/x/oak/mod.ts";
import { UserSchema } from './../schema/user.ts'
import { db } from '../tool/db.ts'
import * as jwt from '../tool/jwt.ts'

const users = db.collection<UserSchema>("users");

export const findByName = async ({ request, response, params }: Context | any) => {
    const { username } = params;
    let user: any = await users.findOne({ username: username });
    if (user) {
        delete user.password;
        response.body = user;
    } else {
        response.status = 404;
        response.body = null;
    }
}

export const list = async ({ request, response, params }: Context | any) => {
    const { current, size } = params;
    const total = await users.count();
    const limit = parseInt(size);
    const skip = (parseInt(current) - 1) * limit;
    const all_users = await users.find({}).skip(skip).limit(limit);
    const arr: any[] = [];
    await all_users.forEach((element: any) => {
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

export const reg = async ({ request, response }: Context) => {
    try {
        const { username, password } = await request.body({ type: 'json' }).value;
        let user: any = await users.findOne({ username: username });
        if (user) {
            response.status = 500
            response.body = "User already existed"
        } else {

            const insertId = await users.insertOne({
                username,
                password
            })
            if (insertId) {
                response.status = 200;
                response.body = "reg ok please login";
            } else {
                response.status = 500;
                response.body = "write into database error"
            }
        }
    } catch (error) {
        response.status = 500
        response.body = "fail"
    }
}

export const login = async ({ request, response }: Context) => {
    try {
        const { username, password } = await request.body({ type: 'json' }).value;
        let user: any = await users.findOne({ username: username });
        if (user && user.password == password) {
            const jwtstr: string = await jwt.makeJWT({
                username: username
            });
            response.status = 200;
            response.body = {
                err: false,
                msg: 'login success',
                jwt: jwtstr
            }
        } else {
            response.status = 403;
            response.body = 'login fail'
        }
    } catch (error) {
        response.status = 500;
        response.body = 'login fail'
    }
}

export const logout = async (request: any) => {
    const bodyText = new TextDecoder().decode(await Deno.readAll(request.body));
    const bodyObject = JSON.parse(bodyText);
    const { username, password } = bodyObject;
    return {
        username,
        password
    }
}