export const paths = Object.freeze({
  root: "/",
  dashboard: "/dashboard",
  agenda: "/agenda",
  pacientes: "/pacientes",
  paciente: (id: string) => `/pacientes/${id}`,
  profissionais: "/profissionais",
  caixa: "/caixa",
  organizacao: "/organizacao",
  planos: "/planos",
  plataforma: "/plataforma",
  configuracoes: "/configuracoes",
  perfil: "/perfil",
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

  avaliacaoPublica: {
    root: "/r",
    byToken: (token: string) => `/r/${token}`,
    byProtocol: (token: string, protocolId: string) =>
      `/r/${token}/${protocolId}`,
  },

  anamnese: {
    root: "/anamnese",
    /** Workspace: `/anamnese/anamnese-to` */
    byId: (formId: string) => `/anamnese/${formId}`,
  },

  api: {
    acceptInvitation: (invitationId: string) =>
      `/api/accept-invitation/${invitationId}`,
    stripeWebhook: "/api/stripe/webhook",
  },
});
