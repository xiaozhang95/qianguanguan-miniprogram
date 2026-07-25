export const BillType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
} as const

export type BillType = (typeof BillType)[keyof typeof BillType]

export const BillTypeLabel: Record<BillType, string> = {
  [BillType.INCOME]: '收入',
  [BillType.EXPENSE]: '支出'
}

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const RoleLabel: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '管理员',
  [Role.ADMIN]: '管理员',
  [Role.USER]: '普通用户'
}

export const UserStatus = {
  ENABLED: 1,
  DISABLED: 0
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ENABLED]: '启用',
  [UserStatus.DISABLED]: '禁用'
}

export const Colors = {
  theme: '#1677ff',
  income: '#22c55e',
  expense: '#ef4444',
  balance: '#1677ff',
  border: '#f0f0f0',
  text: '#1d1d1d',
  textSecondary: '#666666',
  textLight: '#999999',
  bg: '#f5f5f5',
  white: '#ffffff'
} as const

export const ResponseCode = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  NETWORK_ERROR: 0
} as const
