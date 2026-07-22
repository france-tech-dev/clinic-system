export const paths = Object.freeze({
  root: "/",
  painel: "/painel",
  agenda: "/agenda",
  pacientes: "/pacientes",
  paciente: (id: string) => `/pacientes/${id}`,
  profissionais: "/profissionais",
  caixa: "/caixa",
  organizacao: "/organizacao",
  buscar: "/buscar",
  configuracoes: "/configuracoes",
  /** Portal do responsável (Role.CLIENT) — em evolução. */
  portal: "/portal",

  auth: {
    root: "/auth",
    login: "/auth/login",
    loginLink: "/auth/login-link",
    signup: "/auth/signup",
    logout: "/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
  },

  avaliacoes: {
    root: "/avaliacoes",
    /** Workspace de uma avaliação: `/avaliacoes/gmfm-88` */
    byId: (avaliacaoId: string) => `/avaliacoes/${avaliacaoId}`,
  },

  api: {
    acceptInvitation: (invitationId: string) =>
      `/api/accept-invitation/${invitationId}`,
  },
});
