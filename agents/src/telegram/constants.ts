export const TELEGRAM_HELP_TEXT = [
  'Canal Telegram ativo em modo controlado.',
  'Comandos disponíveis:',
  '/weather <cidade> - consulta o agente de clima',
  '/help - mostra esta ajuda',
].join('\n');

export const TELEGRAM_ALLOWED_PERSON_SEEDS = [
  {
    personKey: 'jailton-junior',
    displayName: 'Jailton Junior',
    referenceEmail: 'jailton.junior94@outlook.com',
    referencePhone: '+55 11 98689-6322',
  },
  {
    personKey: 'stefany-kelly-lima',
    displayName: 'Stefany Kelly Lima',
    referenceEmail: 'stefanykelly.lima@hotmail.com',
    referencePhone: '+55 11 93011-1763',
  },
] as const;

export const TELEGRAM_WEBHOOK_PATH = '/telegram/webhook/:webhookKey';
export const TELEGRAM_HEALTH_PATH = '/telegram/health';
export const TELEGRAM_SECRET_HEADER = 'x-telegram-bot-api-secret-token';
