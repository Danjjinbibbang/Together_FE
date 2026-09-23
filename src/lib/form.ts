import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { getFieldErrors } from '@/api/client'

/**
 * 서버가 내려준 400 검증 에러를 폼 입력란에 그대로 꽂는다.
 *
 * 백엔드가 `errors`를 `{ 요청 바디 필드명: 메시지 }` 맵으로 주고(claude 컨텍스트 §14),
 * 폼 필드명을 요청 바디와 같은 이름으로 맞춰뒀기 때문에 변환 없이 대응된다.
 *
 * 그래서 클라이언트에 zod 같은 스키마를 따로 두지 않았다 — 검증 규칙을 양쪽에 두 벌
 * 유지하면 반드시 어긋난다. 프론트는 즉시 걸러낼 수 있는 것(필수값, 숫자 범위)만 보고
 * 최종 판정은 서버에 맡긴다.
 *
 * @returns 한 건이라도 필드에 꽂았으면 true. false면 호출부가 토스트로 알려야 한다.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  /** 폼에 실제로 존재하는 필드명. 없는 이름에 setError하면 문구가 어디에도 안 뜬다. */
  knownFields: readonly Path<T>[],
) {
  const fieldErrors = getFieldErrors(error)
  let applied = false

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (!knownFields.includes(field as Path<T>)) continue
    setError(field as Path<T>, { type: 'server', message })
    applied = true
  }

  return applied
}

/**
 * "300,000원" · "300000" → 300000 / 빈 값이나 숫자가 아니면 NaN.
 * 사용자는 콤마와 "원"을 섞어 치는데 서버는 number를 받는다.
 */
export function parseWon(input: string) {
  const digits = input.replace(/[^0-9]/g, '')
  return digits === '' ? Number.NaN : Number(digits)
}
