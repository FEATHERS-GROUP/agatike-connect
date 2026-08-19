import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

const GET_SPACE_PROMOTIONS = `
  query GetSpacePromotions($space_id: uuid!) {
    space_promotions(where: { space_id: { _eq: $space_id } }, order_by: { created_at: desc }) {
      id
      space_id
      code
      discount_percentage
      flat_amount
      max_uses
      uses
      expires_at
      is_active
      created_at
    }
  }
`;

export const getSpacePromotions = createServerFn({ method: "POST" })
  .validator((d: { space_id: string }) => d)
  .handler(async (ctx) => {
    const { space_id } = ctx.data;
    const res = await hasuraRequest<{ space_promotions: any[] }>(GET_SPACE_PROMOTIONS, { space_id });
    return res.space_promotions || [];
  });

const CREATE_SPACE_PROMOTION = `
  mutation CreateSpacePromotion($object: space_promotions_insert_input!) {
    insert_space_promotions_one(object: $object) {
      id
    }
  }
`;

export const createSpacePromotion = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async (ctx) => {
    const object = ctx.data;
    const res = await hasuraRequest<{ insert_space_promotions_one: { id: string } }>(
      CREATE_SPACE_PROMOTION,
      { object }
    );
    return res.insert_space_promotions_one;
  });

const UPDATE_SPACE_PROMOTION = `
  mutation UpdateSpacePromotion($id: uuid!, $object: space_promotions_set_input!) {
    update_space_promotions_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`;

export const updateSpacePromotion = createServerFn({ method: "POST" })
  .validator((d: { id: string; object: any }) => d)
  .handler(async (ctx) => {
    const { id, object } = ctx.data;
    const res = await hasuraRequest<{ update_space_promotions_by_pk: { id: string } }>(
      UPDATE_SPACE_PROMOTION,
      { id, object }
    );
    return res.update_space_promotions_by_pk;
  });

const DELETE_SPACE_PROMOTION = `
  mutation DeleteSpacePromotion($id: uuid!) {
    delete_space_promotions_by_pk(id: $id) {
      id
    }
  }
`;

export const deleteSpacePromotion = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    const res = await hasuraRequest<{ delete_space_promotions_by_pk: { id: string } }>(
      DELETE_SPACE_PROMOTION,
      { id }
    );
    return res.delete_space_promotions_by_pk;
  });

const VALIDATE_PROMO = `
  query ValidatePromo($code: String!, $space_id: uuid!) {
    space_promotions(
      where: { code: { _eq: $code }, space_id: { _eq: $space_id }, is_active: { _eq: true } }
    ) {
      id
      code
      discount_percentage
      flat_amount
      max_uses
      uses
      expires_at
      is_active
    }
  }
`;

export const validateSpacePromotion = createServerFn({ method: "POST" })
  .validator((d: { code: string; space_id: string }) => d)
  .handler(async (ctx) => {
    const { code, space_id } = ctx.data;
    const res = await hasuraRequest<{ space_promotions: any[] }>(VALIDATE_PROMO, {
      code,
      space_id,
    });

    const promo = res.space_promotions?.[0];
    if (!promo) {
      throw new Error("Invalid promo code");
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      throw new Error("Promo code has expired");
    }

    if (promo.max_uses !== null && promo.uses >= promo.max_uses) {
      throw new Error("Promo code usage limit reached");
    }

    return promo;
  });

const INCREMENT_USES = `
  mutation IncrementPromoUses($id: uuid!) {
    update_space_promotions_by_pk(
      pk_columns: { id: $id },
      _inc: { uses: 1 }
    ) {
      id
      uses
    }
  }
`;

export const incrementPromoUses = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async (ctx) => {
    const { id } = ctx.data;
    const res = await hasuraRequest<{ update_space_promotions_by_pk: { id: string; uses: number } }>(
      INCREMENT_USES,
      { id }
    );
    return res.update_space_promotions_by_pk;
  });
