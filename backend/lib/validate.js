// Helper validate nho, su dung chung
const PHONE_RE = /^0\d{9}$/;
const validPhone = (s) => PHONE_RE.test((s || "").replace(/\s/g, ""));

const requireFields = (obj, fields) => {
  for (const f of fields) {
    if (!obj?.[f] || String(obj[f]).trim() === "")
      return `Thieu truong "${f}"`;
  }
  return null;
};

const parseInt2 = (v, d = 0) => {
  const n = parseInt(v);
  return Number.isFinite(n) ? n : d;
};

module.exports = { validPhone, requireFields, parseInt2 };
