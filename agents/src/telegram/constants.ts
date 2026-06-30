export const TELEGRAM_OFFICIAL_AGENT_ID = 'marcos-agent';

export const TELEGRAM_HELP_TEXT = [
  'Canal Telegram ativo em modo controlado para o Marcos.',
  'Comandos disponíveis:',
  '/help - mostra esta ajuda',
  '/start - reinicia a orientação do canal',
  'Envie uma mensagem de texto para falar com o marcos-agent.',
].join('\n');

export const TELEGRAM_LEGACY_WEATHER_TEXT = [
  'O fluxo legado de clima foi desativado neste canal.',
  'Envie sua solicitação em linguagem natural para o marcos-agent.',
].join('\n');

export const TELEGRAM_MARCOS_TRANSITION_TEXT = [
  'O marcos-agent já é o destino oficial do Telegram.',
  'O runtime executivo completo ainda está em implantação nesta etapa.',
  'Sua mensagem foi recebida, mas o atendimento do Marcos será habilitado na próxima task.',
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
