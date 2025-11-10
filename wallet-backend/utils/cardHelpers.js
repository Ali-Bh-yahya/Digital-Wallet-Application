
export const maskPan = (pan = '') => {
  const digits = String(pan).replace(/\D/g, '');
  if (!digits) return '•••• •••• •••• ••••';
  // show only last4
  const last4 = digits.slice(-4);
  const masked = digits.slice(0, -4).replace(/\d/g, '•');
  // group in 4s
  return (masked + last4).replace(/(.{4})/g, '$1 ').trim();
};

export const getLast4 = (pan = '') => String(pan).replace(/\D/g, '').slice(-4) || null;
