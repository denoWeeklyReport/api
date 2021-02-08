import * as yaml2json from 'https://deno.land/x/yaml2json/mod.ts'
export const conf = await yaml2json.obj("./conf.yml")