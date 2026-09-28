import type { Lang } from './content';

type Experience = {
  title: string;
  summary: string;
  stack: string;
  context: string;
  challenge: string;
  solution: string;
  takeaway: string;
};

// Editorial summaries of the supplied résumé and inspected project code.
// These describe tasks and decisions, not unverified employment or production metrics.
export const experience: Record<Lang, Experience[]> = {
  ru: [
    {
      title: 'API, пользователи и доступ',
      summary: 'Регистрация, вход, роли пользователей и загрузка документов.',
      stack: 'REST API · JWT · RBAC · загрузка файлов',
      context: 'Веб-приложения с кабинетами пользователей и панелями администратора.',
      challenge: 'Студенту, преподавателю и администратору нужны разные права на документы. При загрузке нужно проверить тип и размер файла.',
      solution: 'Добавил JWT и обновление токенов, проверки доступа в API. При загрузке проверял файл, сохранял его на диск, а метаданные записывал в PostgreSQL.',
      takeaway: 'Разобрался с обновлением сессий и проверкой доступа к отдельным документам.',
    },
    {
      title: 'Данные и бизнес-правила',
      summary: 'Схемы PostgreSQL, SQL-запросы и расчёт стоимости.',
      stack: 'PostgreSQL · SQL · PL/pgSQL',
      context: 'Сервисы заявок и записи, каталог товаров и приложение для учёта магазина.',
      challenge: 'В сервисе рекламных заявок стоимость зависит от передачи, тарифа и длительности. По сумме заявки нужно рассчитать комиссию агента.',
      solution: 'Спроектировал таблицы и связи. Вынес расчёт стоимости и комиссии в SQL-функции. В других проектах писал запросы для поиска товаров, учёта продаж и остатков.',
      takeaway: 'Работал с SQL-функциями и связями таблиц на конкретных расчётах и задачах учёта.',
    },
    {
      title: 'Боты и интеграции',
      summary: 'Telegram-боты на Python и Go, внешние API и чат на Socket.io.',
      stack: 'Python · Go · Telegram · HTTP · Socket.io',
      context: 'Telegram-боты с внешними API, уведомления и чат внутри веб-приложения.',
      challenge: 'Боту нужно помнить шаг диалога и обращаться к внешнему API. В чате новые сообщения должны оставаться в истории.',
      solution: 'Писал обработчики команд и состояний бота. В веб-чате сначала сохранял сообщение через API, затем рассылал его участникам комнаты через Socket.io.',
      takeaway: 'Разделил хранение истории в базе и передачу новых сообщений через Socket.io.',
    },
    {
      title: 'Запуск и поддержка',
      summary: 'Docker Compose, настройка Nginx и подключение базы данных.',
      stack: 'Docker · Docker Compose · Nginx · Git',
      context: 'Развёртывание веб-приложений и доработка существующих сайтов.',
      challenge: 'Для запуска нужны приложение, база данных и прокси. Нужно настроить их адреса, порты и параметры подключения.',
      solution: 'Запускал сервисы через Docker Compose, настраивал Nginx и подключение к PostgreSQL. Исправлял ошибки форм и запросов между интерфейсом и API.',
      takeaway: 'Освоил настройку окружения, контейнеров и проксирования запросов.',
    },
  ],
  en: [
    {
      title: 'APIs, users and access',
      summary: 'Registration, login, user roles and document uploads.',
      stack: 'REST APIs · JWT · RBAC · file uploads',
      context: 'Web applications with user accounts and administration panels.',
      challenge: 'Students, teachers and administrators need different document permissions. Uploads require file type and size checks.',
      solution: 'Added JWT authentication, token refresh and access checks in the API. Validated uploads, saved files to disk and stored their metadata in PostgreSQL.',
      takeaway: 'Learned to handle session renewal and access checks for individual documents.',
    },
    {
      title: 'Data and business rules',
      summary: 'PostgreSQL schemas, SQL queries and pricing calculations.',
      stack: 'PostgreSQL · SQL · PL/pgSQL',
      context: 'Request and booking services, product catalogues and a store management application.',
      challenge: 'Advertising prices depend on the show, rate and duration. The agent commission is calculated from the request amount.',
      solution: 'Designed the tables and relationships. Put pricing and commission calculations in SQL functions. In other projects, wrote queries for product search, sales and stock tracking.',
      takeaway: 'Used SQL functions and table relationships for pricing and inventory tasks.',
    },
    {
      title: 'Bots and integrations',
      summary: 'Telegram bots in Python and Go, external APIs and Socket.io chat.',
      stack: 'Python · Go · Telegram · HTTP · Socket.io',
      context: 'Telegram bots connected to external APIs, notifications and in-app chat.',
      challenge: 'A bot needs to track the conversation step and call external APIs. Chat messages need to remain available in the history.',
      solution: 'Wrote bot command and state handlers. In web chat, saved each message through the API before broadcasting it to the room with Socket.io.',
      takeaway: 'Separated message storage in the database from live delivery through Socket.io.',
    },
    {
      title: 'Deployment and maintenance',
      summary: 'Docker Compose, Nginx configuration and database connections.',
      stack: 'Docker · Docker Compose · Nginx · Git',
      context: 'Deploying web applications and maintaining existing websites.',
      challenge: 'Deployment requires the application, database and proxy, with the right addresses, ports and connection settings.',
      solution: 'Ran services with Docker Compose, configured Nginx and connected PostgreSQL. Fixed form errors and requests between the interface and API.',
      takeaway: 'Learned to configure application environments, containers and request proxying.',
    },
  ],
};
