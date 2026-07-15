export const paths = Object.freeze({
  root: "/",
  painel: "/painel",
  agenda: "/agenda",
  pacientes: "/pacientes",
  paciente: (id: string) => `/pacientes/${id}`,
  profissionais: "/profissionais",
  configuracoes: "/configuracoes",
  caixa: "/caixa",
  relatorio: "/relatorio",
  protocolosGmfm: "/protocolos/gmfm",
  organizacao: "/organizacao",
  buscar: "/buscar",

  auth: {
    root: "/auth",
    login: "/auth/login",
    loginLink: "/auth/login-link",
    signup: "/auth/signup",
    logout: "/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/alterar-senha",
  },

  api: {
    acceptInvitation: (invitationId: string) =>
      `/api/accept-invitation/${invitationId}`,
  },
});
