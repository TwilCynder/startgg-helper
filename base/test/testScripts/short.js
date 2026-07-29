import { Query } from "../../src/query.js";
import { basicSchema } from "./commonRequests.js";
import { processData } from "../testUtil.js";

let query = new Query(basicSchema, 3);
export default async function testShort(client, limiter){
  let result = await query.execute(client, {slug: "tournament/tls-mad-ness-25/event/1v1-ultimate"}, limiter);
  return processData(result, "event");
}