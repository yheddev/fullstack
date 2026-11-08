export function validateNumber(value: string, integer: boolean): string | undefined {
  if (!value.trim()) return "Введите значение.";
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized) || !Number.isFinite(Number(normalized)))
    return "Введите корректное положительное число.";
  if (Number(normalized) <= 0) return "Значение должно быть больше нуля.";
  if (integer && !Number.isSafeInteger(Number(normalized)))
    return "Введите целое положительное число.";
  return undefined;
}
