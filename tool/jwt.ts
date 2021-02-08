import { create, verify, decode, getNumericDate } from "https://deno.land/x/djwt/mod.ts"
import { conf } from './conf.ts'
const jwtSecret = conf.jwtSecret
export const makeJWT = async (obj: any): Promise<string> => {
    obj.exp = getNumericDate(conf.jwtExp);
    return await create({ alg: "HS512", typ: "JWT" }, obj, jwtSecret)
}
export const decodeJWT = async (jwt: string): Promise<any> => {
    const payload = await verify(jwt, jwtSecret, "HS512");
    return payload;
}