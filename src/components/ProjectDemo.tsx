import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Transition } from 'motion/react';
import '../styles/demos.css';

type Language = 'ru' | 'en';
type DemoKind = 'requests' | 'catalog' | 'delivery';

export interface ProjectDemoProps {
  kind: DemoKind;
  lang: Language;
  expanded?: boolean;
}

const copy = {
  ru: {
    sample: 'Демо · вымышленные данные',
    local: 'Локальное демо · без отправки',
    requests: {
      label: 'Демонстрация обработки заявки',
      title: 'Новая заявка',
      caption: 'Бот для заявок',
      message: 'Хочу обсудить небольшой проект.',
      ready: 'Сообщение готово',
      saved: 'Заявка № 004 создана',
      savedDetail: 'Сохранена в списке обращений',
      create: 'Создать заявку',
      reset: 'Попробовать ещё раз',
      announcement: 'Демонстрационная заявка номер 004 создана локально. Ничего не отправлено.',
    },
    catalog: {
      label: 'Демонстрация проверки и нормализации данных',
      sourceA: 'Источник A',
      sourceB: 'Источник B',
      itemA: 'Настольная лампа',
      itemB: 'Керамическая ваза',
      price: 'цена',
      error: 'Буква вместо цифры',
      heading: 'После обработки',
      item: 'Товар',
      amount: 'Цена, ₽',
      review: 'Проверить',
      summary: '1 готово · 1 требует проверки',
      process: 'Обработать',
      reset: 'Вернуть исходные данные',
      announcement: 'Обработаны два демонстрационных товара. Цена лампы приведена к числовому формату. В цене вазы обнаружена буква; значение оставлено пустым для проверки.',
    },
    delivery: {
      label: 'Демонстрация очереди и доставки события',
      source: 'Событие',
      queue: 'Очередь',
      target: 'Получатель',
      receipt: 'Квитанция доставки',
      event: 'Заявка создана',
      idle: 'Готово к запуску',
      queued: 'В очереди',
      sending: 'Передаём событие',
      delivered: 'Доставлено',
      start: 'Запустить доставку',
      repeat: 'Повторить',
      working: 'Выполняется…',
      announcement: 'Демонстрационное событие доставлено локально. Запросы во внешние сервисы не выполнялись.',
    },
  },
  en: {
    sample: 'Demo · fictional data',
    local: 'Local demo · nothing is sent',
    requests: {
      label: 'Request processing demonstration',
      title: 'New request',
      caption: 'Request bot',
      message: 'I have a small project in mind.',
      ready: 'Message is ready',
      saved: 'Request no. 004 created',
      savedDetail: 'Saved to the request list',
      create: 'Create request',
      reset: 'Try again',
      announcement: 'Demo request number 004 created locally. Nothing was sent.',
    },
    catalog: {
      label: 'Data validation and normalization demonstration',
      sourceA: 'Source A',
      sourceB: 'Source B',
      itemA: 'Desk lamp',
      itemB: 'Ceramic vase',
      price: 'price',
      error: 'Letter instead of digit',
      heading: 'After processing',
      item: 'Item',
      amount: 'Price, RUB',
      review: 'Review',
      summary: '1 ready · 1 needs review',
      process: 'Process data',
      reset: 'Restore source data',
      announcement: 'Two demo items processed. The lamp price was normalized to a number. A letter was found in the vase price, so its value was left empty for review.',
    },
    delivery: {
      label: 'Event queue and delivery demonstration',
      source: 'Event',
      queue: 'Queue',
      target: 'Recipient',
      receipt: 'Delivery receipt',
      event: 'Request created',
      idle: 'Ready to start',
      queued: 'Queued',
      sending: 'Sending event',
      delivered: 'Delivered',
      start: 'Run delivery',
      repeat: 'Run again',
      working: 'Working…',
      announcement: 'Demo event delivered locally. No requests were made to external services.',
    },
  },
} as const;

