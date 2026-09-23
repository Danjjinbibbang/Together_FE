import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 조건부 className 조합 + Tailwind 클래스 충돌 해소.
 * variant로 만든 기본 클래스를 호출부의 className이 덮어쓸 수 있게 해준다.
 * (예: <Button className="w-auto" /> → 기본 w-full이 제거됨)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
