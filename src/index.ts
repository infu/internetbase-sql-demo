import { $query, $update, nat32, nat8, Opt, text, float64, Vec, Record, Tuple, blob } from "azle";
import { db, me } from "ibase_sql";

type Category = Record<{
  id: nat32;
  name: text;
  parent_id: Opt<nat32>;
  image_url: Opt<text>;
}>;

$update; // These will become query once Azle has SQL plugin
export function get_categories(): Vec<Category> {
  return db.query<Category>(`SELECT id, name, parent_id, image_url FROM categories`);
}


type UserService = Record<{
  id: nat32;
  user_id: nat32;
  category_id: nat32;
  avg_completion_time: nat32;
  completed_count: nat32;
  title: text;
  price: nat32;
  image_url: Opt<text>;
  rating: float64;
  total_ratings: nat32;
  created_at: text;
  user_rating: float64;
  user_total_ratings: nat32;
  user_img: text;
  user_name: text;
}>

$query;
export function search_services(term: string): Vec<UserService> {
  return db.query<UserService>(`SELECT s.id, s.user_id, s.category_id, s.avg_completion_time, s.completed_count,
    s.title, s.price, s.image_url, s.rating, s.total_ratings, s.created_at, u.rating as user_rating,
    u.total_ratings as user_total_ratings, u.image_url as user_img, u.username as user_name
    FROM services AS s
    JOIN services_search AS ss ON s.id = ss.id
    JOIN users AS u ON s.user_id = u.id
    WHERE ss.title MATCH ?1 ORDER BY s.rating DESC LIMIT 20`, term);
}


type UserInfo = Record<{
  username: text;
  rating: float64;
  total_ratings: nat32;
  created_at: text;
  last_logged_in: text;
  about: text;
  image_url: text;
}>

$query;
export function get_user_info(id: nat32): UserInfo {
  return db.query_one<UserInfo>(`SELECT username, rating, total_ratings, created_at, last_logged_in, about, image_url FROM users WHERE id = ?1 LIMIT 1`, id);
}


$update; export function user_register(username: text, email: text, about: text): nat32 {
  db.execute("INSERT INTO users (principal, username, email, about) VALUES (?1, ?2, ?3, ?4)",
    me(),
    username,
    email,
    about
  );
  return db.last_id();
}

type MyInfo = Record<{
  id: nat32;
  username: text;
  rating: float64;
  total_ratings: nat32;
  last_logged_in: text;
  image_url: Opt<text>;
  tokens: nat32;
}>


$query;
export function get_my_info(): MyInfo {
  return db.query_one<MyInfo>(`SELECT id, username, rating, total_ratings, last_logged_in, image_url, tokens FROM users WHERE principal = ?1 LIMIT 1`, me());
}

type Order = Record<{
  service_id: nat32;
  prompt: text;
  buyer_id: nat32;
  seller_id: nat32;
  status: nat32;
  chat: text;
  rated: Opt<nat32>;
  created_at: text;
  updated_at: text;
  price: nat32;
  completed_at: Opt<text>;
}>

$query;
export function get_order(id: nat32): Order {
  return db.query_one<Order>(`SELECT service_id, prompt, buyer_id, seller_id, status, chat, rated, created_at, updated_at, price, completed_at
    FROM orders WHERE id = ?1 LIMIT 1`, id);
}

type ServiceFull = Record<{
  id: nat32;
  user_id: nat32;
  category_id: nat32;
  is_available: nat8;
  avg_completion_time: nat32;
  completed_count: nat32;
  title: text;
  description: text;
  price: nat32;
  image_url: text;
  rating: float64;
  total_ratings: nat32;
  created_at: text;
  user_rating: float64;
  user_total_ratings: nat32;
  user_img: text;
  user_name: text;
  user_about: text;
  gallery: text;
}>

$query;
export function get_service(id: nat32): ServiceFull {
  return db.query_one<ServiceFull>(`SELECT s.id, s.user_id, s.category_id, s.is_available, 
    s.avg_completion_time, s.completed_count, s.title, s.description, s.price,
    s.image_url, s.rating, s.total_ratings, s.created_at, users.rating as user_rating,
    users.total_ratings as user_total_ratings, users.image_url as user_img, users.username as user_name,
    users.about as user_about, s.gallery
    FROM services as s LEFT JOIN users ON users.id = s.user_id
    WHERE s.id = ?1 LIMIT 1`, id);
}

type Service = Record<{
  id: nat32;
  user_id: nat32;
  category_id: nat32;
  is_available: nat8;
  avg_completion_time: nat32;
  completed_count: nat32;
  title: text;
  price: nat32;
  image_url: Opt<text>;
  rating: float64;
  total_ratings: nat32;
  created_at: text;
}>

$query;
export function get_user_services(user_id: nat32): Vec<Service> {
  return db.query<Service>(`SELECT id, user_id, category_id, is_available,  
  avg_completion_time, completed_count, title, price, image_url,
  rating, total_ratings, created_at
  FROM services
  WHERE is_available = 1 AND user_id = ?1
  ORDER BY completed_count DESC LIMIT 20`, user_id);
}


$query;
export function get_category_services(category_id: nat32): Vec<UserService> {
  return db.query<UserService>(`SELECT s.id, s.user_id, s.category_id, s.is_available, 
    s.avg_completion_time, s.completed_count, s.title, s.price, s.image_url,
    s.rating, s.total_ratings, s.created_at, users.rating as user_rating, users.total_ratings as user_total_ratings,
    users.image_url as user_img, users.username as user_name
    FROM services as s LEFT JOIN users ON users.id = s.user_id
    WHERE s.is_available = 1 AND category_id = ?1
    ORDER BY s.completed_count DESC LIMIT 20`, category_id);
}

$query;
export function get_top_services(): Vec<UserService> {
  return db.query<UserService>(`SELECT s.id, s.user_id, s.category_id, s.is_available,  s.avg_completion_time, 
    s.completed_count, s.title, s.price, s.image_url, s.rating, s.total_ratings, s.created_at, users.rating as user_rating,
    users.total_ratings as user_total_ratings, users.image_url as user_img, users.username as user_name
    FROM services as s LEFT JOIN users ON users.id = s.user_id
    WHERE s.rating > 7 AND s.is_available = 1
    ORDER BY s.completed_count DESC LIMIT 20`);

}


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

