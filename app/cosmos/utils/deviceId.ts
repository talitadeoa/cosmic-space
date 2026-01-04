'use client';

const DEVICE_ID_KEY = 'flua_device_id';

const fallbackId = () => `device-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'device-server';
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : fallbackId();
  window.localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
};
