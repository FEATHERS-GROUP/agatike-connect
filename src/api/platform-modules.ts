import { createServerFn } from "@tanstack/react-start";
import { hasuraRequest } from "./graphql.server";

export interface PlatformModule {
  category: string;
  created_at: string;
  desc: string;
  href: string;
  icon: string;
  id: string;
  label: string;
  mandatory: boolean;
  updated_at: string;
}

export const getPlatformModules = createServerFn({ method: "GET" }).handler(async () => {
  const query = `
    query MyQuery {
      platformModules {
        category
        created_at
        desc
        href
        icon
        id
        label
        mandatory
        updated_at
      }
    }
  `;

  const data = await hasuraRequest<{ platformModules: PlatformModule[] }>(query);
  return data.platformModules;
});

export const createPlatformModule = createServerFn({ method: "POST" })
  .validator(
    (d: {
      category: string;
      desc: string;
      href: string;
      icon: string;
      label: string;
      mandatory: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    const mutation = `
      mutation InsertPlatformModule($object: platformModules_insert_input!) {
        insert_platformModules_one(object: $object) {
          id
          label
          category
          desc
          href
          icon
          mandatory
          created_at
          updated_at
        }
      }
    `;

    const res = await hasuraRequest<{ insert_platformModules_one: PlatformModule }>(mutation, {
      object: data,
    });

    return res.insert_platformModules_one;
  });

export const updatePlatformModule = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      data: {
        category: string;
        desc: string;
        href: string;
        icon: string;
        label: string;
        mandatory: boolean;
      };
    }) => d,
  )
  .handler(async ({ data: { id, data } }) => {
    const mutation = `
      mutation UpdatePlatformModule($id: uuid!, $set: platformModules_set_input!) {
        update_platformModules_by_pk(pk_columns: { id: $id }, _set: $set) {
          id
          label
          category
          desc
          href
          icon
          mandatory
          created_at
          updated_at
        }
      }
    `;

    const res = await hasuraRequest<{ update_platformModules_by_pk: PlatformModule }>(mutation, {
      id,
      set: data,
    });

    return res.update_platformModules_by_pk;
  });
