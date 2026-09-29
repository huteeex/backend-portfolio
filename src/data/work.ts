import type { Lang } from './content';

export type { Lang } from './content';

export const workSlugs = ['antiplag', 'event-pipeline', 'windows-tweaker', 'studio-site'] as const;
export type WorkSlug = (typeof workSlugs)[number];

export interface WorkProject {
  slug: WorkSlug;
  name: string;
  category: string;
  kind: string;
  summary: string;
  stack: string[];
  context: string;
  responsibility: string;
  challenge: string;
  implementation: string[];
  verification: string;
  outcome: string;
  limitations: string[];
  flow: string[];
  repo?: string;
  sources: { label: string; href: string }[];
}

export const works: Record<Lang, WorkProject[]> = {
  ru: [
    {
      slug: 'antiplag',
      name: 'Antiplag',
      category: 'Документы и права доступа',
      kind: 'Дипломный прототип',
      summary: 'Сервис для учебных работ: загрузка файлов, группы пользователей и серверные проверки доступа.',
      stack: ['TypeScript', 'Bun', 'Hono', 'Drizzle ORM', 'PostgreSQL', 'React'],
      context: 'Студент загружает работу, преподаватель просматривает документы учебной группы, администратор управляет пользователями. Проект был сделан как дипломный прототип, а не как внедрённая система учебного заведения.',
      responsibility: 'Спроектировал связи пользователей, групп и документов в PostgreSQL. Разработал API для входа и работы с файлами, связал его с интерфейсом на React.',
      challenge: 'Скрытая кнопка в интерфейсе не защищает документ: его можно запросить напрямую по ID. При этом правила для просмотра, изменения и удаления различаются в зависимости от роли и владельца.',
      implementation: [
        'При загрузке проверяются наличие файла, его MIME-тип и размер. Метаданные сохраняются с ID владельца и группы.',
        'Маршрут просмотра отдельного документа проверяет доступ на сервере. Изменять и удалять запись могут её владелец и администратор.',
        'Авторизацию, документы и группы разделил на модули Hono; схема данных описана в Drizzle ORM.',
      ],
      verification: 'В репозитории можно проследить маршруты документов и проверки входа. Есть тесты модуля авторизации и пользователей; для прав на документы перед реальным внедрением нужны отдельные интеграционные тесты.',
      outcome: 'Получился прототип полного пути от входа и загрузки до просмотра и изменения метаданных документа. Сервер проверяет доступ к отдельному документу независимо от того, какая кнопка показана в интерфейсе.',
      limitations: [
        'Проверка схожести пока возвращает случайный результат: алгоритм сравнения и очередь заданий не подключены.',
        'Файлы сохраняются на локальном диске. Ролевые правила требуют ревизии и тестов на прямые запросы перед использованием с реальными работами.',
      ],
      flow: ['Вход', 'Загрузка', 'Документ и группа', 'Проверка доступа'],
      repo: 'https://github.com/huteeex/antiplag',
      sources: [
        { label: 'Маршруты документов', href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/documents/routes.ts' },
        { label: 'Авторизация', href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/auth/service.ts' },
        { label: 'Схема данных', href: 'https://github.com/huteeex/antiplag/tree/main/backend/src/db' },
      ],
    },
    {
      slug: 'event-pipeline',
      name: 'Потоковые события',
      category: 'Сбор данных и надёжность',
      kind: 'Личный инженерный проект',
      summary: 'Приём внешних событий, запись исходных данных до обработки и воспроизводимый разбор сбоев.',
      stack: ['Rust', 'Python', 'WebSocket', 'JSONL', 'unittest'],
      context: 'В локальном исследовательском инструменте несколько процессов получают события из внешнего потока. После сбоя нужно восстановить порядок сообщений и понять, ошибка возникла у источника, при записи или во время обработки.',
      responsibility: 'Разработал границу приёма и хранения событий на Rust, сегментированный журнал и инструменты проверки и повторного воспроизведения. Отдельно работал над Python-клиентами для внешних HTTP-источников.',
      challenge: 'Синхронизация диска после каждого сообщения задерживала горячий путь. При длительном запуске рос объём исходных логов. У части событий источник не передавал своё время, поэтому его нельзя было заменять временем получения и выдавать такую оценку за факт.',
      implementation: [
        'Сырые события записываются в append-only сегменты до декодирования. Пакетная запись принимает до 64 последовательных записей общим размером до 4 МиБ и подтверждает их только после синхронизации журнала.',
        'Для закрытых сегментов есть проверка целостности и offline replay. Ошибка записи останавливает допуск новых событий к декодеру; существующий журнал не очищается автоматически.',
        'В модели события разделены время источника, локального получения и обработки. Неизвестное время источника остаётся пустым. Отдельный Python-модуль обрабатывает HTTP 429, Retry-After и паузы по хосту с сохранением отложенных запросов после перезапуска.',
      ],
      verification: 'Проверял границы пакета, порядок записей, закрытие сегмента и replay из синтетических записей автоматическими тестами. Для Python-модуля тестировал, что ограничение одного HTTP-хоста не блокирует другой и переживает перезапуск. Короткие локальные прогоны проверяли связку процессов.',
      outcome: 'Исходное событие сохраняется до его интерпретации, поэтому ошибку обработки можно разобрать повторно на тех же данных. Пакетная запись убрала обязательную синхронизацию для каждого отдельного сообщения; скорость и задержка в длительном запуске требуют отдельного измерения.',
      limitations: [
        'Локальные прогоны и тестовый replay не доказывают непрерывность внешнего источника или поведение под промышленной нагрузкой.',
        'Контроль свободного места выполняется периодически и останавливает процессы при превышении порога; это не жёсткая дисковая квота.',
      ],
      flow: ['Приём', 'Исходный журнал', 'Обработка', 'Проверка и replay'],
      sources: [],
    },
    {
      slug: 'windows-tweaker',
      name: 'WindowsTweaker',
      category: 'Системная утилита',
      kind: 'Личное приложение',
      summary: 'Диагностика настроек Windows и план изменений с явными проверками возможности отката.',
      stack: ['C#', '.NET 10', 'WPF', 'Windows API', 'PowerShell'],
      context: 'Пользователю нужно понять, какие параметры Windows доступны на его сборке и что изменится после выбора настройки. Простой переключатель опасен, если приложение не сохранило исходное состояние или другая программа успела его изменить.',
      responsibility: 'Разделил WPF-интерфейс, чтение состояния Windows, построение плана и экспериментальный движок обратимых изменений. Сформулировал условия, при которых действие нужно заблокировать.',
      challenge: 'Для корректного возврата недостаточно запомнить значение переключателя: важно сохранить исходное состояние до записи, не перезаписать его при повторном применении и заметить конфликт с внешним изменением.',
      implementation: [
        'Интерфейс показывает диагностические карточки и план без изменений. Неизвестное или неприменимое состояние обозначается явно; кнопки перехода открывают штатные настройки Windows, но сами ничего не переключают.',
        'В отдельном модуле собран механизм для двух пользовательских настроек: чтение, сохранение исходного состояния, журнал, проверка после записи и проверка конфликта перед возвратом.',
        'WPF-приложение не зависит от модуля с реальной системной записью. Это не позволяет принять просмотр плана за выполненный твик.',
      ],
      verification: 'Изолированные тесты используют подставные Windows-адаптеры и синтетические файлы журнала, включая остановку дочернего процесса между записями. WPF-интерфейс проверялся на Windows 11 Pro 25H2; реальный Apply/Restore на отдельной тестовой машине ещё не проверен.',
      outcome: 'Получился работающий инструмент чтения и планирования настроек. Механизм обратимых действий существует отдельно от интерфейса и не выдаётся за проверенное изменение рабочей системы.',
      limitations: [
        'В интерфейсе пока нет действующих кнопок автоматического применения и восстановления. Сборка и изолированные тесты не заменяют испытание на отдельной Windows.',
        'Ускорение Windows, рост FPS и совместимость с каждой сборкой не измерялись и не заявляются.',
      ],
      flow: ['Диагностика', 'Выбор', 'План без записи', 'Проверка условий'],
      sources: [],
    },
    {
      slug: 'studio-site',
      name: 'nusi.nails',
      category: 'Сайт и внешние сервисы',
      kind: 'Рабочий сайт',
      summary: 'Сайт студии с записью через DIKIDI и серверным обновлением услуг, цен и документов.',
      stack: ['JavaScript', 'Node.js', 'Vite', 'HTML/CSS', 'Node test'],
      context: 'Посетитель смотрит работы и услуги студии, затем переходит к записи. Сама запись выполняется в DIKIDI, а сайт показывает прайс и документы, полученные из внешнего источника.',
      responsibility: 'Разработал интерфейс и серверные маршруты для синхронизации данных, настроил публикацию сайта и проверки сценариев с недоступным внешним сервисом.',
      challenge: 'Внешняя страница может вернуть ошибку, CAPTCHA или неполный список. Если просто заменить старые данные ответом, сайт потеряет цены или покажет сохранённую цену как свежую.',
      implementation: [
        'Сервер ограничивает размер и время внешнего ответа, извлекает услуги, проверяет ID и цены и сохраняет структурированный снимок последней успешной загрузки.',
        'При сбое остаётся предыдущий прайс с датой проверки и пометкой устаревания. Пропавшую из частичного ответа важную услугу сайт временно оставляет с её последней ценой, но помечает источник как неполный.',
        'Чтение страницы не ждёт DIKIDI. Обновление происходит отдельно, а кнопка записи открывает внешний сервис. Публичная лента Telegram используется для новостей сайта, не для записи.',
      ],
      verification: 'Тесты проверяют параллельные запросы без повторной загрузки, восстановление снимка после перезапуска, CAPTCHA, некорректную карточку, исчезновение услуги и последующее обновление. Публичная страница доступна на nusi-nails.ru.',
      outcome: 'Посетитель видит прайс даже при временном сбое источника и может понять, когда цена была проверена. Запись остаётся доступной через DIKIDI; сайт не создаёт и не хранит бронирования.',
      limitations: [
        'Парсер зависит от HTML внешней площадки. Если разметка изменится, сайт сохранит последний известный прайс, но обновление потребует доработки.',
        'Бронирования обрабатываются в DIKIDI, а не в собственной базе сайта.',
      ],
      flow: ['DIKIDI', 'Проверка данных', 'Сохранённый прайс', 'Страница услуг'],
      sources: [{ label: 'Открыть сайт', href: 'https://nusi-nails.ru/' }],
    },
  ],
  en: [
    {
      slug: 'antiplag',
      name: 'Antiplag',
      category: 'Documents and access control',
      kind: 'Diploma prototype',
      summary: 'A coursework service with file uploads, user groups and server-side access checks.',
      stack: ['TypeScript', 'Bun', 'Hono', 'Drizzle ORM', 'PostgreSQL', 'React'],
      context: 'Students upload coursework, teachers review documents in their groups, and administrators manage users. This was a diploma prototype, not a deployed university system.',
      responsibility: 'I designed the PostgreSQL relationships between users, groups and documents, built the API for authentication and files, and connected it to a React interface.',
      challenge: 'Hiding a button in the interface does not protect a document: a user can request its ID directly. Viewing, editing and deleting also require different rules for roles and ownership.',
      implementation: [
        'Uploads check that a file exists and validate its MIME type and size. Metadata stores the owner and group IDs.',
        'The single-document route checks access on the server. Editing and deletion are limited to the owner or an administrator.',
        'Authentication, documents and groups live in separate Hono modules; Drizzle ORM defines the data schema.',
      ],
      verification: 'The repository exposes the document routes and authentication checks. It includes authentication and user tests; document permissions still need a dedicated integration test suite before real use.',
      outcome: 'The prototype covers the path from sign-in and upload to viewing and editing document metadata. Access to an individual document is checked by the server regardless of which controls are visible in the interface.',
      limitations: [
        'The similarity check currently returns a random result. The comparison algorithm and job queue are not connected.',
        'Files are stored on the local server disk. Role rules need review and direct-request tests before handling real coursework.',
      ],
      flow: ['Sign in', 'Upload', 'Document and group', 'Access check'],
      repo: 'https://github.com/huteeex/antiplag',
      sources: [
        { label: 'Document routes', href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/documents/routes.ts' },
        { label: 'Authentication', href: 'https://github.com/huteeex/antiplag/blob/main/backend/src/modules/auth/service.ts' },
        { label: 'Data schema', href: 'https://github.com/huteeex/antiplag/tree/main/backend/src/db' },
      ],
    },
    {
      slug: 'event-pipeline',
      name: 'Event pipeline',
      category: 'Data ingestion and reliability',
      kind: 'Personal engineering project',
      summary: 'Ingesting external events, preserving raw input before processing, and replaying failures from a journal.',
      stack: ['Rust', 'Python', 'WebSocket', 'JSONL', 'unittest'],
      context: 'Several processes in a local research tool receive events from an external stream. After a restart or decoder failure, I need to recover their order and tell whether the problem was upstream, in storage or in processing.',
      responsibility: 'I built the Rust ingestion and storage boundary, the segmented journal, and tools to verify and replay it. Separately, I worked on Python clients for external HTTP sources.',
      challenge: 'Syncing the disk after every message delayed the hot path, while long sessions grew raw logs. Some events had no source timestamp; replacing it with local receive time would make an estimate look like a fact.',
      implementation: [
        'Raw events go into append-only segments before decoding. Group commit accepts up to 64 consecutive records or 4 MiB and acknowledges them only after syncing the journal.',
        'Sealed segments can be verified and replayed offline. A write failure blocks decoding of new input; existing evidence is not deleted automatically.',
        'The event model keeps source, receive and processing timestamps separate, leaving missing source time empty. A separate Python module handles HTTP 429, Retry-After and per-host cooldowns with deferred work surviving restarts.',
      ],
      verification: 'Automated tests cover batch bounds, record order, segment sealing and replay with synthetic input. Python tests verify that a rate limit on one host does not block another and that deferred work survives restart. Short local runs exercised the process chain.',
      outcome: 'The original input is retained before interpretation, so a processing error can be investigated against the same data. Group commit removes mandatory per-message syncing; sustained throughput and latency still require separate measurement.',
      limitations: [
        'Local runs and fixture-based replay do not establish upstream continuity or production-load behavior.',
        'Free-space checks poll and stop processes at a threshold; they are not a hard disk quota.',
      ],
      flow: ['Receive', 'Raw journal', 'Process', 'Verify and replay'],
      sources: [],
    },
    {
      slug: 'windows-tweaker',
      name: 'WindowsTweaker',
      category: 'System utility',
      kind: 'Personal application',
      summary: 'Windows diagnostics and change planning with explicit checks for safe restoration.',
      stack: ['C#', '.NET 10', 'WPF', 'Windows API', 'PowerShell'],
      context: 'A user needs to see which Windows settings apply to their build and what a selected change would do. A simple toggle is unsafe if the tool has not saved the original state or another program has changed it since.',
      responsibility: 'I separated the WPF interface, Windows state probes, change planning and an experimental restoration engine. I defined conditions under which a change must be blocked.',
      challenge: 'Restoration takes more than remembering a toggle value: the tool must record the baseline before writing, preserve it on repeat attempts and detect conflicts with external changes.',
      implementation: [
        'The UI shows diagnostic cards and a no-write plan. Unknown and inapplicable states remain explicit; links open the corresponding Windows Settings page but do not change the setting.',
        'A separate module implements reading, baseline snapshots, journaling, post-write verification and conflict checks for two user-level settings.',
        'The WPF application does not depend on the module that can write system settings. Viewing a plan therefore cannot silently apply a tweak.',
      ],
      verification: 'Isolated tests use fake Windows adapters and synthetic journal files, including child-process exits between writes. The WPF UI was checked on Windows 11 Pro 25H2; real Apply/Restore has not yet been tested on a separate Windows machine.',
      outcome: 'The result is a working read-only diagnostic and planning tool. The reversible-change engine remains separate from the UI and is not presented as verified system modification.',
      limitations: [
        'The UI does not yet offer automated Apply/Restore buttons. A build and isolated tests cannot replace a real Windows integration test.',
        'Windows speedups, FPS gains and compatibility with every build have not been measured or claimed.',
      ],
      flow: ['Diagnose', 'Select', 'No-write plan', 'Check conditions'],
      sources: [],
    },
    {
      slug: 'studio-site',
      name: 'nusi.nails',
      category: 'Website and external services',
      kind: 'Live website',
      summary: 'A studio website with DIKIDI booking and server-side updates of services, prices and documents.',
      stack: ['JavaScript', 'Node.js', 'Vite', 'HTML/CSS', 'Node test'],
      context: 'Visitors browse the studio work and services, then book an appointment. DIKIDI handles the booking itself; the website displays prices and documents fetched from an external source.',
      responsibility: 'I built the interface and server routes for data synchronization, deployed the website and tested scenarios where the external service is unavailable.',
      challenge: 'The external page can return an error, CAPTCHA or a partial list. Replacing old data with that response would remove prices or make a saved price look freshly checked.',
      implementation: [
        'The server bounds response time and size, extracts services, validates IDs and prices, and stores a structured snapshot of the last successful fetch.',
        'On failure, it retains the previous list with its check date and a stale marker. If an important service vanishes from a partial response, its previous price remains visible but the source is marked incomplete.',
        'Page rendering does not wait for DIKIDI. Updates run separately, while the booking action opens the external service. The public Telegram feed supplies website news, not bookings.',
      ],
      verification: 'Tests cover concurrent requests without duplicate fetches, restoring a snapshot after restart, CAPTCHA, malformed cards, a missing service and later recovery. The public page is available at nusi-nails.ru.',
      outcome: 'Visitors can see prices during a temporary upstream outage and tell when they were last checked. Booking remains available through DIKIDI; the website does not create or store reservations.',
      limitations: [
        'The parser depends on third-party HTML. A markup change leaves the last known price visible but may require parser changes before refresh can resume.',
        'DIKIDI owns appointment data; the website has no booking database of its own.',
      ],
      flow: ['DIKIDI', 'Validate data', 'Saved price list', 'Services page'],
      sources: [{ label: 'Visit website', href: 'https://nusi-nails.ru/' }],
    },
  ],
};
