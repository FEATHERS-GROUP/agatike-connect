import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

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
  const productData = ctx.data as any;
  return hasuraRequest(CREATE_PRODUCT, { object: productData });
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
