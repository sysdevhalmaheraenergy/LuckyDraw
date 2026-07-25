import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  createEventSchema,
  createPrizeSchema,
  updateEventSchema,
  updatePrizeSchema,
  eventDetailSchema,
  eventListItemSchema,
  eventSchema,
  couponSchema,
  prizeSchema,
  drawResultSchema,
  errorResponseSchema,
  loginSchema,
  loginResponseSchema,
  csrfResponseSchema,
  okResponseSchema,
  registerSchema,
  userSchema,
  presignUploadSchema,
  presignUploadResponseSchema,
  finalizeUploadSchema,
  finalizeUploadResponseSchema,
} from "@/lib/schemas";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "authjs.session-token",
  description:
    "Session cookie yang didapat setelah login lewat NextAuth credentials flow (POST /api/auth/callback/credentials).",
});

const security = [{ cookieAuth: [] }];

const jsonContent = <T extends z.ZodTypeAny>(schema: T) => ({
  content: { "application/json": { schema } },
});

const unauthorized = { description: "Belum login.", ...jsonContent(errorResponseSchema) };
const forbidden = {
  description: "Login berhasil tapi role tidak diizinkan (STAFF mencoba aksi ADMIN).",
  ...jsonContent(errorResponseSchema),
};
const notFound = { description: "Data tidak ditemukan.", ...jsonContent(errorResponseSchema) };
const badRequest = { description: "Input tidak valid / aksi tidak diperbolehkan.", ...jsonContent(errorResponseSchema) };

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Daftar akun baru (bisa memilih role ADMIN atau STAFF)",
  description:
    "Endpoint publik, tidak butuh login. Setelah berhasil daftar, lanjutkan ke Langkah 1 & 2 di bawah (GET /api/auth/csrf lalu POST /api/auth/callback/credentials) untuk login.",
  request: { body: jsonContent(registerSchema) },
  responses: {
    201: { description: "Akun berhasil dibuat.", ...jsonContent(z.object({ user: userSchema })) },
    400: { description: "Email sudah terdaftar / input tidak valid.", ...jsonContent(errorResponseSchema) },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/csrf",
  tags: ["Auth"],
  summary: "Langkah 1: ambil CSRF token sebelum login",
  description:
    "NextAuth mewajibkan CSRF token untuk credentials flow. Response berisi `csrfToken`, dan sebuah cookie CSRF juga dikirim lewat Set-Cookie — cookie ini WAJIB ikut dikirim bareng csrfToken saat POST login di bawah (kalau pakai curl, simpan & pakai cookie jar yang sama).",
  responses: {
    200: { description: "CSRF token & cookie.", ...jsonContent(csrfResponseSchema) },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/callback/credentials",
  tags: ["Auth"],
  summary: "Langkah 2: login (NextAuth credentials flow) untuk mendapatkan session cookie",
  description:
    "Tidak ada endpoint register — user dibuat lewat prisma/seed.ts (default admin@luckydraw.local / admin123, bisa dioverride lewat env SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD). " +
    "Body dikirim sebagai application/x-www-form-urlencoded, dan HARUS menyertakan csrfToken dari GET /api/auth/csrf beserta cookie CSRF-nya (lihat langkah 1), kalau tidak akan gagal dengan error MissingCSRF. " +
    "Response berhasil mengirim cookie `authjs.session-token` yang harus dipakai (via cookieAuth) di semua endpoint lain.",
  request: {
    body: { content: { "application/x-www-form-urlencoded": { schema: loginSchema } } },
  },
  responses: {
    200: { description: "Login berhasil, cookie session dikirim lewat header Set-Cookie.", ...jsonContent(loginResponseSchema) },
    401: { description: "Email atau password salah.", ...jsonContent(errorResponseSchema) },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events",
  tags: ["Events"],
  summary: "List semua event lucky draw",
  security,
  responses: {
    200: { description: "Daftar event.", ...jsonContent(z.object({ events: z.array(eventListItemSchema) })) },
    401: unauthorized,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/events",
  tags: ["Events"],
  summary: "Buat event baru (otomatis generate kupon 1..N)",
  security,
  request: { body: jsonContent(createEventSchema) },
  responses: {
    201: { description: "Event berhasil dibuat.", ...jsonContent(z.object({ event: eventSchema })) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}",
  tags: ["Events"],
  summary: "Detail event beserta daftar hadiah dan status semua kupon",
  security,
  request: { params: z.object({ eventId: z.string() }) },
  responses: {
    200: { description: "Detail event.", ...jsonContent(z.object({ event: eventDetailSchema })) },
    401: unauthorized,
    404: notFound,
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/events/{eventId}",
  tags: ["Events"],
  summary: "Update nama/deskripsi/status event",
  security,
  request: {
    params: z.object({ eventId: z.string() }),
    body: jsonContent(updateEventSchema),
  },
  responses: {
    200: { description: "Event berhasil diupdate.", ...jsonContent(z.object({ event: eventSchema })) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/events/{eventId}",
  tags: ["Events"],
  summary: "Hapus event (hanya boleh untuk event berstatus DRAFT)",
  security,
  request: { params: z.object({ eventId: z.string() }) },
  responses: {
    200: { description: "Event berhasil dihapus.", ...jsonContent(okResponseSchema) },
    400: { description: "Event yang sudah ONGOING/COMPLETED tidak bisa dihapus.", ...jsonContent(errorResponseSchema) },
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}/prizes",
  tags: ["Prizes"],
  summary: "List semua hadiah pada sebuah event",
  security,
  request: { params: z.object({ eventId: z.string() }) },
  responses: {
    200: { description: "Daftar hadiah.", ...jsonContent(z.object({ prizes: z.array(prizeSchema) })) },
    401: unauthorized,
    404: notFound,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/uploads/presign",
  tags: ["Uploads"],
  summary: "Langkah 1: minta signed URL untuk upload gambar hadiah ke Firebase Storage",
  description:
    "Server tidak menerima file secara langsung. Response berisi `uploadUrl` (signed URL, berlaku 5 menit) — upload file lewat PUT langsung ke URL itu dari browser, dengan header Content-Type yang SAMA persis dengan yang dikirim di request ini. Setelah PUT berhasil, panggil POST /api/uploads/finalize dengan `path` yang didapat di sini.",
  security,
  request: { body: jsonContent(presignUploadSchema) },
  responses: {
    200: { description: "Signed URL untuk upload.", ...jsonContent(presignUploadResponseSchema) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/uploads/finalize",
  tags: ["Uploads"],
  summary: "Langkah 2: finalisasi upload, jadikan file publik, dapatkan URL permanen",
  description:
    "Panggil setelah PUT ke uploadUrl dari /api/uploads/presign selesai. URL hasilnya dipakai sebagai `imageUrl` saat membuat/update hadiah.",
  security,
  request: { body: jsonContent(finalizeUploadSchema) },
  responses: {
    200: { description: "URL publik gambar.", ...jsonContent(finalizeUploadResponseSchema) },
    400: { description: "Path tidak valid atau file belum selesai diupload.", ...jsonContent(errorResponseSchema) },
    401: unauthorized,
    403: forbidden,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/events/{eventId}/prizes",
  tags: ["Prizes"],
  summary: "Tambah hadiah ke sebuah event",
  security,
  request: {
    params: z.object({ eventId: z.string() }),
    body: jsonContent(createPrizeSchema),
  },
  responses: {
    201: { description: "Hadiah berhasil dibuat.", ...jsonContent(z.object({ prize: prizeSchema })) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}/prizes/{prizeId}",
  tags: ["Prizes"],
  summary: "Detail 1 hadiah, termasuk nomor kupon pemenangnya (kalau sudah diundi)",
  security,
  request: { params: z.object({ eventId: z.string(), prizeId: z.string() }) },
  responses: {
    200: { description: "Detail hadiah (field drawResults[0].coupon.number = nomor kupon pemenang).", ...jsonContent(z.object({ prize: prizeSchema })) },
    401: unauthorized,
    404: notFound,
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/events/{eventId}/prizes/{prizeId}",
  tags: ["Prizes"],
  summary: "Update data hadiah (nama/deskripsi/gambar/urutan undian)",
  security,
  request: {
    params: z.object({ eventId: z.string(), prizeId: z.string() }),
    body: jsonContent(updatePrizeSchema),
  },
  responses: {
    200: { description: "Hadiah berhasil diupdate.", ...jsonContent(z.object({ prize: prizeSchema })) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/events/{eventId}/prizes/{prizeId}",
  tags: ["Prizes"],
  summary: "Hapus hadiah (hanya boleh untuk hadiah berstatus PENDING, belum diundi)",
  security,
  request: { params: z.object({ eventId: z.string(), prizeId: z.string() }) },
  responses: {
    200: { description: "Hadiah berhasil dihapus.", ...jsonContent(okResponseSchema) },
    400: { description: "Hadiah sudah diundi (DRAWN), undo dulu sebelum menghapus.", ...jsonContent(errorResponseSchema) },
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/events/{eventId}/coupons",
  tags: ["Coupons"],
  summary: "List semua kupon pada sebuah event, bisa difilter lewat query ?status=",
  security,
  request: {
    params: z.object({ eventId: z.string() }),
    query: z.object({ status: couponSchema.shape.status.optional() }),
  },
  responses: {
    200: { description: "Daftar kupon.", ...jsonContent(z.object({ coupons: z.array(couponSchema) })) },
    400: badRequest,
    401: unauthorized,
    404: notFound,
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/events/{eventId}/coupons/{number}/exclude",
  tags: ["Coupons"],
  summary: "Exclude nomor kupon tertentu dari pool undian (mis. kupon rusak/tidak terjual)",
  security,
  request: { params: z.object({ eventId: z.string(), number: z.string() }) },
  responses: {
    200: { description: "Kupon berhasil di-exclude.", ...jsonContent(z.object({ coupon: couponSchema })) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/events/{eventId}/prizes/{prizeId}/draw",
  tags: ["Draw"],
  summary: "Undi 1 hadiah: pilih random 1 kupon AVAILABLE dan tandai sebagai pemenang",
  security,
  request: { params: z.object({ eventId: z.string(), prizeId: z.string() }) },
  responses: {
    200: { description: "Hasil undian.", ...jsonContent(z.object({ drawResult: drawResultSchema })) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
    409: { description: "Race condition saat memilih kupon, coba lagi.", ...jsonContent(errorResponseSchema) },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/draw-results/{resultId}/undo",
  tags: ["Draw"],
  summary: "Batalkan hasil undian tertentu (kupon & hadiah kembali bisa diundi ulang)",
  security,
  request: { params: z.object({ resultId: z.string() }) },
  responses: {
    200: { description: "Undo berhasil.", ...jsonContent(z.object({ drawResult: drawResultSchema })) },
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Lucky Draw API",
      version: "1.0.0",
      description:
        "API internal untuk aplikasi lucky draw. Login lewat NextAuth credentials flow (POST /api/auth/callback/credentials) untuk mendapatkan session cookie, lalu pakai cookie tersebut di semua request lain.",
    },
    servers: [{ url: "/", description: "Current origin" }],
  });
}