function ArrowIcon() {
  return <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function RepeatIcon() {
  return <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12.5 6A4.7 4.7 0 1 0 12 11M12.5 2.5V6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CheckIcon({ reduced }: { reduced: boolean }) {
  return <svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><motion.path d="m4 9 3.2 3.2L14 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 0.25, delay: reduced ? 0 : 0.1 }} /></svg>;
}

function RequestScene({ lang, reduced, spring }: { lang: Language; reduced: boolean; spring: Transition }) {
  const [created, setCreated] = useState(false);
  const t = copy[lang].requests;

  return <>
    <div className="demo-request-stack">
      <div className="demo-paper-back" aria-hidden="true" />
      <motion.div className="demo-request-paper" initial={false} animate={{ rotate: created && !reduced ? 0 : -2 }} transition={spring}>
        <div className="demo-request-header">
          <span className="demo-assistant-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m5 13 14-8-4 15-4-6-6-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m11 14 8-9" stroke="currentColor" strokeWidth="1.5" /></svg></span>
          <div><strong>{t.title}</strong><span>{t.caption}</span></div>
          <span className="demo-request-dot" aria-hidden="true" />
        </div>
        <div className="demo-message"><span>{t.message}</span><span className="demo-message-time" aria-hidden="true">10:42 <span>✓✓</span></span></div>
        <div className="demo-request-response">
          <AnimatePresence mode="wait" initial={false}>
            {created ? <motion.div className="demo-confirmation" key="created" initial={{ opacity: 0, y: reduced ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
              <span className="demo-check"><CheckIcon reduced={reduced} /></span>
              <span><strong>{t.saved}</strong><small>{t.savedDetail}</small></span>
            </motion.div> : <motion.div className="demo-ready" key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.1 }}><span aria-hidden="true">↳</span> {t.ready}</motion.div>}
          </AnimatePresence>
        </div>
        <motion.button type="button" className={`demo-button${created ? ' demo-button-secondary' : ''}`} onClick={() => setCreated(!created)} whileTap={reduced ? undefined : { scale: 0.98 }}>
          {created ? t.reset : t.create}{created ? <RepeatIcon /> : <ArrowIcon />}
        </motion.button>
      </motion.div>
    </div>
    <p className="demo-sr-only" aria-live="polite" aria-atomic="true">{created ? t.announcement : ''}</p>
  </>;
}

function CatalogScene({ lang, reduced, spring }: { lang: Language; reduced: boolean; spring: Transition }) {
  const [processed, setProcessed] = useState(false);
  const t = copy[lang].catalog;

  return <div className="demo-catalog-workspace">
    <div className="demo-catalog-documents">
      <AnimatePresence mode="wait" initial={false}>
        {!processed ? <motion.div className="demo-source-pair" key="source" initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : -6 }} transition={spring}>
          <div className="demo-source-sheet demo-source-sheet-first">
            <div className="demo-source-caption"><span className="demo-document-icon" aria-hidden="true" />{t.sourceA}</div>
            <div className="demo-source-name">{t.itemA}</div>
            <div className="demo-source-value">1 290 <span>₽</span></div>
            <div className="demo-paper-lines" aria-hidden="true"><i /><i /></div>
          </div>
          <div className="demo-source-sheet demo-source-sheet-second">
            <div className="demo-source-caption"><span className="demo-document-icon" aria-hidden="true" />{t.sourceB}</div>
            <div className="demo-source-name">{t.itemB}</div>
            <div className="demo-source-value">12<span className="demo-invalid-character">O</span>0 <span>₽</span></div>
            <div className="demo-source-error"><span aria-hidden="true">!</span>{t.error}</div>
          </div>
        </motion.div> : <motion.div className="demo-table-paper" key="result" initial={{ opacity: 0, y: reduced ? 0 : 9, rotate: reduced ? 0 : 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 5 }} transition={spring}>
          <div className="demo-table-title"><span>{t.heading}</span><span className="demo-mini-check"><CheckIcon reduced={reduced} /></span></div>
          <table className="demo-data-table">
            <thead><tr><th scope="col">{t.item}</th><th scope="col">{t.amount}</th></tr></thead>
            <tbody>
              <tr><td>{t.itemA}</td><td className="demo-valid-price">1290.00</td></tr>
              <tr><td>{t.itemB}</td><td className="demo-review-price"><span aria-hidden="true">-</span> <span>{t.review}</span></td></tr>
            </tbody>
          </table>
          <div className="demo-table-summary"><span aria-hidden="true" />{t.summary}</div>
        </motion.div>}
      </AnimatePresence>
    </div>
    <motion.button type="button" className={`demo-button demo-catalog-button${processed ? ' demo-button-secondary' : ''}`} onClick={() => setProcessed(!processed)} whileTap={reduced ? undefined : { scale: 0.98 }}>
      {processed ? t.reset : t.process}{processed ? <RepeatIcon /> : <ArrowIcon />}
    </motion.button>
    <p className="demo-sr-only" aria-live="polite" aria-atomic="true">{processed ? t.announcement : ''}</p>
  </div>;
}

