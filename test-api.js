const updateUserSchema = require('zod').z.object({
  name: require('zod').z.string().min(2).optional(),
  suspended: require('zod').z.boolean().optional(),
});
const body = JSON.parse('{"suspended":true}');
const payload = updateUserSchema.parse(body);
const updateData = {
  name: payload.name,
  suspended: payload.suspended,
};
console.log("updateData keys:", Object.keys(updateData));
console.log("updateData values:", Object.values(updateData));
