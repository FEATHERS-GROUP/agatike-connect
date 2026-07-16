import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";
import { getSession } from "./auth";

const CREATE_PRODUCT = `
  mutation CreateProduct($object: products_insert_input!) {
    insert_products_one(object: $object) {
      id
      name
      type
    }
  }
`;

export const createProduct = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const productData = ctx.data as any;
  productData.organizer_id = session.sub;

  return hasuraRequest(CREATE_PRODUCT, { object: productData });
});

const UPDATE_PRODUCT = `
  mutation UpdateProduct($id: uuid!, $set: products_set_input!) {
    update_products_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
      type
    }
  }
`;

export const updateProduct = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const session = await getSession();
  if (!session || !session.sub) throw new Error("unauthenticated");

  const { id, ...setData } = ctx.data as any;

  return hasuraRequest(UPDATE_PRODUCT, { id, set: setData });
});

const GET_WORKSPACE_PRODUCTS = `
  query GetWorkspaceProducts($workspace_id: uuid!) {
    products(where: { workspace_id: { _eq: $workspace_id }, event_id: { _is_null: true } }, order_by: { created_at: desc }) {
      id
      name
      type
      description
      price
      value_amount
      stock_limit
      sold_count
      punch_count
      reward_description
      image_url
      is_active
    }
  }
`;

export const getWorkspaceProducts = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ products: any[] }>(GET_WORKSPACE_PRODUCTS, { workspace_id });
  return data.products || [];
});

const GET_EVENT_PRODUCTS = `
  query GetEventProducts($event_id: uuid!) {
    products(where: { event_id: { _eq: $event_id } }, order_by: { created_at: desc }) {
      id
      name
      type
      description
      price
      value_amount
      stock_limit
      sold_count
      punch_count
      reward_description
      image_url
      is_active
    }
  }
`;

export const getEventProducts = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { event_id } = ctx.data as unknown as { event_id: string };
  const data = await hasuraRequest<{ products: any[] }>(GET_EVENT_PRODUCTS, { event_id });
  return data.products || [];
});

const GET_PRODUCT = `
  query GetProduct($id: uuid!) {
    products_by_pk(id: $id) {
      id
      name
      type
      description
      price
      value_amount
      stock_limit
      sold_count
      punch_count
      reward_description
      image_url
      is_active
    }
  }
`;

export const getProduct = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { id } = ctx.data as unknown as { id: string };
  const data = await hasuraRequest<{ products_by_pk: any }>(GET_PRODUCT, { id });
  return data.products_by_pk;
});

const GET_WORKSPACE_RECENT_ORDERS = `
  query GetWorkspaceRecentOrders($workspace_id: uuid!) {
    product_orders(
      where: { product: { workspace_id: { _eq: $workspace_id } } },
      order_by: { created_at: desc },
      limit: 5
    ) {
      id
      amount_paid
      status
      created_at
      product {
        name
        type
        event {
          title
        }
      }
      user {
        first_name
        last_name
        email
      }
    }
  }
`;

export const getWorkspaceRecentOrders = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { workspace_id } = ctx.data as unknown as { workspace_id: string };
  const data = await hasuraRequest<{ product_orders: any[] }>(GET_WORKSPACE_RECENT_ORDERS, {
    workspace_id,
  });
  return data.product_orders || [];
});
