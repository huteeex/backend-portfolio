export type Lang = 'ru' | 'en';

export const projectSlugs = ['requests', 'catalog', 'delivery'] as const;
export type ProjectSlug = (typeof projectSlugs)[number];

export type Project = {
  slug: ProjectSlug;
  number: string;
  title: string;
  category: string;
  summary: string;
  context: string;
  approach: string[];
  decision: string;
  failure: string;
  outcome: string;
  questions: string[];
  flow: string[];
};

// These are proposed concepts, not claims about completed work or employment.
export const projects: Record<Lang, Project[]> = {
  ru: [
    {
      slug: 'requests',
      number: '01',
      title: 'Заявки через бота',
      category: 'Боты и процессы',
      summary:
        'Концепт бота для приёма заявок: описание, контакт и подтверждение отправки.',
      context:
        'Клиент присылает описание и контакты отдельными сообщениями. Сотрудник собирает их в заявку и назначает ответственного. Бот должен собрать эти данные по шагам и сохранить обращение.',
      approach: [
        'Собирать описание и контакт по шагам; перед отправкой показывать данные для подтверждения.',
        'Хранить состояние диалога и заявку в базе, чтобы перезапуск не терял введённое.',
        'Добавить команды для назначения ответственного и смены статуса.',
      ],
      decision:
        'Начать с управления внутри бота. Отдельную панель добавить, если команде понадобятся поиск по длинным спискам и массовые изменения.',
      failure:
        'Повторное нажатие не должно создавать вторую заявку. Нужно связать подтверждённый диалог с заявкой и отсекать повторные события по ID. Если уведомление не отправилось, повторить только отправку.',
      outcome:
        'Клиент получает номер заявки. Команда видит описание, контакт, ответственного и статус в одной записи.',
      questions: [
        'Как восстановить незавершённый диалог после перезапуска?',
        'Чем повторное событие отличается от нового похожего обращения?',
        'Что делать, если заявка сохранена, а уведомление не отправлено?',
      ],
      flow: ['Диалог', 'Проверка', 'Заявка', 'Уведомление'],
    },
    {
      slug: 'catalog',
      number: '02',
      title: 'Импорт каталогов',
      category: 'Данные и интеграции',
      summary:
        'Концепт импорта: привести цены и поля поставщиков к одному формату, отдельно показать ошибки.',
      context:
        'Поставщики используют разные названия полей, форматы цен и единицы измерения. Для общего каталога нужно привести записи к одной структуре и сохранить ссылку на исходные данные.',
      approach: [
        'Описать общие поля и адаптер для каждого источника.',
        'Проверять цену, валюту и единицы измерения; сохранять исходную запись для разбора.',
        'Обновлять корректные позиции, а проблемные строки выводить в отчёте импорта.',
      ],
      decision:
        'Использовать поставщика и артикул как ключ записи. При повторном импорте обновлять существующую позицию. Похожие названия товаров сами по себе не повод объединять записи.',
      failure:
        'Пустую или некорректную цену отправлять в отчёт об ошибках, сохраняя прежнее значение и дату. После неполной выгрузки не удалять товары, которых в ней нет.',
      outcome:
        'В каталоге одинаковые поля, у каждой позиции есть источник и дата обновления. Ошибки собраны отдельно и не мешают обработке корректных строк.',
      questions: [
        'Почему названия товара недостаточно для определения дубля?',
        'Как отличить отсутствующую цену от нулевой?',
        'Что останется в каталоге после неполной выгрузки?',
      ],
      flow: ['Источники', 'Адаптеры', 'Проверка', 'Каталог'],
    },
    {
      slug: 'delivery',
      number: '03',
      title: 'Очередь уведомлений',
      category: 'API и фоновые задачи',
      summary:
        'Концепт фоновой отправки с очередью, повторами и журналом попыток.',
      context:
        'После смены статуса заявки нужно отправить уведомление. Если внешний сервис не отвечает, основной запрос не должен его ждать. Отправку можно вынести в очередь и сохранять результат каждой попытки.',
      approach: [
        'Проверить доступ и сохранить событие вместе с заданием отправки.',
        'Забирать задания фоновым обработчиком и записывать результат отправки.',
        'Ограничить число повторов и увеличивать задержку между ними.',
      ],
      decision:
        'Первую очередь можно хранить в PostgreSQL. Нужно исключить одновременную обработку одной задачи и возвращать зависшие задания в работу. Отдельный брокер стоит добавлять под конкретные требования к нагрузке.',
      failure:
        'После тайм-аута провайдер уже мог принять сообщение. Чтобы повтор не создал дубль, нужна поддержка ключа идемпотентности на его стороне. Без неё остаётся риск повторной доставки.',
      outcome:
        'API подтверждает сохранение задания. Обработчик отправляет уведомление, а журнал показывает попытки и ошибки. Неудачное задание можно отправить повторно.',
      questions: [
        'Что именно подтверждает успешный ответ API?',
        'Как вернуть в работу задание после остановки обработчика?',
        'Что произойдёт при отправке сообщения до записи результата?',
      ],
      flow: ['Событие', 'API и очередь', 'Обработчик', 'Канал'],
    },
  ],
  en: [
    {
      slug: 'requests',
      number: '01',
      title: 'Requests through a bot',
      category: 'Bots and workflows',
      summary:
        'A bot concept for collecting a request: description, contact details and confirmation.',
      context:
        'A customer sends their description and contact details in separate messages. Someone on the team has to collect them into a request and assign an owner. The bot should collect those details step by step and save the request.',
      approach: [
        'Collect the description and contact details in steps, then ask the customer to confirm.',
        'Store the conversation state and request so a restart does not lose entered details.',
        'Add commands to assign an owner and update the status.',
      ],
      decision:
        'Start with request management inside the bot. Add a dashboard if the team needs to search long lists or make bulk updates.',
      failure:
        'A second confirmation must not create another request. Link the confirmed conversation to its request and discard repeated event IDs. If the notification fails, retry only the notification.',
      outcome:
        'The customer receives a request number. The team sees the description, contact details, owner and status in one record.',
      questions: [
        'How would an unfinished conversation recover after a restart?',
        'How is a repeated event different from a new, similar enquiry?',
        'What happens when a request is saved but its notification fails?',
      ],
      flow: ['Conversation', 'Validation', 'Request', 'Notification'],
    },
    {
      slug: 'catalog',
      number: '02',
      title: 'Catalog imports',
      category: 'Data and integrations',
      summary:
        'An import concept that brings supplier prices and fields into one format and lists errors separately.',
      context:
        'Suppliers use different field names, price formats and units. A shared catalog needs a common structure while retaining a reference to the original data.',
      approach: [
        'Define shared fields and an adapter for each source.',
        'Validate prices, currencies and units; retain the original record for investigation.',
        'Update valid entries and collect problematic rows in an import report.',
      ],
      decision:
        'Use the supplier and item code as the record key. Update the existing entry on each import. Similar product names alone are not a reason to merge records.',
      failure:
        'Report missing or invalid prices and retain the previous value and date. Do not delete items just because they are absent from an incomplete export.',
      outcome:
        'The catalog has consistent fields, with a source and update date for each entry. Errors are listed separately while valid rows are processed.',
      questions: [
        'Why is a product name insufficient for identifying duplicates?',
        'How would you distinguish a missing price from a zero price?',
        'What remains in the catalog after an incomplete export?',
      ],
      flow: ['Sources', 'Adapters', 'Validation', 'Catalog'],
    },
    {
      slug: 'delivery',
      number: '03',
      title: 'A notification queue',
      category: 'APIs and background jobs',
      summary:
        'A background delivery concept with a queue, retries and an attempt log.',
      context:
        'A request status change needs to trigger a notification. The original request should not wait for an unavailable provider. A queue can handle delivery and record the result of each attempt.',
      approach: [
        'Check access and store the event with a delivery job.',
        'Let a background worker claim jobs and record delivery results.',
        'Limit retries and increase the delay between attempts.',
      ],
      decision:
        'The first queue can use PostgreSQL. Workers must not claim the same job at once, and stalled jobs need to return to the queue. Add a separate broker when specific load requirements call for it.',
      failure:
        'After a timeout, the provider may already have accepted the message. Preventing duplicates requires idempotency key support on its side. Without it, a retry can cause a second delivery.',
      outcome:
        'The API confirms that a job was saved. A worker sends the notification, and the log shows attempts and errors. Failed jobs can be retried.',
      questions: [
        'What does a successful API response actually confirm?',
        'How would a job recover after its worker stops?',
        'What if a message is sent before its result is recorded?',
      ],
      flow: ['Event', 'API and queue', 'Worker', 'Channel'],
    },
  ],
};
