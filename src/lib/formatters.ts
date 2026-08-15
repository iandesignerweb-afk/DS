export const formatCurrencyBR = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDateBR = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '--/--/----';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatTimeBR = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '--:--';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '--:--';
  }
};

export const formatDateTimeBR = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '--/--/---- --:--';
  try {
    const d = new Date(dateStr);
    const date = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
    return `${date} às ${time}`;
  } catch {
    return dateStr;
  }
};

export const formatDateTimeShortBR = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '--/--/---- --:--';
  try {
    const d = new Date(dateStr);
    const date = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
    return `${date} ${time}`;
  } catch {
    return dateStr;
  }
};
