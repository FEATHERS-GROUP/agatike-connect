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
          }
        }
      `;
      const res = await hasuraRequest<{ products_by_pk: any }>(fetchQuery, { id: productId });
      const product = res?.products_by_pk;
      if (!product) continue;

      let newSoldCount = Number(product.sold_count || 0);
      let newStockLimit = product.stock_limit ? Number(product.stock_limit) : null;
      
      const sizes = Array.isArray(product.available_sizes) ? [...product.available_sizes] : [];

      // 2. Process each order against the inventory
      for (const order of productOrders) {
        const qty = Number(order.qty || 1);
        newSoldCount += qty;
        
        if (newStockLimit !== null) {
          newStockLimit = Math.max(0, newStockLimit - qty);
        }

        let parsedSize = order.size;
        let parsedColor = order.color;

        if (order.size && !order.color && order.size.includes(" - ")) {
          const parts = order.size.split(" - ");
          parsedSize = parts[0];
          parsedColor = parts[1];
        }

        if (parsedSize) {
          const sizeObj = sizes.find((s: any) => s.name === parsedSize);
          if (sizeObj && typeof sizeObj.stock === 'number') {
            sizeObj.stock = Math.max(0, sizeObj.stock - qty);
            
            if (parsedColor && Array.isArray(sizeObj.colors)) {
              const colorObj = sizeObj.colors.find((c: any) => c.name === parsedColor);
              if (colorObj && typeof colorObj.stock === 'number') {
                colorObj.stock = Math.max(0, colorObj.stock - qty);
              }
            }
          } else if (!sizeObj && !parsedColor) {
            // It might just be a color if there was no size selected
            parsedColor = parsedSize;
            parsedSize = null;
          }
        } 
        
        if (!parsedSize && parsedColor) {
          for (const sizeObj of sizes) {
            if (Array.isArray(sizeObj.colors)) {
              const colorObj = sizeObj.colors.find((c: any) => c.name === parsedColor);
              if (colorObj && typeof colorObj.stock === 'number') {
                colorObj.stock = Math.max(0, colorObj.stock - qty);
                break;
              }
            }
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
              available_colors: null
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
        available_colors: null,
      });

      console.log(`[Inventory] Successfully updated stock for product ${productId}`);
    } catch (e) {
      console.error(`[Inventory] Failed to deduct inventory for product ${productId}:`, e);
    }
  }
}