function DeliveryScene({ lang, reduced, spring }: { lang: Language; reduced: boolean; spring: Transition }) {
  const [step, setStep] = useState(0);
  const t = copy[lang].delivery;
  const busy = step === 1 || step === 2;
  const status = [t.idle, t.queued, t.sending, t.delivered][step];

  useEffect(() => {
    if (step !== 1 && step !== 2) return;
    const timer = window.setTimeout(() => setStep(step + 1), step === 1 ? 850 : 1100);
    return () => window.clearTimeout(timer);
  }, [step]);

  return <div className="demo-delivery-workspace">
    <div className="demo-route" aria-hidden="true">
      <svg className="demo-route-lines" viewBox="0 0 288 50" preserveAspectRatio="none" fill="none">
        <path d="M39 25h210" stroke="#c1cec6" strokeWidth="1.5" strokeDasharray="3 4" />
        <motion.path d="M39 25h105" stroke="#708b7c" strokeWidth="2" initial={false} animate={{ pathLength: step >= 2 ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.45 }} />
        <motion.path d="M144 25h105" stroke="#708b7c" strokeWidth="2" initial={false} animate={{ pathLength: step === 3 ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.45 }} />
      </svg>
      <div className="demo-route-stop">
        <motion.div className={`demo-route-node demo-route-source${step > 0 ? ' demo-route-node-active' : ''}`} animate={{ y: !reduced && step === 1 ? -3 : 0 }} transition={spring}><svg viewBox="0 0 24 24" fill="none"><path d="M6 4.5h8l4 4v11H6v-15Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M14 4.5v4h4M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></motion.div>
        <span>{t.source}</span>
      </div>
      <div className="demo-route-stop">
        <motion.div className={`demo-route-node demo-route-queue${step === 1 || step === 2 ? ' demo-route-node-active' : ''}`} animate={{ y: !reduced && step === 2 ? -3 : 0 }} transition={spring}><span /><span /><span /></motion.div>
        <span>{t.queue}</span>
      </div>
      <div className="demo-route-stop">
        <motion.div className={`demo-route-node demo-route-target${step === 3 ? ' demo-route-node-done' : ''}`} animate={{ scale: !reduced && step === 3 ? 1.06 : 1 }} transition={spring}>{step === 3 ? <CheckIcon reduced={reduced} /> : <svg viewBox="0 0 24 24" fill="none"><path d="M5 8.5 12 5l7 3.5v8L12 20l-7-3.5v-8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="m5 8.5 7 3.5 7-3.5M12 12v8M8.5 6.7l7 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>}</motion.div>
        <span>{t.target}</span>
      </div>
    </div>
    <motion.div className="demo-receipt" initial={false} animate={{ rotate: reduced ? 0 : step === 3 ? -1 : 1 }} transition={spring}>
      <div className="demo-receipt-heading"><span>{t.receipt}</span><span className="demo-receipt-number">004</span></div>
      <div className="demo-receipt-rule" aria-hidden="true" />
      <div className="demo-receipt-body"><span>{t.event}</span><span className={`demo-delivery-status demo-delivery-status-${step}`}><span aria-hidden="true" />{status}</span></div>
      <div className="demo-receipt-barcode" aria-hidden="true"><i /><span>LOCAL / 004</span></div>
    </motion.div>
    <motion.button type="button" className={`demo-button demo-delivery-button${step === 3 ? ' demo-button-secondary' : ''}`} onClick={() => setStep(1)} disabled={busy} aria-busy={busy} whileTap={reduced || busy ? undefined : { scale: 0.98 }}>
      {busy ? t.working : step === 3 ? t.repeat : t.start}{step === 3 ? <RepeatIcon /> : <ArrowIcon />}
    </motion.button>
    <p className="demo-sr-only" aria-live="polite" aria-atomic="true">{step === 3 ? t.announcement : step > 0 ? status : ''}</p>
  </div>;
}

export default function ProjectDemo({ kind, lang, expanded = false }: ProjectDemoProps) {
  const reduced = Boolean(useReducedMotion());
  const captionId = useId();
  const spring: Transition = reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 28, mass: 0.8 };

  return <div className={`project-demo demo-${kind}${expanded ? ' demo-expanded' : ''}`} data-demo-kind={kind} role="group" aria-label={copy[lang][kind].label} aria-describedby={captionId}>
    <div className="demo-scene">
      {kind === 'requests' && <RequestScene lang={lang} reduced={reduced} spring={spring} />}
      {kind === 'catalog' && <CatalogScene lang={lang} reduced={reduced} spring={spring} />}
      {kind === 'delivery' && <DeliveryScene lang={lang} reduced={reduced} spring={spring} />}
    </div>
    <span className="demo-caption" id={captionId}>{kind === 'delivery' ? copy[lang].local : copy[lang].sample}</span>
  </div>;
}
