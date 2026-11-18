// Expone `id` (en vez de `_id`) y oculta `__v`, para que el cliente siga usando `id`.
export const jsonOptions = {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
};
