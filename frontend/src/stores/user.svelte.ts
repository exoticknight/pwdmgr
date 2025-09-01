interface UserState {
  dbPath: string
}

export const userState = $state<UserState>({
  dbPath: '',
})
