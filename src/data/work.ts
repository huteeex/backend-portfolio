import type { Lang } from './content';

export type { Lang } from './content';

export const workSlugs = ['tvcompanyx', 'antiplag'] as const;
export type WorkSlug = (typeof workSlugs)[number];

export interface WorkProject {
  slug: WorkSlug;
  name: string;
  category: string;
  summary: string;
  stack: string[];
  repo: string;
  context: string;
  features: string[];
  decision: string;
  limitations: string[];
  flow: string[];
  sources: { label: string; href: string }[];
}

// Descriptions are based on the public implementation, not employment history.
export const works: Record<Lang, WorkProject[]> = {
  ru: [
    {
      slug: 'tvcompanyx',
      name: 'TVCompanyX',
      category: 'Заявки и бизнес-процессы',
      summary:
        'Система рекламных заявок с расчётом стоимости, уведомлениями и чатом.',
      stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Socket.io', 'Docker'],
      repo: 'https://github.com/huteeex/TVCompanyX',
      context:
        'В заявке хранятся заказчик, передача, время выхода и длительность рекламы. Сотрудники просматривают заявки, меняют статусы и обсуждают детали в чате.',
      features: [
        'Создание заявок и фильтрация по заказчику, агенту и статусу через API.',
        'SQL-функции расчёта стоимости и комиссии, таблицы и миграции PostgreSQL.',
        'Уведомления об отправке заявки и отдельные интерфейсы для разных ролей.',
        'Чат на Socket.io с комнатами, сохранением сообщений и загрузкой истории.',
      ],
      decision:
        'Стоимость и комиссия рассчитываются в PostgreSQL. Сервер чата сначала сохраняет сообщение через API, затем отправляет его участникам комнаты.',
      limitations: [
        'Для работы чата нужно запустить отдельный Socket.io-сервис вместе с приложением и PostgreSQL.',
      ],
      flow: ['Заявка', 'API и PostgreSQL', 'Расчёт стоимости', 'Уведомление'],
      sources: [
        {
          label: 'API заявок',
          href: 'https://github.com/huteeex/TVCompanyX/blob/main/src/pages/api/applications/index.ts',
        },
        {
          label: 'Расчёты в PostgreSQL',
          href: 'https://github.com/huteeex/TVCompanyX/blob/main/docs/db/functions.sql',
        },
        {
          label: 'Сервер чата',
          href: 'https://github.com/huteeex/TVCompanyX/blob/main/server/socket-server.js',
        },
      ],
    },
    {
      slug: 'antiplag',
      name: 'Antiplag',
      category: 'Документы и доступ',
      summary:
        'Прототип для работы с учебными документами: загрузка файлов, группы и доступ по ролям.',
      stack: ['TypeScript', 'Bun', 'Hono', 'Drizzle ORM', 'PostgreSQL', 'React'],
      repo: 'https://github.com/huteeex/antiplag',
      context:
        'Студенты и преподаватели работают с документами внутри учебных групп. Интерфейс написан на React, API для пользователей, документов и сообщений - на Bun/Hono.',
      features: [
        'Загрузка PDF, DOC, DOCX и TXT с проверкой типа и размера, хранение метаданных в PostgreSQL.',
        'Просмотр, изменение и удаление документов с проверками доступа.',
        'Регистрация, вход и обновление JWT с заменой refresh-токена.',
        'API пользователей, групп и сообщений; маршруты для студента, преподавателя и администратора.',
      ],
      decision:
        'Авторизация, документы и группы вынесены в отдельные модули Hono. Схема данных описана в Drizzle ORM. Общие middleware обрабатывают ошибки, добавляют ID запросов и ограничивают частоту обращений.',
      limitations: [
        'Проверка схожести возвращает случайный результат. Алгоритм сравнения и очередь заданий ещё не подключены.',
        'Загруженные файлы сохраняются на диск сервера.',
      ],
      flow: ['Вход', 'Загрузка работы', 'Документ и группа', 'Доступ по роли'],
      sources: [
        {
          label: 'Работа с документами',
          href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/documents/routes.ts',
        },
        {
          label: 'Авторизация и токены',
          href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/auth/service.ts',
        },
        {
          label: 'Устройство API',
          href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/app.ts',
        },
      ],
    },
  ],
  en: [
    {
      slug: 'tvcompanyx',
      name: 'TVCompanyX',
      category: 'Requests and workflows',
      summary:
        'An advertising request system with pricing, notifications and chat.',
      stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Socket.io', 'Docker'],
      repo: 'https://github.com/huteeex/TVCompanyX',
      context:
        'Each request stores the customer, TV show, air date and advertising duration. Staff review requests, update statuses and discuss details in chat.',
      features: [
        'An API to create requests and filter them by customer, agent and status.',
        'SQL functions for pricing and commissions, with PostgreSQL tables and migrations.',
        'Notifications on submission and separate interfaces for different roles.',
        'Socket.io chat with rooms, saved messages and message history.',
      ],
      decision:
        'Prices and commissions are calculated in PostgreSQL. The chat server saves each message through the API before sending it to room participants.',
      limitations: [
        'Chat requires a separate Socket.io service running alongside the application and PostgreSQL.',
      ],
      flow: ['Request', 'API and PostgreSQL', 'Price calculation', 'Notification'],
      sources: [
        {
          label: 'Request API',
          href: 'https://github.com/huteeex/TVCompanyX/blob/main/src/pages/api/applications/index.ts',
        },
        {
          label: 'PostgreSQL calculations',
          href: 'https://github.com/huteeex/TVCompanyX/blob/main/docs/db/functions.sql',
        },
        {
          label: 'Chat server',
          href: 'https://github.com/huteeex/TVCompanyX/blob/main/server/socket-server.js',
        },
      ],
    },
    {
      slug: 'antiplag',
      name: 'Antiplag',
      category: 'Documents and access',
      summary:
        'A coursework prototype with file uploads, groups and access by user role.',
      stack: ['TypeScript', 'Bun', 'Hono', 'Drizzle ORM', 'PostgreSQL', 'React'],
      repo: 'https://github.com/huteeex/antiplag',
      context:
        'Students and teachers work with documents within study groups. The interface uses React; the API for users, documents and messages uses Bun/Hono.',
      features: [
        'PDF, DOC, DOCX and TXT uploads with type and size checks and metadata in PostgreSQL.',
        'Document viewing, editing and deletion with access checks.',
        'Registration, login and JWT renewal with refresh token rotation.',
        'APIs for users, groups and messages, with routes for students, teachers and administrators.',
      ],
      decision:
        'Authentication, documents and groups use separate Hono modules. Drizzle ORM defines the data schema. Shared middleware handles errors, adds request IDs and limits request rates.',
      limitations: [
        'Similarity checks return a random result. The comparison algorithm and job queue are not connected yet.',
        'Uploaded files are stored on the server’s local disk.',
      ],
      flow: ['Sign in', 'Upload coursework', 'Document and group', 'Role-based access'],
      sources: [
        {
          label: 'Document routes',
          href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/documents/routes.ts',
        },
        {
          label: 'Authentication and tokens',
          href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/auth/service.ts',
        },
        {
          label: 'API structure',
          href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/app.ts',
        },
      ],
    },
  ],
};
