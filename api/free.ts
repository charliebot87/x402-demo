export default function handler(req: any, res: any) {
  res.json({
    message: "This endpoint is free. No payment required.",
    docs: "https://mpp.dev",
    paid_endpoint: "/api/premium"
  })
}
