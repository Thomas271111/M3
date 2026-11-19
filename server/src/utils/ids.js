// mongoose.isValidObjectId acepta cualquier string de 12 caracteres; aquí exigimos 24 hex.
export const isObjectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

export const todayISO = () => new Date().toISOString().slice(0, 10);
