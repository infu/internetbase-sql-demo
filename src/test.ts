import { $query, $update, nat32, text, float64, Vec, Record, Tuple, blob } from "azle";
import { db, me } from "ibase_sql";

$update; export function register(name: text, age: nat32): nat32 {
  db.execute("INSERT INTO user (principal, name, age) VALUES (?1, ?2, ?3)",
    me(),
    name,
    age
  );
  return db.last_id();
}

$query; export function top_users(): Vec<User> {
  return db.query<User>("SELECT id, principal, name, age, rating FROM user ORDER BY rating DESC LIMIT 10");
}

$query; export function is_registered(): boolean {
  let [id] = db.query_tuple<[nat32]>("SELECT id FROM user WHERE principal = ?", me());
  return id ? true : false
}

type User = Record<{
  id: nat32;
  principal: blob;
  name: text;
  age: nat32;
  rating: float64;
}>



$update;
export function execute(q: string): nat32 {
  return db.execute(q);

}

$query;
export function query(q: string): string {
  let x;
  try {
    x = db.query(q);
  } catch (e) {
    return e as string
  }
  return JSON.stringify(x);
}



$query;
export function queryt1(): string {
  let x = db.query_tuple<[nat32, blob]>("SELECT id, principal FROM user LIMIT 10")
  return JSON.stringify(x);
}


$query;
export function queryt2(): Vec<Tuple<[nat32, blob]>> {
  return db.query_tuple<Tuple<[nat32, blob]>>("SELECT id, principal FROM user LIMIT 10")
}



$query;
export function queryt3(): Vec<Record<{ id: nat32, principal: blob }>> {
  return db.query<Record<{ id: nat32, principal: blob }>>("SELECT id, principal FROM user LIMIT 10")
}

$query;
export function queryt4(): Vec<Record<{ id: nat32, principal: blob }>> {
  return db.query<{ id: nat32, principal: blob }>("SELECT id, principal FROM user LIMIT 10")
}
