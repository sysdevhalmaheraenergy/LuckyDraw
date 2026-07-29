import { z } from "@/lib/zod-openapi";

// ---- Enums ----
export const roleSchema = z.enum(["ADMIN", "STAFF"]).openapi("Role");
export const eventStatusSchema = z.enum(["DRAFT", "ONGOING", "COMPLETED"]).openapi("EventStatus");
export const couponStatusSchema = z.enum(["AVAILABLE", "WON", "EXCLUDED"]).openapi("CouponStatus");
export const prizeStatusSchema = z.enum(["PENDING", "DRAWN"]).openapi("PrizeStatus");
export const drawResultStatusSchema = z.enum(["VALID", "UNDONE"]).openapi("DrawResultStatus");

// ---- Request bodies ----
export const csrfResponseSchema = z
  .object({
    csrfToken: z.string().openapi({ example: "a1b2c3..." }),
  })
  .openapi("CsrfResponse");

export const loginSchema = z
  .object({
    email: z.string().email().openapi({ example: "admin@luckydraw.local" }),
    password: z.string().min(1).openapi({ example: "admin123" }),
    csrfToken: z.string().openapi({ example: "a1b2c3..." }),
    redirect: z.literal(false).openapi({ example: false }),
    json: z.literal(true).openapi({ example: true }),
  })
  .openapi("LoginInput");

export const createEventSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Gathering Tahunan" }),
    description: z.string().optional(),
    totalCoupons: z.number().int().min(1).max(100_000).openapi({ example: 100 }),
  })
  .openapi("CreateEventInput");

export const createPrizeSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Hadiah Utama" }),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().openapi({ description: "URL publik permanen dari /api/uploads/finalize." }),
    drawOrder: z.number().int().min(1).openapi({ example: 1 }),
  })
  .openapi("CreatePrizeInput");

export const registerSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Budi Santoso" }),
    email: z.string().email().openapi({ example: "budi@company.com" }),
    password: z.string().min(8).openapi({ example: "password123" }),
    role: roleSchema.default("ADMIN").openapi({ example: "ADMIN" }),
  })
  .openapi("RegisterInput");

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const presignUploadSchema = z
  .object({
    fileName: z.string().min(1).openapi({ example: "hadiah-utama.jpg" }),
    contentType: z.enum(allowedImageTypes).openapi({ example: "image/jpeg" }),
  })
  .openapi("PresignUploadInput");

export const presignUploadResponseSchema = z
  .object({
    uploadUrl: z.string().url().openapi({ description: "Signed URL, upload file lewat PUT ke sini (berlaku 5 menit)." }),
    path: z.string().openapi({ description: "Path object di storage, dipakai untuk finalize." }),
  })
  .openapi("PresignUploadResponse");

export const finalizeUploadSchema = z
  .object({
    path: z.string().min(1).openapi({ example: "lucky-draw/prizes/abc123/1706000000000-hadiah-utama.jpg" }),
  })
  .openapi("FinalizeUploadInput");

export const finalizeUploadResponseSchema = z
  .object({
    url: z.string().url().openapi({ description: "URL publik permanen, simpan ini sebagai imageUrl hadiah." }),
  })
  .openapi("FinalizeUploadResponse");

export const updateEventSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: eventStatusSchema.optional(),
  })
  .openapi("UpdateEventInput");

export const claimCouponSchema = z
  .object({
    code: z.string().min(1).openapi({ example: "cm8b3..." }),
  })
  .openapi("ClaimCouponInput");

export const updateDrawResultNoteSchema = z
  .object({
    note: z.string().optional().openapi({ example: "Pemenang sudah klaim hadiah." }),
    imageUrl: z.string().url().max(2048).optional().openapi({ description: "URL publik permanen dari /api/upload/draw-results." }),
  })
  .openapi("UpdateDrawResultNoteInput");

export const updatePrizeSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().openapi({ description: "URL publik permanen dari /api/uploads/finalize." }),
    drawOrder: z.number().int().min(1).optional(),
  })
  .openapi("UpdatePrizeInput");

// ---- Response entities ----
export const couponSchema = z
  .object({
    id: z.string(),
    number: z.number().int(),
    status: couponStatusSchema,
    eventId: z.string(),
  })
  .openapi("Coupon");

export const drawResultSchema = z
  .object({
    id: z.string(),
    prizeId: z.string(),
    couponId: z.string(),
    status: drawResultStatusSchema,
    drawnAt: z.string().datetime(),
    undoneAt: z.string().datetime().nullable(),
    coupon: couponSchema.optional(),
  })
  .openapi("DrawResult");

export const prizeSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
    drawOrder: z.number().int(),
    status: prizeStatusSchema,
    eventId: z.string(),
    drawResults: z.array(drawResultSchema).optional(),
  })
  .openapi("Prize");

export const eventSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    totalCoupons: z.number().int(),
    status: eventStatusSchema,
    userId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Event");

export const eventListItemSchema = eventSchema
  .extend({
    _count: z.object({ coupons: z.number().int(), prizes: z.number().int() }),
  })
  .openapi("EventListItem");

export const eventDetailSchema = eventSchema
  .extend({
    prizes: z.array(prizeSchema),
    coupons: z.array(couponSchema),
  })
  .openapi("EventDetail");

export const loginResponseSchema = z
  .object({
    url: z.string().nullable().openapi({ example: null }),
  })
  .openapi("LoginResponse");

export const userSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: roleSchema,
  })
  .openapi("User");

export const errorResponseSchema = z
  .object({
    error: z.string(),
  })
  .openapi("ErrorResponse");

export const okResponseSchema = z
  .object({
    ok: z.literal(true),
  })
  .openapi("OkResponse");

export const paginationSchema = z
  .object({
    page: z.number().int().min(1).openapi({ example: 1 }),
    limit: z.number().int().min(1).openapi({ example: 25 }),
    total: z.number().int().min(0).openapi({ example: 100 }),
    totalPages: z.number().int().min(1).openapi({ example: 4 }),
  })
  .openapi("Pagination");

export const couponsListResponseSchema = z
  .object({
    coupons: z.array(couponSchema),
    pagination: paginationSchema,
  })
  .openapi("CouponsListResponse");
