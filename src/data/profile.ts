import resume from '../../content/resume-draft.json';
import type { Lang } from './content';

export const contacts = [
  { id: 'telegram', label: 'Telegram', value: '@huteex', href: 'https://t.me/huteex', icon: 'telegram' },
  { id: 'email', label: 'Email', value: 'kalashnikov78ru@gmail.com', href: 'mailto:kalashnikov78ru@gmail.com', icon: 'mail' },
  { id: 'github', label: 'GitHub', value: 'huteeex', href: 'https://github.com/huteeex', icon: 'github' },
] as const;

export function getProfile(lang: Lang) {
  const blocks = resume.languages[lang].blocks;
  return {
    name: blocks.find(block => block.kind === 'name')?.text || 'huteeex',
    role: blocks.find(block => block.kind === 'role')?.text || 'Backend Developer',
  };
}
