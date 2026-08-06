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

  const productData = (ctx.data as any).data
    ? { ...(ctx.data as any).data }
    : { ...(ctx.data as any) };
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

  const payload = (ctx.data as any).data || ctx.data;
  const { id, ...setData } = payload as any;

  return hasuraRequest(UPDATE_PRODUCT, { id, set: setData });
});

const GET_WORKSPACE_PRODUCTS = `
  query GetWorkspaceProducts($workspace_id: uuid!) {
    products(where: { workspace_id: { _eq: $workspace_id } }, order_by: { created_at: desc }) {
      id
      workspace_id
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
      category
      available_sizes
      available_colors
      specs
      event_id
      event {
        id
        title
      }
    }
  }
`;

export const getWorkspaceProducts = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const payload = (ctx.data as any).data || ctx.data;
  const { workspace_id } = payload as { workspace_id: string };
  if (!workspace_id) return [];
  const data = await hasuraRequest<{ products: any[] }>(GET_WORKSPACE_PRODUCTS, { workspace_id });
  return data.products || [];
});

const GET_EVENT_PRODUCTS = `
  query GetEventProducts($event_id: uuid!, $contains_obj: jsonb) {
    products(
      where: {
        _or: [
          { event_id: { _eq: $event_id } },
          { specs: { _contains: $contains_obj } }
        ]
      }
      order_by: { created_at: desc }
    ) {
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
      category
      available_sizes
      available_colors
      specs
      product_orders_aggregate {
        aggregate {
          sum {
            current_balance
          }
        }
      }
    }
  }
`;

export const getEventProducts = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const payload = (ctx.data as any).data || ctx.data;
  const { event_id } = payload as { event_id: string };
  try {
    const payloadVars = {
      event_id,
      contains_obj: { linked_assets: [{ type: "event", id: event_id }] },
    };

    const data = await hasuraRequest<{ products: any[] }>(GET_EVENT_PRODUCTS, payloadVars);

    return data.products || [];
  } catch (err) {
    console.error("GET_EVENT_PRODUCTS Error:", err);
    return [];
  }
});

const GET_VENUE_PRODUCTS = `
  query GetVenueProducts($contains_obj: jsonb) {
    products(
      where: {
        specs: { _contains: $contains_obj }
      }
      order_by: { created_at: desc }
    ) {
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
      category
      available_sizes
      available_colors
      specs
      product_orders_aggregate {
        aggregate {
          sum {
            current_balance
          }
        }
      }
    }
  }
`;

export const getVenueProducts = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const payload = (ctx.data as any).data || ctx.data;
  const { venue_id } = payload as { venue_id: string };
  try {
    const data = await hasuraRequest<{ products: any[] }>(GET_VENUE_PRODUCTS, {
      contains_obj: { linked_assets: [{ type: "venue", id: venue_id }] },
    });
    return data.products || [];
  } catch (err) {
    console.error("GET_VENUE_PRODUCTS Error:", err);
    return [];
  }
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
      category
      available_sizes
      available_colors
      specs
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
      limit: 250
    ) {
      id
      product_id
      amount_paid
      status
      picked
      created_at
      qty
      size
      phone
      qr_code_string
      current_balance
      decrptions
      buyer_id
      product {
        name
        type
        specs 
        available_sizes
        available_colors
        event {
          title
        }
      }
      user {
        username
        handle
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

  const orders = data.product_orders || [];

  // Enhance guest orders with attendee names if they exist
  const guestPhones = orders.filter((o: any) => !o.user && o.phone).map((o: any) => o.phone);
  if (guestPhones.length > 0) {
    const attendeesQuery = `
      query GetGuestAttendees($phones: [String!]!) {
        event_attendees(where: { phone: { _in: $phones } }) {
          phone
          names
        }
      }
    `;
    const attData = await hasuraRequest<{ event_attendees: any[] }>(attendeesQuery, {
      phones: guestPhones,
    });
    const attendees = attData.event_attendees || [];
    const phoneToName = attendees.reduce((acc: any, a: any) => {
      if (a.phone && a.names) acc[a.phone] = a.names;
      return acc;
    }, {});

    orders.forEach((o: any) => {
      if (!o.user && o.phone && phoneToName[o.phone]) {
        o.guest_name = phoneToName[o.phone];
      }
    });
  }

  return orders;
});

const CREATE_PRODUCT_ORDER = `
  mutation CreateProductOrder($objects: [product_orders_insert_input!]!) {
    insert_product_orders(objects: $objects) {
      affected_rows
      returning {
        id
        picked
      }
    }
  }
`;

export const createProductOrders = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const payload = (ctx.data as any).data || ctx.data;
  let objects = payload.objects || payload;

  if (Array.isArray(objects) && objects.length > 0) {
    const productIds = [...new Set(objects.map((o: any) => o.product_id).filter(Boolean))];

    if (productIds.length > 0) {
      const query = `
        query GetProductsForOrders($ids: [uuid!]!) {
          products(where: { id: { _in: $ids } }) {
            id
            type
            value_amount
          }
        }
      `;
      const productsData = await hasuraRequest<{ products: any[] }>(query, { ids: productIds });
      const productMap = new Map();
      productsData.products?.forEach((p) => productMap.set(p.id, p));

      objects = objects.map((obj: any) => {
        let newObj = { ...obj };

        // Ensure size is set for products without variants to satisfy NOT NULL constraint
        if (!newObj.size) newObj.size = "N/A";

        if (newObj.product_id) {
          const product = productMap.get(newObj.product_id);
          if (product && product.type === "voucher" && product.value_amount) {
            const qty = newObj.qty || 1;
            return { ...newObj, current_balance: Number(product.value_amount) * qty };
          }
        }
        return newObj;
      });
    }
  }

  return hasuraRequest(CREATE_PRODUCT_ORDER, { objects });
});

const GET_BOOKING_PRODUCT_ORDERS = `
  query GetBookingProductOrders($buyer_id: uuid!) {
    product_orders(
      where: { buyer_id: { _eq: $buyer_id }, status: { _eq: "Confirmed" } },
      order_by: { created_at: desc }
    ) {
      id
      amount_paid
      status
      picked
      created_at
      qty
      size
      phone
      qr_code_string
      product {
        name
        type
        specs 
        image_url
        event {
          id
          title
        }
      }
    }
  }
`;

export const getBookingProductOrders = createServerFn({ method: "POST" })
  .validator((d: { data: { buyer_id?: string } }) => d)
  .handler(async (ctx) => {
    const payload = (ctx.data as any).data || ctx.data;
    const { buyer_id } = payload as { buyer_id: string };
    const data = await hasuraRequest<{ product_orders: any[] }>(GET_BOOKING_PRODUCT_ORDERS, {
      buyer_id,
    });
    return data.product_orders || [];
  });

export const checkProductOrderStatus = createServerFn({ method: "POST" })
  .validator((d: { data: { bookingRef: string } }) => d)
  .handler(async (ctx) => {
    const payload = (ctx.data as any).data || ctx.data;
    const { bookingRef } = payload as { bookingRef: string };
    if (!bookingRef) return null;
    const { hasuraRequest } = await import("./graphql.server");
    const query = `
      query CheckProductOrderStatus($ref: String!) {
        product_orders(where: { decrptions: { _eq: $ref } }, limit: 1) {
          status
        }
      }
    `;
    const data = await hasuraRequest<{ product_orders: any[] }>(query, { ref: bookingRef });
    return data.product_orders?.[0]?.status || null;
  });
