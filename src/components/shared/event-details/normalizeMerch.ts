export const normalizeMerch = (m: any) => {
  let sizesArr = Array.isArray(m.available_sizes) ? m.available_sizes : [];
  sizesArr = sizesArr.map((s: any) => {
    if (typeof s === "string") return { name: s, stock: Number.POSITIVE_INFINITY, colors: [] };
    const stockVal = s.stock != null && s.stock !== "" ? Number(s.stock) : Number.POSITIVE_INFINITY;
    return { ...s, stock: isNaN(stockVal) ? Number.POSITIVE_INFINITY : stockVal };
  });

  let colorsArr = Array.isArray(m.available_colors) ? m.available_colors : [];
  colorsArr = colorsArr.map((c: any) => {
    if (typeof c === "string") return { name: c, stock: Number.POSITIVE_INFINITY };
    const stockVal = c.stock != null && c.stock !== "" ? Number(c.stock) : Number.POSITIVE_INFINITY;
    return { ...c, stock: isNaN(stockVal) ? Number.POSITIVE_INFINITY : stockVal };
  });

  return { sizesArr, colorsArr };
};
