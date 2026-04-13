import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Bot } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { config } from '../config.js'
import { formatVacancy } from '../formatters/vacancy.js'
import { formatResume } from '../formatters/resume.js'
import { formatEvent } from '../formatters/event.js'
import { enqueueSend } from '../utils/sendQueue.js'
import { messageStore } from './moderation.js'

interface WebhookPayload {
  type: string
  table: string
  record: Record<string, unknown>
  schema: string
}

type EntityType = 'vacancy' | 'resume' | 'event'
const VALID_TABLES = new Set<EntityType>(['vacancy', 'resume', 'event'])

const TYPE_CHAR_MAP: Record<EntityType, string> = {
  vacancy: 'v',
  resume: 's',
  event: 'e',
}

export async function webhookHandler(
  bot: Bot,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization
  if (authHeader !== `Bearer ${config.webhookSecret}`) {
    reply.code(401).send({ error: 'Unauthorized' })
    return
  }

  const payload = request.body as WebhookPayload

  if (!payload || !payload.table || !payload.record) {
    reply.code(400).send({ error: 'Invalid payload' })
    return
  }

  const table = payload.table as EntityType
  if (!VALID_TABLES.has(table)) {
    reply.code(400).send({ error: `Unknown table: ${payload.table}` })
    return
  }

  const record = payload.record
  if (record.status !== 'pending') {
    reply.code(200).send({ ok: true, skipped: true })
    return
  }

  const entityId = record.id as string
  const typeChar = TYPE_CHAR_MAP[table]

  let messageText: string
  try {
    switch (table) {
      case 'vacancy':
        messageText = formatVacancy(record as never)
        break
      case 'resume':
        messageText = formatResume(record as never)
        break
      case 'event':
        messageText = formatEvent(record as never)
        break
    }
  } catch (e) {
    console.error(`Failed to format ${table} ${entityId}:`, e)
    reply.code(500).send({ error: 'Formatting failed' })
    return
  }

  const keyboard = new InlineKeyboard()
    .text('✅ Одобрить', `ap:${typeChar}:${entityId}`)
    .text('❌ Отклонить', `rj:${typeChar}:${entityId}`)

  enqueueSend(async () => {
    try {
      const sent = await bot.api.sendMessage(
        config.moderatorChatId,
        messageText,
        {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        },
      )
      messageStore.set(`${sent.chat.id}:${sent.message_id}`, messageText)
    } catch (e) {
      console.error(
        `Failed to send ${table} ${entityId} to moderator group:`,
        e,
      )
    }
  })

  reply.code(200).send({ ok: true })
}
