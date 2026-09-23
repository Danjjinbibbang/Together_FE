import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useId } from 'react'

import { cn } from '@/lib/cn'

const control = cva(
  'w-full bg-surface font-semibold text-ink outline-none placeholder:font-medium placeholder:text-[#B7C0C9]',
  {
    variants: {
      emphasis: {
        /** 일반 입력 — 회색 테두리 */
        normal: 'border-[1.5px] border-border',
        /** 강조 입력 — 파란 테두리 (초대코드, 닉네임) */
        focused: 'border-[1.5px] border-primary',
      },
      align: {
        left: 'text-left',
        /** 초대코드처럼 가운데 정렬 + 자간 강조 */
        code: 'text-center text-lg font-extrabold tracking-[3px]',
      },
    },
    defaultVariants: { emphasis: 'normal', align: 'left' },
  },
)

interface FieldShellProps {
  label?: ReactNode
  helper?: ReactNode
  /** 검증 실패 문구. 있으면 helper 대신 이쪽이 보인다. */
  error?: ReactNode
  htmlFor?: string
  errorId?: string
  className?: string
  children: ReactNode
}

/** label + control + helper/error 조합. Input/Textarea가 공유한다. */
function FieldShell({
  label,
  helper,
  error,
  htmlFor,
  errorId,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('mb-5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-muted mb-2 block text-[13px] font-bold"
        >
          {label}
        </label>
      )}
      {children}
      {/*
        에러가 있으면 helper를 덮는다 — 둘 다 보이면 어느 쪽을 고쳐야 하는지 흐려진다.
        role="alert"라 스크린리더가 입력 직후 읽어준다.
      */}
      {error ? (
        <p id={errorId} role="alert" className="text-danger mt-2 text-xs">
          {error}
        </p>
      ) : (
        helper && (
          <p className="text-muted mt-2.5 text-center text-xs">{helper}</p>
        )
      )}
    </div>
  )
}

/**
 * ComponentPropsWithRef를 쓰는 이유: React 19부터 함수 컴포넌트가 ref를 일반 prop으로 받는다.
 * forwardRef 없이 {...props}로 흘려보내면 되고, react-hook-form의 register()가 그대로 붙는다.
 */
export interface TextFieldProps
  extends
    Omit<ComponentPropsWithRef<'input'>, 'size'>,
    VariantProps<typeof control> {
  label?: ReactNode
  helper?: ReactNode
  /** 검증 실패 문구 (react-hook-form의 errors.<field>?.message) */
  error?: ReactNode
  wrapperClassName?: string
}

export function TextField({
  label,
  helper,
  error,
  emphasis,
  align,
  className,
  wrapperClassName,
  id,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <FieldShell
      label={label}
      helper={helper}
      error={error}
      htmlFor={inputId}
      errorId={errorId}
      className={wrapperClassName}
    >
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          control({ emphasis, align }),
          'rounded-[14px] px-4 py-3.5 text-[15px]',
          // 에러일 때 테두리로도 알린다 — 색만으로 구분되지 않도록 문구가 함께 뜬다
          error && 'border-danger',
          className,
        )}
        {...props}
      />
    </FieldShell>
  )
}

export interface TextAreaFieldProps extends ComponentPropsWithRef<'textarea'> {
  label?: ReactNode
  /** 우측 하단 글자수 표시 (예: "78 / 최소 30자") */
  counter?: ReactNode
  error?: ReactNode
  wrapperClassName?: string
}

export function TextAreaField({
  label,
  counter,
  error,
  className,
  wrapperClassName,
  id,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <FieldShell
      label={label}
      error={error}
      htmlFor={textareaId}
      className={wrapperClassName}
    >
      <textarea
        id={textareaId}
        className={cn(
          control({ emphasis: 'normal' }),
          'min-h-40 resize-none rounded-2xl p-4 text-sm leading-7 font-normal',
          className,
        )}
        {...props}
      />
      {counter && (
        <p className="text-muted mt-1.5 text-right text-[11px]">{counter}</p>
      )}
    </FieldShell>
  )
}
