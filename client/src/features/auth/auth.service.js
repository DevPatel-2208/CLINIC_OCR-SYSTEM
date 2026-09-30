import { authApi } from '@/services'

export const authService = {
  login: (data) => authApi.login(data),
  register: (data) => authApi.register(data),
  getMe: () => authApi.getMe(),
}
