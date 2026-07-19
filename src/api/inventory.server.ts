import { hasuraRequest } from "./graphql.server";

export async function deductInventoryFromOrders(orders: any[]) {
  if (!orders || orders.length === 0) return;

  // Group orders by product to minimize DB reads/writes
  const groupedOrders: Record<string, any[]> = {};
  for (const order of orders) {
    if (!order.product_id) continue;
    if (!groupedOrders[order.product_id]) groupedOrders[order.product_id] = [];
    groupedOrders[order.product_id].push(order);
  }

  for (const [productId, productOrders] of Object.entries(groupedOrders)) {
    try {
      // 1. Fetch current product state
      const fetchQuery = `
        query GetProductInventory($id: uuid!) {
          products_by_pk(id: $id) {
            id
            sold_count
            stock_limit
            available_sizes
            available_colors
          }
        }
      `;
      const res = await hasuraRequest<{ products_by_pk: any }>(fetchQuery, { id: productId });
      const product = res?.products_by_pk;
      if (!product) continue;

      let newSoldCount = Number(product.sold_count || 0);
      let newStockLimit = product.stock_limit ? Number(product.stock_limit) : null;
      
      const sizes = Array.isArray(product.available_sizes) ? [...product.available_sizes] : [];
      const colors = Array.isArray(product.available_colors) ? [...product.available_colors] : [];

      // 2. Process each order against the inventory
      for (const order of productOrders) {
        const qty = Number(order.qty || 1);
        newSoldCount += qty;
        
        if (newStockLimit !== null) {
          newStockLimit = Math.max(0, newStockLimit - qty);
        }

        if (order.size) {
          const sizeObj = sizes.find((s: any) => s.name === order.size);
          if (sizeObj && typeof sizeObj.stock === 'number') {
            sizeObj.stock = Math.max(0, sizeObj.stock - qty);
          }
        }

        if (order.color) {
          const colorObj = colors.find((c: any) => c.name === order.color);
          if (colorObj && typeof colorObj.stock === 'number') {
            colorObj.stock = Math.max(0, colorObj.stock - qty);
          }
        }
      }

      // 3. Save updated inventory
      const updateQuery = `
        mutation UpdateProductInventory(
          $id: uuid!, 
          $sold_count: String, 
          $stock_limit: String, 
          $available_sizes: jsonb, 
          $available_colors: jsonb
        ) {
          update_products_by_pk(
            pk_columns: { id: $id },
            _set: {
              sold_count: $sold_count,
              stock_limit: $stock_limit,
              available_sizes: $available_sizes,
              available_colors: $available_colors
            }
          ) {
            id
          }
        }
      `;
      
      await hasuraRequest(updateQuery, {
        id: productId,
        sold_count: String(newSoldCount),
        stock_limit: newStockLimit !== null ? String(newStockLimit) : null,
        available_sizes: sizes.length > 0 ? sizes : null,
        available_colors: colors.length > 0 ? colors : null,
      });

      console.log(`[Inventory] Successfully updated stock for product ${productId}`);
    } catch (e) {
      console.error(`[Inventory] Failed to deduct inventory for product ${productId}:`, e);
    }
  }
}
