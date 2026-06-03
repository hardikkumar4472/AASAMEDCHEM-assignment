const UNITS = {
  g: { dimension: "WEIGHT", factor: 1 },
  kg: { dimension: "WEIGHT", factor: 1000 },
  mg: { dimension: "WEIGHT", factor: 0.001 },
  ml: { dimension: "VOLUME", factor: 1 },
  L: { dimension: "VOLUME", factor: 1000 },
  ul: { dimension: "VOLUME", factor: 0.001 },
  pc: { dimension: "COUNT", factor: 1 },
  pack: { dimension: "COUNT", factor: 10 },
  box: { dimension: "COUNT", factor: 100 }
};

export function roundToPrecision(num, decimals = 10) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function convertQuantity(quantity, fromUnit, toUnit, density = 1.0) {
  const fromInfo = UNITS[fromUnit];
  const toInfo = UNITS[toUnit];
  if (!fromInfo || !toInfo) {
    throw new Error("Unsupported unit");
  }

  const q = Number(quantity);
  const d = Number(density);

  if (fromInfo.dimension === toInfo.dimension) {
    const baseQuantity = q * fromInfo.factor;
    return roundToPrecision(baseQuantity / toInfo.factor);
  }

  if (fromInfo.dimension === "VOLUME" && toInfo.dimension === "WEIGHT") {
    const baseVolume = q * fromInfo.factor;
    const baseWeight = baseVolume * d;
    return roundToPrecision(baseWeight / toInfo.factor);
  }

  if (fromInfo.dimension === "WEIGHT" && toInfo.dimension === "VOLUME") {
    const baseWeight = q * fromInfo.factor;
    const baseVolume = baseWeight / d;
    return roundToPrecision(baseVolume / toInfo.factor);
  }

  throw new Error("Cannot convert between " + fromInfo.dimension + " and " + toInfo.dimension);
}

export function calculateUnitPrice(basePrice, baseUnit, targetUnit, density = 1.0) {
  const equivalentBaseUnits = convertQuantity(1, targetUnit, baseUnit, density);
  return roundToPrecision(Number(basePrice) * equivalentBaseUnits);
}

export function calculateTotalPrice(quantity, unitPrice) {
  return roundToPrecision(Number(quantity) * Number(unitPrice));
}
