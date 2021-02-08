import { MongoClient, Bson } from "https://deno.land/x/mongo@v0.21.0/mod.ts";
import {conf} from './conf.ts'
const client = new MongoClient();
await client.connect(conf.conn);
export const db = client.database(conf.dbname);

